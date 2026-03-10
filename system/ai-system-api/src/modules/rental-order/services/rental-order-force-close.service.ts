import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { RentalOrderRepository } from '../repositories';
import { RentalOrderEntity, RentalOrderEvidenceEntity, DepositDeductionEntity } from '../entities';
import { AssetInventoryService } from '@/modules/asset/services/asset-inventory.service';
import {
  RentalOrderStatus,
  RentalOrderUsageStatus,
  EvidenceSubmitterType,
  EvidenceAuditStatus,
  EvidenceType,
  DepositDeductionStatus,
} from '../enums';
import { ForceCloseOrderDto, OutputRentalOrderDto } from '../dto';
import { PaymentEntity } from '@/modules/base/payment/entities';
import { InstallmentStatus } from '@/modules/base/payment/enums';
import { RentalOrderSupportService } from './rental-order-support.service';
import { RentalOrderJobService } from '../jobs/services';
import { MessageNotificationService } from '@/modules/base/message/services';

/**
 * 租赁订单强制关闭服务
 *
 * 出租方在特殊场景下强制关闭在租订单。
 * 适用状态：已收货、使用中（含待归还、已归还待确认）。
 * 处理结果：
 * - 订单状态 → CLOSED
 * - 未支付/待支付的账单 → CLOSED
 * - 未支付的押金 → CANCELED
 * - 已支付/已冻结的押金 → 退款/解冻给承租方
 * - 已支付的账单 → 保持不变（不退款）
 * - 资产实例 → 解绑，状态变更为可用
 */
@Injectable()
export class RentalOrderForceCloseService {
  private readonly logger = new Logger(RentalOrderForceCloseService.name);

  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly dataSource: DataSource,
    private readonly support: RentalOrderSupportService,
    private readonly rentalOrderJobService: RentalOrderJobService,
    private readonly messageNotificationService: MessageNotificationService,
    private readonly assetInventoryService: AssetInventoryService,
  ) {
    //
  }

  /**
   * 出租方强制关闭在租订单
   * @param userId 用户ID（须为订单出租方）
   * @param orderId 订单ID
   * @param dto 强制关闭请求 DTO（必须包含凭证）
   * @returns 更新后的订单 DTO
   */
  async forceCloseOrder(userId: string, orderId: string, dto: ForceCloseOrderDto): Promise<OutputRentalOrderDto> {
    const order = await this.orderRepo.findById(orderId, {
      relations: { payments: { paymentRecords: true }, deposits: { deductions: true } },
    });

    if (order.lessorId !== userId) {
      throw new ForbiddenException('只有出租方可以强制关闭订单');
    }

    if (order.status === RentalOrderStatus.CLOSED) {
      this.logger.log(`订单已强制关闭，跳过处理: orderNo=${order.orderNo}, orderId=${orderId}`);
      const updatedOrder = await this.orderRepo.findById(orderId, {
        relations: { payments: true, deposits: true, assetSnapshot: true, rentalPlanSnapshot: true },
      });
      return this.support.toOutputRentalOrderDto(updatedOrder);
    }

    const allowedUsageStatuses = [
      RentalOrderUsageStatus.IN_USE,
      RentalOrderUsageStatus.WAIT_RETURN,
      RentalOrderUsageStatus.RETURNED_PENDING,
    ];
    if (order.status !== RentalOrderStatus.RECEIVED || !allowedUsageStatuses.includes(order.useageStatus)) {
      throw new BadRequestException(
        `仅「已收货、使用中」状态的订单可强制关闭，当前订单状态：${order.statusLabel}，使用状态：${order.useageStatusLabel}`,
      );
    }

    return this.dataSource.transaction(async manager => {
      const closedAt = new Date();
      const closeReason = dto.description?.trim() || '出租方强制关闭在租订单';

      // 1. 关闭未支付/待支付的租金账单
      const unpaidPaymentStatuses = [
        InstallmentStatus.GENERATING,
        InstallmentStatus.PENDING,
        InstallmentStatus.DUE,
        InstallmentStatus.OVERDUE,
      ];
      const unpaidPayments = order.paymentList.filter(p => !p.isPaid && unpaidPaymentStatuses.includes(p.status));
      if (unpaidPayments.length > 0) {
        await manager.update(
          PaymentEntity,
          { id: In(unpaidPayments.map(p => p.id)) },
          { status: InstallmentStatus.CLOSED },
        );
        this.logger.log(`强制关闭：已关闭未支付账单: orderNo=${order.orderNo}, count=${unpaidPayments.length}`);
      }

      // 2. 取消未确认的押金扣除申请
      const cancelableDeductionStatuses = [
        DepositDeductionStatus.PENDING_USER_CONFIRM,
        DepositDeductionStatus.PENDING_AUDIT,
        DepositDeductionStatus.PLATFORM_APPROVED,
      ];
      const cancelableDeductions = await manager.find(DepositDeductionEntity, {
        where: { orderId: order.id, status: In(cancelableDeductionStatuses) },
        select: ['id'],
      });
      const cancelledDeductionIds = cancelableDeductions.map(d => d.id);
      if (cancelledDeductionIds.length > 0) {
        await manager.update(
          DepositDeductionEntity,
          { id: In(cancelledDeductionIds) },
          {
            status: DepositDeductionStatus.CANCELLED,
            cancelReason: '订单强制关闭，自动取消未确认的押金扣除申请',
            cancelAt: closedAt,
          },
        );
        this.logger.log(
          `强制关闭：已取消押金扣除申请: orderNo=${order.orderNo}, count=${cancelledDeductionIds.length}`,
        );
      }

      // 3. 处理押金：未支付→已取消，已支付/已冻结→退款/解冻给承租方
      const depositRefundReason = '订单强制关闭，押金退款/解冻';
      const depositRefundProcessed = await this.support.processDepositRefund(order, depositRefundReason, manager);
      if (depositRefundProcessed) {
        this.logger.log(`强制关闭：押金退款/解冻已处理: orderNo=${order.orderNo}`);
      }

      // 4. 保存凭证（必须）
      const evidence = manager.create(RentalOrderEvidenceEntity, {
        rentalOrderId: order.id,
        rentalOrderNo: order.orderNo,
        submitterId: userId,
        submitterType: EvidenceSubmitterType.LESSOR,
        evidenceType: EvidenceType.ORDER_FORCE_CLOSE,
        evidenceUrls: dto.evidenceUrls,
        description: dto.description || closeReason,
        relatedOrderStatus: order.useageStatus,
        auditStatus: EvidenceAuditStatus.APPROVED,
        auditedAt: closedAt,
      });
      await manager.save(RentalOrderEvidenceEntity, evidence);
      this.logger.log(`强制关闭：凭证已保存: orderNo=${order.orderNo}, evidenceUrlsCount=${dto.evidenceUrls.length}`);

      // 5. 解绑资产实例，使资产恢复可用
      await this.assetInventoryService.unbindFromOrder(order.id, manager);
      this.logger.log(`强制关闭：资产实例已解绑: orderNo=${order.orderNo}, inventoryId=${order.inventoryId || '无'}`);

      // 6. 更新订单状态为已关闭
      await manager.update(
        RentalOrderEntity,
        { id: order.id },
        {
          status: RentalOrderStatus.CLOSED,
          cancelReason: closeReason,
          canceledAt: closedAt,
          inventoryUnboundAt: closedAt,
        },
      );

      this.logger.log(
        `订单已强制关闭: orderNo=${order.orderNo}, orderId=${orderId}, userId=${userId}, reason=${closeReason}`,
      );

      // 7. 取消订单相关定时任务（事务外异步）
      this.support.cancelOrderRelatedJobs(order.id);

      // 8. 取消押金扣除超时任务（事务外异步）
      if (cancelledDeductionIds.length > 0) {
        setImmediate(() => {
          for (const deductionId of cancelledDeductionIds) {
            this.rentalOrderJobService.cancelDepositDeductionTimeoutJob(deductionId).catch(err => {
              this.logger.error(
                `取消押金扣款超时任务失败: deductionId=${deductionId}, error=${err instanceof Error ? err.message : '未知错误'}`,
              );
            });
          }
        });
      }

      const closedOrder = await this.support.findUpdatedOrderAndToDto(manager, order.id);

      // 9. 发送消息通知承租方
      const orderEntity = await manager.findOne(RentalOrderEntity, { where: { id: order.id } });
      if (orderEntity) {
        setImmediate(() => {
          this.messageNotificationService.notifyOrderCanceled(orderEntity, closeReason, 'lessee').catch(err => {
            this.logger.error(`发送订单强制关闭消息失败: orderNo=${order.orderNo}`, err);
          });
        });
      }

      return closedOrder;
    });
  }
}
