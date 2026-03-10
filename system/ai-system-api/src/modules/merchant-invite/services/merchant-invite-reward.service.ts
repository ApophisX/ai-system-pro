import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import Decimal from 'decimal.js';
import { MerchantInviteRelationRepository, MerchantInviteRewardRepository } from '../repositories';
import { MerchantInviteRewardType, MerchantInviteRewardStatus } from '../enums';
import { MerchantInviteRegisterService } from './merchant-invite-register.service';
import { MERCHANT_INVITE_CONFIG } from '../constants/merchant-invite.constant';
import { RentalOrderEntity } from '@/modules/rental-order/entities/rental-order.entity';
import { RentalOrderStatus } from '@/modules/rental-order/enums';
import { RefundRecordEntity } from '@/modules/base/payment/entities/refund-record.entity';
import { RefundStatus, PaymentType } from '@/modules/base/payment/enums';

/**
 * 商户邀请奖励服务
 *
 * 负责：真实交易分润创建、7 天观察期释放/回收、月度封顶校验
 */
@Injectable()
export class MerchantInviteRewardService {
  private readonly logger = new Logger(MerchantInviteRewardService.name);

  constructor(
    private readonly rewardRepo: MerchantInviteRewardRepository,
    private readonly registerService: MerchantInviteRegisterService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 订单完成时创建分润记录（幂等）
   *
   * 条件：lessor 存在 relation、platformFee > 0、该 orderId 尚无 REBATE
   */
  async createRebateOnOrderCompleted(orderId: string): Promise<void> {
    const order = await this.dataSource.manager.findOne(RentalOrderEntity, {
      where: { id: orderId },
      select: ['id', 'lessorId', 'platformFee', 'status'],
    });

    if (!order || order.status !== RentalOrderStatus.COMPLETED) {
      this.logger.warn(`订单不存在或未完成，跳过分润: orderId=${orderId}`);
      return;
    }

    const relation = await this.registerService.getRelationByMerchantId(order.lessorId);
    if (!relation) {
      this.logger.debug(`lessor 无邀请关系，跳过分润: lessorId=${order.lessorId}`);
      return;
    }

    const platformFee = new Decimal(order.platformFee || 0).toNumber();
    if (platformFee <= 0) {
      this.logger.debug(`平台费为 0，跳过分润: orderId=${orderId}`);
      return;
    }

    // 幂等：已存在则跳过
    const existing = await this.rewardRepo.findByOrderIdAndType(orderId, MerchantInviteRewardType.REBATE);
    if (existing) {
      this.logger.debug(`分润记录已存在，跳过: orderId=${orderId}`);
      return;
    }

    const rebateAmount = Math.min(
      new Decimal(platformFee).mul(MERCHANT_INVITE_CONFIG.REBATE_RATE).toNumber(),
      MERCHANT_INVITE_CONFIG.REBATE_CAP_PER_ORDER,
    );

    const reward = this.rewardRepo.create({
      employeeId: relation.employeeId,
      merchantId: order.lessorId,
      type: MerchantInviteRewardType.REBATE,
      amount: rebateAmount.toFixed(2),
      status: MerchantInviteRewardStatus.PENDING,
      relatedOrderId: orderId,
    });
    await this.rewardRepo.save(reward);

    // 更新首单达标
    const isFirstOrder = await this.isLessorFirstCompletedOrder(order.lessorId, orderId);
    await this.registerService.updateFirstOrderIfNeeded(order.lessorId, isFirstOrder);

    this.logger.log(`分润记录已创建: orderId=${orderId}, employeeId=${relation.employeeId}, amount=${rebateAmount}`);
  }

  /**
   * 7 天内发生租金退款时，回收 PENDING 的分润
   */
  async revokeRebateOnRentRefund(orderId: string): Promise<void> {
    const reward = await this.rewardRepo.findByOrderIdAndType(orderId, MerchantInviteRewardType.REBATE);
    if (!reward || reward.status !== MerchantInviteRewardStatus.PENDING) return;

    reward.status = MerchantInviteRewardStatus.REVOKED;
    await this.rewardRepo.save(reward);
    this.logger.log(`分润已回收（租金退款）: orderId=${orderId}, rewardId=${reward.id}`);
  }

  /**
   * 定时任务：将超过 7 天的 PENDING 分润置为 RELEASED 或 REVOKED
   *
   * - 若该订单 7 天内发生过租金退款 → REVOKED
   * - 否则 → 校验月度封顶后 RELEASED
   */
  async processPendingRebates(): Promise<{ released: number; revoked: number }> {
    const observeDate = new Date();
    observeDate.setDate(observeDate.getDate() - MERCHANT_INVITE_CONFIG.REBATE_OBSERVE_DAYS);

    const pending = await this.rewardRepo.findPendingRebatesBefore(observeDate);
    let released = 0;
    let revoked = 0;

    for (const reward of pending) {
      const hasRentRefund = await this.hasRentRefundInObservePeriod(reward.relatedOrderId!, reward.createdAt);

      if (hasRentRefund) {
        reward.status = MerchantInviteRewardStatus.REVOKED;
        await this.rewardRepo.save(reward);
        revoked++;
      } else {
        const now = new Date();
        const monthlyReleased = await this.rewardRepo.sumReleasedRebateByEmployeeAndMonth(
          reward.employeeId,
          now.getFullYear(),
          now.getMonth() + 1,
        );
        const remaining = MERCHANT_INVITE_CONFIG.REBATE_CAP_MONTHLY - monthlyReleased;
        const amount = new Decimal(reward.amount).toNumber();

        if (remaining >= amount) {
          reward.status = MerchantInviteRewardStatus.RELEASED;
          reward.releasedAt = now;
          await this.rewardRepo.save(reward);
          released++;
        } else {
          this.logger.warn(
            `员工月度封顶已达，跳过发放: employeeId=${reward.employeeId}, amount=${amount}, remaining=${remaining}`,
          );
          // 仍保持 PENDING，下月再试（或可考虑部分发放，此处简化）
        }
      }
    }

    if (released > 0 || revoked > 0) {
      this.logger.log(`分润处理完成: released=${released}, revoked=${revoked}`);
    }
    return { released, revoked };
  }

  private async isLessorFirstCompletedOrder(lessorId: string, excludeOrderId: string): Promise<boolean> {
    const count = await this.dataSource.manager.count(RentalOrderEntity, {
      where: { lessorId, status: RentalOrderStatus.COMPLETED },
    });
    if (count !== 1) return false;
    const order = await this.dataSource.manager.findOne(RentalOrderEntity, {
      where: { lessorId, status: RentalOrderStatus.COMPLETED },
      select: ['id'],
    });
    return order?.id === excludeOrderId;
  }

  /**
   * 检查订单在创建后的观察期内是否发生租金退款
   */
  private async hasRentRefundInObservePeriod(orderId: string, rewardCreatedAt: Date): Promise<boolean> {
    const endAt = new Date(rewardCreatedAt);
    endAt.setDate(endAt.getDate() + MERCHANT_INVITE_CONFIG.REBATE_OBSERVE_DAYS);

    const refunds = await this.dataSource.manager
      .createQueryBuilder(RefundRecordEntity, 'r')
      .innerJoin('r.paymentRecord', 'pr')
      .where('r.orderId = :orderId', { orderId })
      .andWhere('r.status = :status', { status: RefundStatus.COMPLETED })
      .andWhere('pr.paymentType = :paymentType', { paymentType: PaymentType.RENTAL })
      .andWhere('r.refundedAt IS NOT NULL')
      .andWhere('r.refundedAt >= :start', { start: rewardCreatedAt })
      .andWhere('r.refundedAt <= :end', { end: endAt })
      .getCount();

    return refunds > 0;
  }
}
