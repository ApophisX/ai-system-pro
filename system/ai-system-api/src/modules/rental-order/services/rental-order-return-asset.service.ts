import { Injectable, Logger, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { DataSource, In, QueryDeepPartialEntity } from 'typeorm';
import { RentalOrderRepository } from '../repositories';
import { OutputRentalOrderDto, ReturnAssetDto } from '../dto';
import { RentalOrderSupportService } from './rental-order-support.service';
import { EvidenceAuditStatus, EvidenceSubmitterType, EvidenceType, RentalOrderUsageStatus } from '../enums';
import { RentalOrderEntity, RentalOrderEvidenceEntity } from '../entities';
import { RentalOrderJobService } from '../jobs/services';
import { MessageNotificationService } from '@/modules/base/message/services';
import { PaymentEntity } from '@/modules/base/payment/entities';
import { InstallmentStatus, PaymentType } from '@/modules/base/payment/enums';
import dayjs from 'dayjs';

/**
 * 承租方归还资产服务
 *
 * 业务流程：
 * 1. 校验用户必须是承租方
 * 2. 校验订单使用状态必须为「使用中」（useageStatus=IN_USE，含 overdueStatus=OVERDUE_USE/OVERDUE，不含 OVERDUE_FEE_PAID 因该状态在归还后支付产生）
 * 3. 校验订单尚未提交归还（useageStatus 不为 RETURNED_PENDING 或 RETURNED）
 * 4. 在事务中完成：
 *    - 更新订单 useageStatus 为 RETURNED_PENDING（已归还待确认）
 *    - overdueStatus 保持不变
 *    - 固定归还时间为承租方提交归还的时间（returnedAt），作为计费停止时间
 *    - 创建承租方归还证据（凭证图片和说明）
 * 5. 若有未支付的续租账单，取消续租申请并取消续租支付倒计时
 * 6. 添加24小时自动确认归还的超时任务
 *
 * 前置条件：
 * - 订单 useageStatus = IN_USE（含逾期订单 overdueStatus=OVERDUE_USE/OVERDUE；OVERDUE_FEE_PAID 在归还后支付产生，不在此列）
 * - 当前用户为承租方
 * - 订单尚未提交归还
 *
 * 后置状态：
 * - 订单 useageStatus 变为 RETURNED_PENDING（已归还待确认）
 * - 归还时间已固定为提交归还的时间
 * - 24小时后若出租方未操作，系统将自动确认归还
 */
@Injectable()
export class RentalOrderReturnAssetService {
  private readonly logger = new Logger(RentalOrderReturnAssetService.name);

  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly support: RentalOrderSupportService,
    private readonly dataSource: DataSource,
    private readonly rentalOrderJobService: RentalOrderJobService,
    private readonly messageNotificationService: MessageNotificationService,
  ) {}

  /**
   * 承租方归还资产
   *
   * @param lesseeId 承租方用户ID
   * @param orderId 订单ID
   * @param dto 归还资产请求DTO
   * @returns 更新后的订单信息
   */
  async returnAsset(lesseeId: string, orderId: string, dto: ReturnAssetDto): Promise<OutputRentalOrderDto> {
    // 1. 查询订单（需包含 payments、assetSnapshot、rentalPlanSnapshot）
    const order = await this.orderRepo.findById(orderId, {
      relations: { payments: true, assetSnapshot: true, rentalPlanSnapshot: true },
    });

    // 2. 权限校验：必须是承租方
    if (order.lesseeId !== lesseeId) {
      throw new ForbiddenException('只有承租方可以归还资产');
    }

    // 3. 状态校验：订单必须是使用中状态
    if (!order.isInUse) {
      throw new BadRequestException(
        `仅「使用中」、「超时使用」或「逾期」状态的订单可归还资产，当前订单状态为「${order.statusLabel}」`,
      );
    }

    // 4. 幂等性校验：尚未提交归还
    if (
      order.useageStatus === RentalOrderUsageStatus.RETURNED_PENDING ||
      order.useageStatus === RentalOrderUsageStatus.RETURNED
    ) {
      throw new ConflictException('订单已提交归还，请勿重复操作');
    }

    // 5. 在事务中完成：更新订单状态、归还时间、创建证据
    await this.dataSource.transaction(async manager => {
      const now = new Date();

      // 5.1 更新订单：使用状态、归还时间
      const updateData: QueryDeepPartialEntity<RentalOrderEntity> = {
        useageStatus: RentalOrderUsageStatus.RETURNED_PENDING, // 使用状态：已归还待确认
        returnedAt: now, // 固定归还时间为提交归还的时间，作为计费停止时间
        returnedSubmittedAt: now, // 归还提交时间
      };

      await manager.update(RentalOrderEntity, order.id, updateData);

      // 5.2 创建承租方归还证据（凭证图片和说明）
      const evidence = manager.getRepository(RentalOrderEvidenceEntity).create({
        rentalOrderId: order.id,
        rentalOrderNo: order.orderNo,
        submitterId: lesseeId,
        submitterType: EvidenceSubmitterType.LESSEE,
        evidenceType: EvidenceType.ASSET_RETURN,
        evidenceUrls: dto.evidenceUrls,
        description: dto.description || '承租方提交归还申请',
        relatedOrderStatus: order.useageStatus, // 使用状态变为 RETURNED_PENDING
        auditStatus: EvidenceAuditStatus.PENDING, // 归还证据待审核
      });
      await manager.save(RentalOrderEvidenceEntity, evidence);
      this.logger.log(
        `订单 ${order.orderNo} 承租方已提交归还申请，凭证已保存: evidenceUrlsCount=${dto.evidenceUrls?.length || 0}`,
      );

      const cancelableRenewalPaymentStatuses = [
        InstallmentStatus.PENDING,
        InstallmentStatus.DUE,
        InstallmentStatus.OVERDUE,
      ];
      // 5.3 取消未支付的续租账单（归还后不再允许续租，需关闭续租申请）
      const unpaidRenewalPayments = order.renewalPaymentList.filter(
        p => !p.isPaid && cancelableRenewalPaymentStatuses.includes(p.status),
      );
      if (unpaidRenewalPayments.length > 0) {
        await manager.update(
          PaymentEntity,
          { id: In(unpaidRenewalPayments.map(p => p.id)) },
          { status: InstallmentStatus.CANCELED },
        );
        this.logger.log(
          `订单 ${order.orderNo} 归还时已取消未支付续租账单: count=${unpaidRenewalPayments.length}, paymentIds=${unpaidRenewalPayments.map(p => p.id).join(',')}`,
        );
      }

      this.logger.log(
        `订单 ${order.orderNo} 承租方已提交归还申请，归还时间: ${now.toISOString()}，使用状态更新为 RETURNED_PENDING`,
      );
    });

    // 6. 取消续租支付超时任务（归还后未支付续租已作废，倒计时不再需要）
    const unpaidRenewalPayments = order.paymentList.filter(
      p =>
        p.paymentType === PaymentType.RENEWAL &&
        !p.isPaid &&
        [InstallmentStatus.PENDING, InstallmentStatus.DUE, InstallmentStatus.OVERDUE].includes(p.status),
    );
    if (unpaidRenewalPayments.length > 0) {
      setImmediate(() => {
        unpaidRenewalPayments.forEach(p => {
          this.rentalOrderJobService.cancelRenewalPaymentTimeoutJob(p.id).catch(err => {
            this.logger.error(
              `取消续租支付超时任务失败: orderNo=${order.orderNo}, paymentId=${p.id}`,
              err instanceof Error ? err.message : '未知错误',
            );
          });
        });
      });
    }

    // 7. 添加24小时自动确认归还的超时任务
    // 如果出租方在24小时内未进行任何操作，系统将自动确认归还
    const timeoutAt = dayjs().add(24, 'hour').toDate();
    setImmediate(() => {
      this.rentalOrderJobService.addReturnConfirmTimeoutJob(orderId, order.orderNo, timeoutAt).catch(err => {
        this.logger.error(
          `添加归还确认超时任务失败: orderId=${orderId}, orderNo=${order.orderNo}, error=${err instanceof Error ? err.message : '未知错误'}`,
        );
      });
    });

    // 7.1 发送归还申请消息通知出租方
    setImmediate(() => {
      this.messageNotificationService.notifyOrderReturnRequested(order).catch(err => {
        this.logger.error(
          `发送归还申请消息失败: orderId=${orderId}, orderNo=${order.orderNo}`,
          err instanceof Error ? err.stack : err,
        );
      });
    });

    // 8. 查询并返回更新后的订单
    const result = await this.orderRepo.findById(orderId, {
      relations: { payments: true, assetSnapshot: true, rentalPlanSnapshot: true },
    });
    return this.support.toOutputRentalOrderDto(result);
  }
}
