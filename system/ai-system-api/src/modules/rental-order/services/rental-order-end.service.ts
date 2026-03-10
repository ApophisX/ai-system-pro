import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, In, QueryDeepPartialEntity } from 'typeorm';
import { RentalOrderRepository } from '../repositories';
import { RentalOrderEntity, RentalOrderEvidenceEntity, DepositDeductionEntity } from '../entities';
import { AssetInventoryEntity } from '@/modules/asset/entities';
import { OutputAssetInventoryDto } from '@/modules/asset/dto';
import { AssetInventoryService } from '@/modules/asset/services/asset-inventory.service';
import {
  RentalOrderStatus,
  EvidenceSubmitterType,
  EvidenceAuditStatus,
  EvidenceType,
  DepositDeductionStatus,
} from '../enums';
import { EndOrderDto, OutputRentalOrderDto } from '../dto';
import { PaymentEntity } from '@/modules/base/payment/entities';
import { InstallmentStatus } from '@/modules/base/payment/enums';
import { RentalOrderSupportService } from './rental-order-support.service';
import { RentalOrderJobService } from '../jobs/services';
import { MessageNotificationService } from '@/modules/base/message/services';
import { CreditEvents } from '@/modules/credit/events/credit.events';
import { CreditActorRole } from '@/modules/credit/enums';

/**
 * 租赁订单结束服务
 *
 * 出租方结束订单：关闭未支付账单、保存凭证、更新状态、取消定时任务
 * 押金处理：取消未确认的押金扣除、处理押金退款/解冻
 */
@Injectable()
export class RentalOrderEndService {
  private readonly logger = new Logger(RentalOrderEndService.name);

  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly dataSource: DataSource,
    private readonly support: RentalOrderSupportService,
    private readonly rentalOrderJobService: RentalOrderJobService,
    private readonly messageNotificationService: MessageNotificationService,
    private readonly eventEmitter: EventEmitter2,
    private readonly assetInventoryService: AssetInventoryService,
  ) {
    //
  }

  /**
   * 出租方结束订单
   * @param userId 用户ID
   * @param orderId 订单ID
   * @param dto 结束订单DTO
   * @returns 更新后的订单DTO
   */
  async endOrder(userId: string, orderId: string, dto?: EndOrderDto): Promise<OutputRentalOrderDto> {
    const order = await this.orderRepo.findById(orderId, {
      relations: { payments: { paymentRecords: true }, deposits: { deductions: true } },
    });

    if (order.lessorId !== userId) {
      throw new ForbiddenException('只有出租方可以结束订单');
    }

    if (!order.isReturned) {
      throw new BadRequestException(`订单状态不允许结束，当前状态：${order.statusLabel}。只有已归还的订单才能结束`);
    }

    if (order.status === RentalOrderStatus.COMPLETED) {
      this.logger.log(`订单已完成，跳过处理: orderNo=${order.orderNo}, orderId=${orderId}`);
      const updatedOrder = await this.orderRepo.findById(orderId, {
        relations: { payments: true, deposits: true, assetSnapshot: true, rentalPlanSnapshot: true },
      });
      return this.support.toOutputRentalOrderDto(updatedOrder);
    }

    return this.dataSource.transaction(async manager => {
      const completedAt = new Date();

      const unpaidPayments = order.paymentList.filter(
        p =>
          !p.isPaid &&
          [
            InstallmentStatus.GENERATING,
            InstallmentStatus.PENDING,
            InstallmentStatus.DUE,
            InstallmentStatus.OVERDUE,
          ].includes(p.status),
      );

      if (unpaidPayments.length > 0) {
        await manager.update(
          PaymentEntity,
          { id: In(unpaidPayments.map(p => p.id)) },
          { status: InstallmentStatus.CLOSED },
        );
        this.logger.log(`已关闭未支付的账单: orderNo=${order.orderNo}, unpaidPaymentsCount=${unpaidPayments.length}`);
      }

      // 取消未确认的押金扣除申请
      const cancelableDeductionStatuses = [
        DepositDeductionStatus.PENDING_USER_CONFIRM,
        DepositDeductionStatus.PENDING_AUDIT,
        DepositDeductionStatus.PLATFORM_APPROVED,
      ];

      // 先查询需要取消的押金扣除申请ID，用于后续取消定时任务
      const cancelableDeductions = await manager.find(DepositDeductionEntity, {
        where: { orderId: order.id, status: In(cancelableDeductionStatuses) },
        select: ['id'],
      });
      const cancelledDeductionIds = cancelableDeductions.map(d => d.id);

      // 批量更新押金扣除申请状态为已取消
      if (cancelledDeductionIds.length > 0) {
        await manager.update(
          DepositDeductionEntity,
          { id: In(cancelledDeductionIds) },
          {
            status: DepositDeductionStatus.CANCELLED,
            cancelReason: '订单结束，自动取消未确认的押金扣除申请',
            cancelAt: completedAt,
          },
        );
        this.logger.log(
          `订单结束，已取消未确认的押金扣除申请: orderNo=${order.orderNo}, cancelledCount=${cancelledDeductionIds.length}`,
        );
      }

      // 处理押金退款/解冻
      const depositRefundReason = '订单结束，押金退款/解冻';
      const depositRefundProcessed = await this.support.processDepositRefund(order, depositRefundReason, manager);
      if (depositRefundProcessed) {
        this.logger.log(`订单结束，押金退款/解冻已处理: orderNo=${order.orderNo}`);
      }

      if (dto?.description) {
        const evidence = manager.create(RentalOrderEvidenceEntity, {
          rentalOrderId: order.id,
          rentalOrderNo: order.orderNo,
          submitterId: userId,
          submitterType: EvidenceSubmitterType.LESSOR,
          evidenceType: EvidenceType.ORDER_COMPLETE,
          evidenceUrls: dto.evidenceUrls,
          description: dto.description,
          relatedOrderStatus: order.useageStatus,
          auditStatus: EvidenceAuditStatus.APPROVED,
          auditedAt: completedAt,
        });
        await manager.save(RentalOrderEvidenceEntity, evidence);
        this.logger.log(
          `订单结束，凭证已保存: orderNo=${order.orderNo}, evidenceUrlsCount=${dto.evidenceUrls?.length || 0}`,
        );
      }

      // 订单完结时保存资产实例快照，便于后续查询（仅当订单已绑定资产实例时）
      let inventorySnapshot: Omit<OutputAssetInventoryDto, 'order'> | undefined;
      if (order.inventoryId) {
        const inventory = await manager.findOne(AssetInventoryEntity, {
          where: { id: order.inventoryId },
          relations: { asset: true },
        });
        if (inventory) {
          inventorySnapshot = this.assetInventoryService.buildSnapshotForOrderComplete(inventory);
          this.logger.log(`订单结束，已保存资产实例快照: orderNo=${order.orderNo}, inventoryId=${order.inventoryId}`);
        } else {
          this.logger.warn(
            `订单结束，资产实例不存在，跳过快照保存: orderNo=${order.orderNo}, inventoryId=${order.inventoryId}`,
          );
        }
      }

      const updateData: QueryDeepPartialEntity<RentalOrderEntity> = {
        status: RentalOrderStatus.COMPLETED,
        completedAt,
      };
      if (inventorySnapshot) {
        // JSON 列存储，使用序列化后的纯对象绕过 TypeORM 深度类型校验
        (updateData as Record<string, unknown>).inventorySnapshot = JSON.parse(JSON.stringify(inventorySnapshot));
      }
      await manager.update(RentalOrderEntity, { id: order.id }, updateData);

      this.logger.log(`订单已结束: orderNo=${order.orderNo}, orderId=${orderId}, userId=${userId}`);

      // 取消订单相关的定时任务（在事务外异步执行）
      this.support.cancelOrderRelatedJobs(order.id);

      // 取消押金扣除超时任务（在事务外异步执行）
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

      const completedOrder = await this.support.findUpdatedOrderAndToDto(manager, order.id);

      // 发送订单完成消息通知
      const orderEntity = await manager.findOne(RentalOrderEntity, { where: { id: order.id } });
      if (orderEntity) {
        setImmediate(() => {
          this.messageNotificationService.notifyOrderCompleted(orderEntity).catch(err => {
            this.logger.error(`发送订单完成消息失败: orderNo=${order.orderNo}`, err);
          });
        });
      }

      // 发射信用事件：订单完成（承租方正面）
      setImmediate(() => {
        this.eventEmitter.emit(CreditEvents.ORDER_COMPLETED, {
          userId: order.lesseeId,
          actorRole: CreditActorRole.LESSEE,
          orderId: order.id,
          operatorType: 'system',
        });
      });

      return completedOrder;
    });
  }
}
