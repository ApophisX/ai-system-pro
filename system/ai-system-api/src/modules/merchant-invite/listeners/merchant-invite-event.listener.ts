import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreditEvents } from '@/modules/credit/events/credit.events';
import { PaymentEvents } from '@/modules/base/payment/events/payment.event';
import { MerchantInviteEvents } from '../events/merchant-invite.events';
import { MerchantInviteRegisterService, MerchantInviteRewardService } from '../services';
import { RentalOrderRepository } from '@/modules/rental-order/repositories';
import { UserRepository } from '@/modules/base/user/repositories';
import { UserType, EnterpriseVerificationStatus } from '@/modules/base/user/enums';

/**
 * 商户邀请事件监听器
 *
 * 监听：注册绑定、认证通过、订单完成、租金退款
 */
@Injectable()
export class MerchantInviteEventListener {
  private readonly logger = new Logger(MerchantInviteEventListener.name);

  constructor(
    private readonly registerService: MerchantInviteRegisterService,
    private readonly rewardService: MerchantInviteRewardService,
    private readonly orderRepo: RentalOrderRepository,
    private readonly userRepo: UserRepository,
  ) {}

  /**
   * 用户使用邀请码注册：绑定邀请关系
   */
  @OnEvent(MerchantInviteEvents.USER_REGISTERED_WITH_INVITE, { async: true })
  async handleUserRegisteredWithInvite(payload: { userId: string; inviteCode: string }) {
    try {
      const { userId, inviteCode } = payload ?? {};
      if (!userId || !inviteCode) return;
      await this.registerService.bindOnRegister(userId, inviteCode);
    } catch (error) {
      this.logger.error(
        `处理 USER_REGISTERED_WITH_INVITE 失败: userId=${payload?.userId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 用户企业认证通过：更新 relation 为 VERIFIED
   *
   * 仅当 userType=ENTERPRISE 且 enterpriseVerificationStatus=VERIFIED 时更新，
   * 个人实名认证不触发商户邀请 relation 更新
   */
  @OnEvent(MerchantInviteEvents.USER_VERIFIED, { async: true })
  async handleUserVerified(payload: { userId: string }) {
    try {
      const userId = payload?.userId;
      if (!userId) return;
      const user = await this.userRepo.findOne({ where: { id: userId } }).catch(() => null);
      if (
        !user ||
        user.userType !== UserType.ENTERPRISE ||
        user.enterpriseVerificationStatus !== EnterpriseVerificationStatus.VERIFIED
      ) {
        this.logger.debug(`USER_VERIFIED 忽略：用户非企业认证通过 userId=${userId}`);
        return;
      }
      await this.registerService.onUserVerified(userId);
    } catch (error) {
      this.logger.error(
        `处理 USER_VERIFIED 失败: userId=${payload?.userId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 订单完成：创建 PENDING 分润记录
   */
  @OnEvent(CreditEvents.ORDER_COMPLETED, { async: true })
  async handleOrderCompleted(payload: { orderId: string }) {
    try {
      const orderId = payload?.orderId;
      if (!orderId) {
        this.logger.warn('ORDER_COMPLETED 缺少 orderId，跳过');
        return;
      }
      await this.rewardService.createRebateOnOrderCompleted(orderId);
    } catch (error) {
      this.logger.error(
        `处理 ORDER_COMPLETED 失败: orderId=${payload?.orderId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 租金退款完成：回收 PENDING 分润
   *
   * REFUND_COMPLETED 的 event 含 orderNo，需查 orderId
   */
  @OnEvent(PaymentEvents.REFUND_COMPLETED, { async: true })
  async handleRefundCompleted(event: { orderNo?: string | null }) {
    try {
      const orderNo = event?.orderNo;
      if (!orderNo) {
        this.logger.warn('REFUND_COMPLETED 缺少 orderNo，跳过');
        return;
      }
      const order = await this.orderRepo.findByOrderNo(orderNo).catch(() => null);
      if (!order) {
        this.logger.warn(`未找到订单: orderNo=${orderNo}，跳过分润回收`);
        return;
      }
      await this.rewardService.revokeRebateOnRentRefund(order.id);
    } catch (error) {
      this.logger.error(
        `处理 REFUND_COMPLETED 失败: orderNo=${event?.orderNo}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
