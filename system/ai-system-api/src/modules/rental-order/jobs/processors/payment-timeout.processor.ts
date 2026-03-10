/**
 * 订单超时未支付处理器
 *
 * 处理订单创建后30分钟内未支付的订单，自动取消订单
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource, In } from 'typeorm';
import { RentalOrderRepository } from '../../repositories';
import { RentalOrderEntity } from '../../entities';
import { DepositStatus, RentalOrderStatus, RentalOrderPayStatus } from '../../enums';
import { RENTAL_ORDER_PAYMENT_TIMEOUT_QUEUE } from '../constants/rental-order-queue.constant';
import dayjs from 'dayjs';
import { PaymentTimeoutJobData } from '../type';
import { InstallmentStatus, PaymentType } from '@/modules/base/payment/enums';
import { DepositService } from '../../services';
import { PaymentEntity } from '@/modules/base/payment/entities';
import { MessageNotificationService } from '@/modules/base/message/services';
@Processor(RENTAL_ORDER_PAYMENT_TIMEOUT_QUEUE)
export class PaymentTimeoutProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentTimeoutProcessor.name);

  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly dataSource: DataSource,
    private readonly depositService: DepositService,
    private readonly messageNotificationService: MessageNotificationService,
  ) {
    super();
  }

  /**
   * 处理订单超时未支付
   */
  async process(job: Job<PaymentTimeoutJobData>): Promise<void> {
    const { orderId, orderNo, paymentExpiredAt, paymentId } = job.data;

    // 处理续租支付超时
    if (paymentId) {
      await this.processRenewalPaymentTimeout(paymentId, orderId, orderNo);
      return;
    }

    this.logger.log(`处理支付超时任务: orderNo=${orderNo}, orderId=${orderId}`);

    try {
      // 查询订单当前状态（包含支付记录和押金记录）
      const order = await this.orderRepo.findById(orderId, {
        relations: { payments: true, deposits: true },
      });

      if (!order) {
        this.logger.warn(`订单不存在: orderNo=${orderNo}, orderId=${orderId}`);
        return;
      }

      // 检查订单是否已经处理（已取消、已关闭、已支付等）
      // 注意：支付超时的订单状态为 CANCELED，payStatus 为 TIMEOUT
      if (
        order.status === RentalOrderStatus.CANCELED ||
        order.status === RentalOrderStatus.CLOSED ||
        order.status === RentalOrderStatus.PENDING_RECEIPT
      ) {
        this.logger.log(`订单已处理，跳过: orderNo=${orderNo}, status=${order.status}`);
        return;
      }

      // 检查订单是否已经支付（如果订单状态不是 CREATED 或支付状态不是 PENDING，说明可能已经支付）
      if (order.status !== RentalOrderStatus.CREATED || order.payStatus !== RentalOrderPayStatus.PENDING) {
        this.logger.log(
          `订单状态不是待支付，跳过处理: orderNo=${orderNo}, status=${order.status}, payStatus=${order.payStatus}`,
        );
        return;
      }

      // 检查是否已有已支付的支付记录（防止支付回调延迟导致的状态不一致）
      const hasPaidPayment = order.paymentList.some(p => p.isPaid);
      if (hasPaidPayment) {
        this.logger.log(`订单已有已支付的账单，跳过处理: orderNo=${orderNo}`);
        return;
      }

      // 检查支付过期时间是否已过
      const now = dayjs();
      const expiredAt = dayjs(paymentExpiredAt);

      if (now.isBefore(expiredAt)) {
        this.logger.log(`支付未过期: orderNo=${orderNo}, expiredAt=${expiredAt.format('YYYY-MM-DD HH:mm:ss')}`);
        return;
      }

      // 在事务中更新订单状态
      await this.dataSource.transaction(async manager => {
        // 重新查询订单，确保获取最新状态（使用悲观锁防止并发）
        const currentOrder = await manager.findOne(RentalOrderEntity, {
          where: { id: orderId },
          relations: { payments: true, deposits: true },
          lock: { mode: 'pessimistic_write' },
        });

        if (!currentOrder) {
          this.logger.warn(`订单不存在（事务内）: orderNo=${orderNo}, orderId=${orderId}`);
          return;
        }

        // 再次检查状态，防止并发问题
        // 注意：支付超时的订单状态为 CANCELED，payStatus 为 TIMEOUT
        if (
          currentOrder.status === RentalOrderStatus.CANCELED ||
          currentOrder.status === RentalOrderStatus.CLOSED ||
          currentOrder.status === RentalOrderStatus.PENDING_RECEIPT
        ) {
          this.logger.log(`订单状态已发生变化，跳过处理: orderNo=${orderNo}, status=${currentOrder.status}`);
          return;
        }

        // 再次检查订单状态是否为待支付
        if (
          currentOrder.status !== RentalOrderStatus.CREATED ||
          currentOrder.payStatus !== RentalOrderPayStatus.PENDING
        ) {
          this.logger.log(
            `订单状态不是待支付（事务内），跳过处理: orderNo=${orderNo}, status=${currentOrder.status}, payStatus=${currentOrder.payStatus}`,
          );
          return;
        }

        // 再次检查是否已有已支付的支付记录
        const currentHasPaidPayment = currentOrder.paymentList.some(p => p.isPaid);
        if (currentHasPaidPayment) {
          this.logger.log(`订单已有已支付的账单（事务内），跳过处理: orderNo=${orderNo}`);
          return;
        }

        // 如果有支付/免押的押金，则需要将押金解冻或退款
        if (Number(currentOrder.depositAmount) > 0 && currentOrder.isDepositFrozenOrPaid) {
          const deposits = currentOrder.deposits || [];
          await manager.update(RentalOrderEntity, { id: orderId }, { depositStatus: DepositStatus.REFUNDING });
          await this.depositService.handleDepositRefundOrUnfreeze(deposits, '支付超时，订单自动取消', manager);
          this.logger.log(`押金解冻或退款已处理: orderNo=${orderNo}, depositStatus=${currentOrder.depositStatus}`);
        }

        // 更新订单状态为已取消，支付状态为超时
        await manager.update(
          RentalOrderEntity,
          { id: orderId },
          {
            status: RentalOrderStatus.CANCELED, // 订单状态为已取消
            payStatus: RentalOrderPayStatus.TIMEOUT, // 支付状态为超时
            canceledAt: new Date(),
            cancelReason: '支付超时，订单自动取消',
          },
        );

        // 只取消未支付的账单（PENDING、GENERATING、DUE、OVERDUE状态），已支付的账单不应该被取消
        const unpaidPaymentStatuses = [
          InstallmentStatus.PENDING,
          InstallmentStatus.GENERATING,
          InstallmentStatus.DUE,
          InstallmentStatus.OVERDUE,
        ];
        await manager.update(
          PaymentEntity,
          {
            orderId,
            status: In(unpaidPaymentStatuses),
          },
          { status: InstallmentStatus.CANCELED },
        );

        this.logger.log(`支付超时任务处理完成: orderNo=${orderNo}, orderId=${orderId}`);
      });

      // 发送支付超时消息通知承租方
      const canceledOrder = await this.orderRepo.findById(orderId);
      if (canceledOrder) {
        await this.messageNotificationService.notifyPaymentTimeout(canceledOrder);
      }
    } catch (error) {
      this.logger.error(`支付超时任务处理失败: orderNo=${orderNo}`, error.stack);
      throw error;
    }
  }

  /**
   * 处理续租支付超时：仅关闭该 Payment，不取消订单
   */
  private async processRenewalPaymentTimeout(paymentId: string, orderId: string, orderNo: string): Promise<void> {
    this.logger.log(`处理续租支付超时: orderNo=${orderNo}, paymentId=${paymentId}`);

    try {
      await this.dataSource.transaction(async manager => {
        const payment = await manager.findOne(PaymentEntity, {
          where: { id: paymentId, orderId },
        });
        if (!payment) {
          this.logger.warn(`续租支付不存在或已处理: paymentId=${paymentId}`);
          return;
        }
        if (payment.status === InstallmentStatus.PAID) {
          this.logger.log(`续租支付已完成，跳过: paymentId=${paymentId}`);
          return;
        }
        if (![InstallmentStatus.PENDING, InstallmentStatus.DUE, InstallmentStatus.OVERDUE].includes(payment.status)) {
          this.logger.log(`续租支付状态已变更，跳过: paymentId=${paymentId}, status=${payment.status}`);
          return;
        }
        // await manager.update(PaymentEntity, { id: paymentId }, { status: InstallmentStatus.CLOSED });
        await manager.delete(PaymentEntity, {
          id: paymentId,
          paymentType: PaymentType.RENEWAL,
          status: InstallmentStatus.PENDING,
        });
        this.logger.log(`续租支付已超时关闭: orderNo=${orderNo}, paymentId=${paymentId}`);
      });
    } catch (error) {
      this.logger.error(`续租支付超时处理失败: orderNo=${orderNo}, paymentId=${paymentId}`, error.stack);
      throw error;
    }
  }
}
