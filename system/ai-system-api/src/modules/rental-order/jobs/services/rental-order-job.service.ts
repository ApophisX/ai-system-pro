/**
 * 租赁订单任务服务
 *
 * 提供添加订单相关任务到队列的服务
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  RENTAL_ORDER_PAYMENT_TIMEOUT_QUEUE,
  RENTAL_ORDER_INSTALLMENT_OVERDUE_QUEUE,
  RENTAL_ORDER_RENTAL_OVERDUE_QUEUE,
  RENTAL_ORDER_DEPOSIT_DEDUCTION_TIMEOUT_QUEUE,
  RENTAL_ORDER_CANCEL_CONFIRM_TIMEOUT_QUEUE,
  RENTAL_ORDER_RETURN_CONFIRM_TIMEOUT_QUEUE,
} from '../constants/rental-order-queue.constant';
import dayjs from 'dayjs';
import {
  PaymentTimeoutJobData,
  InstallmentOverdueJobData,
  RentalOverdueJobData,
  DepositDeductionTimeoutJobData,
  CancelConfirmTimeoutJobData,
  ReturnConfirmTimeoutJobData,
} from '../type';

@Injectable()
export class RentalOrderJobService {
  private readonly logger = new Logger(RentalOrderJobService.name);

  constructor(
    @InjectQueue(RENTAL_ORDER_PAYMENT_TIMEOUT_QUEUE)
    private readonly paymentTimeoutQueue: Queue<PaymentTimeoutJobData>,
    @InjectQueue(RENTAL_ORDER_INSTALLMENT_OVERDUE_QUEUE)
    private readonly installmentOverdueQueue: Queue<InstallmentOverdueJobData>,
    @InjectQueue(RENTAL_ORDER_RENTAL_OVERDUE_QUEUE)
    private readonly rentalOverdueQueue: Queue<RentalOverdueJobData>,
    @InjectQueue(RENTAL_ORDER_DEPOSIT_DEDUCTION_TIMEOUT_QUEUE)
    private readonly depositDeductionTimeoutQueue: Queue<DepositDeductionTimeoutJobData>,
    @InjectQueue(RENTAL_ORDER_CANCEL_CONFIRM_TIMEOUT_QUEUE)
    private readonly cancelConfirmTimeoutQueue: Queue<CancelConfirmTimeoutJobData>,
    @InjectQueue(RENTAL_ORDER_RETURN_CONFIRM_TIMEOUT_QUEUE)
    private readonly returnConfirmTimeoutQueue: Queue<ReturnConfirmTimeoutJobData>,
  ) {
    //
  }

  /**
   * 添加订单超时未支付任务
   *
   * @param orderId 订单ID
   * @param orderNo 订单号
   * @param paymentExpiredAt 支付过期时间
   */
  async addPaymentTimeoutJob(orderId: string, orderNo: string, paymentExpiredAt: Date): Promise<void> {
    const delay = dayjs(paymentExpiredAt).diff(dayjs(), 'millisecond');

    if (delay <= 0) {
      this.logger.warn(
        `订单支付超时时间已过: orderNo=${orderNo}, paymentExpiredAt=${dayjs(paymentExpiredAt).format('YYYY-MM-DD HH:mm:ss')}`,
      );
      return;
    }

    await this.paymentTimeoutQueue.add(
      'payment-timeout',
      {
        orderId,
        orderNo,
        paymentExpiredAt,
      },
      {
        delay,
        jobId: `payment-timeout-${orderId}`,
        removeOnComplete: {
          age: 24 * 3600, // 保留24小时
          count: 1000,
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // 失败任务保留7天
        },
      },
    );

    this.logger.log(`添加支付超时任务成功: orderNo=${orderNo}, 延迟=${delay}毫秒`);
  }

  /**
   * 取消订单超时未支付任务
   *
   * @param orderId 订单ID
   */
  async cancelPaymentTimeoutJob(orderId: string): Promise<void> {
    const job = await this.paymentTimeoutQueue.getJob(`payment-timeout-${orderId}`);

    if (job) {
      await job.remove();
      this.logger.log(`已取消订单支付超时任务: orderId=${orderId}`);
    }
  }

  /**
   * 添加订单分期逾期任务
   *
   * @param paymentId 支付记录ID
   * @param orderId 订单ID
   * @param orderNo 订单号
   * @param payableTime 应付时间
   */
  async addInstallmentOverdueJob(
    paymentId: string,
    orderId: string,
    orderNo: string,
    payableTime: Date,
  ): Promise<void> {
    const delay = dayjs(payableTime).diff(dayjs(), 'millisecond');

    if (delay <= 0) {
      this.logger.warn(
        `分期应付时间已过: paymentId=${paymentId}, payableTime=${dayjs(payableTime).format('YYYY-MM-DD HH:mm:ss')}`,
      );
      return;
    }

    await this.installmentOverdueQueue.add(
      'installment-overdue',
      {
        paymentId,
        orderId,
        orderNo,
        payableTime,
      },
      {
        delay,
        jobId: `installment-overdue-${paymentId}`,
        removeOnComplete: {
          age: 24 * 3600, // 保留24小时
          count: 1000,
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // 失败任务保留7天
        },
      },
    );

    this.logger.log(`添加分期逾期任务成功: paymentId=${paymentId}, orderNo=${orderNo}, 延迟=${delay}毫秒`);
  }

  /**
   * 取消订单分期逾期任务
   *
   * @param paymentId 支付记录ID
   */
  async cancelInstallmentOverdueJob(paymentId: string): Promise<void> {
    const job = await this.installmentOverdueQueue.getJob(`installment-overdue-${paymentId}`);

    if (job) {
      await job.remove();
      this.logger.log(`已取消分期逾期任务: paymentId=${paymentId}`);
    }
  }

  /**
   * 添加订单支付逾期任务（租期到期未归还）
   *
   * @param orderId 订单ID
   * @param orderNo 订单号
   * @param endDate 租期结束日期
   */
  async addRentalOverdueJob(orderId: string, orderNo: string, endDate: Date): Promise<void> {
    const delay = dayjs(endDate).diff(dayjs(), 'millisecond');

    if (delay <= 0) {
      this.logger.warn(`租期结束时间已过: orderNo=${orderNo}, endDate=${dayjs(endDate).format('YYYY-MM-DD HH:mm:ss')}`);
      return;
    }

    await this.rentalOverdueQueue.add(
      'rental-overdue',
      { orderId, orderNo, endDate },
      {
        delay,
        jobId: `rental-overdue-${orderId}`,
        removeOnComplete: {
          age: 24 * 3600, // 保留24小时
          count: 1000,
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // 失败任务保留7天
        },
      },
    );

    this.logger.log(`添加租赁逾期任务成功: orderNo=${orderNo}, 延迟=${delay}毫秒`);
  }

  /**
   * 添加续租支付超时任务
   *
   * 续租生成的 Payment 若超时未支付，仅关闭该 Payment，不取消订单
   */
  async addRenewalPaymentTimeoutJob(
    paymentId: string,
    orderId: string,
    orderNo: string,
    expiredAt: Date,
  ): Promise<void> {
    const delay = dayjs(expiredAt).diff(dayjs(), 'millisecond');
    if (delay <= 0) {
      this.logger.warn(
        `续租支付超时时间已过: orderNo=${orderNo}, paymentId=${paymentId}, expiredAt=${dayjs(expiredAt).format('YYYY-MM-DD HH:mm:ss')}`,
      );
      return;
    }
    await this.paymentTimeoutQueue.add(
      'renewal-payment-timeout',
      { orderId, orderNo, paymentExpiredAt: expiredAt, paymentId },
      {
        delay,
        jobId: `renewal-payment-timeout-${paymentId}`,
        removeOnComplete: { age: 24 * 3600, count: 1000 },
        removeOnFail: { age: 7 * 24 * 3600 },
      },
    );
    this.logger.log(`添加续租支付超时任务成功: orderNo=${orderNo}, paymentId=${paymentId}, 延迟=${delay}毫秒`);
  }

  /**
   * 取消订单支付逾期任务（租期到期未归还）
   *
   * @param orderId 订单ID
   */
  async cancelRentalOverdueJob(orderId: string): Promise<void> {
    try {
      const job = await this.rentalOverdueQueue.getJob(`rental-overdue-${orderId}`);
      if (job) {
        await job.remove();
        this.logger.log(`已取消租赁逾期任务: orderId=${orderId}`);
      }
    } catch {
      // 任务不存在或已被消费，忽略（逾期检测已改为定时扫描，此方法主要用于兼容历史数据）
    }
  }

  /**
   * 添加押金扣款超时任务
   *
   * 当扣款申请提交后，如果承租方在72小时内未响应（未同意亦未拒绝），
   * 则触发平台介入审核
   *
   * @param deductionId 扣款申请ID
   * @param deductionNo 扣款单号
   * @param orderId 订单ID
   * @param orderNo 订单号
   * @param depositId 押金ID
   * @param timeoutAt 超时时间（申请提交后72小时）
   */
  async addDepositDeductionTimeoutJob(
    deductionId: string,
    deductionNo: string,
    orderId: string,
    orderNo: string,
    depositId: string,
    timeoutAt: Date,
  ): Promise<void> {
    const delay = dayjs(timeoutAt).diff(dayjs(), 'millisecond');

    if (delay <= 0) {
      this.logger.warn(
        `押金扣款超时时间已过: deductionNo=${deductionNo}, timeoutAt=${dayjs(timeoutAt).format('YYYY-MM-DD HH:mm:ss')}`,
      );
      return;
    }

    await this.depositDeductionTimeoutQueue.add(
      'deposit-deduction-timeout',
      {
        deductionId,
        deductionNo,
        orderId,
        orderNo,
        depositId,
        timeoutAt,
      },
      {
        delay,
        jobId: `deposit-deduction-timeout-${deductionId}`,
        removeOnComplete: {
          age: 24 * 3600, // 保留24小时
          count: 1000,
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // 失败任务保留7天
        },
      },
    );

    this.logger.log(`添加押金扣款超时任务成功: deductionNo=${deductionNo}, orderNo=${orderNo}, 延迟=${delay}毫秒`);
  }

  /**
   * 取消押金扣款超时任务
   *
   * 当扣款申请被处理（用户同意/拒绝或平台审核）时，取消超时任务
   *
   * @param deductionId 扣款申请ID
   */
  async cancelDepositDeductionTimeoutJob(deductionId: string): Promise<void> {
    const job = await this.depositDeductionTimeoutQueue.getJob(`deposit-deduction-timeout-${deductionId}`);

    if (job) {
      await job.remove();
      this.logger.log(`已取消押金扣款超时任务: deductionId=${deductionId}`);
    }
  }

  /**
   * 添加取消确认超时任务
   *
   * 当承租方申请取消订单（已支付租金和押金）时，如果出租方在24小时内未操作，
   * 则自动发起退款退押金
   *
   * @param orderId 订单ID
   * @param orderNo 订单号
   * @param timeoutAt 超时时间（申请提交后24小时）
   */
  async addCancelConfirmTimeoutJob(orderId: string, orderNo: string, timeoutAt: Date): Promise<void> {
    const delay = dayjs(timeoutAt).diff(dayjs(), 'millisecond');

    if (delay <= 0) {
      this.logger.warn(
        `取消确认超时时间已过: orderNo=${orderNo}, timeoutAt=${dayjs(timeoutAt).format('YYYY-MM-DD HH:mm:ss')}`,
      );
      return;
    }

    await this.cancelConfirmTimeoutQueue.add(
      'cancel-confirm-timeout',
      {
        orderId,
        orderNo,
        timeoutAt,
      },
      {
        delay,
        jobId: `cancel-confirm-timeout-${orderId}`,
        removeOnComplete: {
          age: 24 * 3600, // 保留24小时
          count: 1000,
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // 失败任务保留7天
        },
      },
    );

    this.logger.log(`添加取消确认超时任务成功: orderNo=${orderNo}, 延迟=${delay}毫秒`);
  }

  /**
   * 取消取消确认超时任务
   *
   * 当出租方处理取消申请（同意/拒绝）或承租方撤销取消申请时，取消超时任务
   *
   * @param orderId 订单ID
   */
  async cancelCancelConfirmTimeoutJob(orderId: string): Promise<void> {
    const job = await this.cancelConfirmTimeoutQueue.getJob(`cancel-confirm-timeout-${orderId}`);

    if (job) {
      await job.remove();
      this.logger.log(`已取消取消确认超时任务: orderId=${orderId}`);
    }
  }

  /**
   * 添加归还确认超时任务
   *
   * 当承租方提交归还申请时，如果出租方在24小时内未操作，
   * 则自动确认归还，订单归还状态进入「已归还」
   *
   * @param orderId 订单ID
   * @param orderNo 订单号
   * @param timeoutAt 超时时间（提交归还后24小时）
   */
  async addReturnConfirmTimeoutJob(orderId: string, orderNo: string, timeoutAt: Date): Promise<void> {
    const delay = dayjs(timeoutAt).diff(dayjs(), 'millisecond');

    if (delay <= 0) {
      this.logger.warn(
        `归还确认超时时间已过: orderNo=${orderNo}, timeoutAt=${dayjs(timeoutAt).format('YYYY-MM-DD HH:mm:ss')}`,
      );
      return;
    }

    await this.returnConfirmTimeoutQueue.add(
      'return-confirm-timeout',
      {
        orderId,
        orderNo,
        timeoutAt,
      },
      {
        delay,
        jobId: `return-confirm-timeout-${orderId}`,
        removeOnComplete: {
          age: 24 * 3600, // 保留24小时
          count: 1000,
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // 失败任务保留7天
        },
      },
    );

    this.logger.log(`添加归还确认超时任务成功: orderNo=${orderNo}, 延迟=${delay}毫秒`);
  }

  /**
   * 取消归还确认超时任务
   *
   * 当出租方处理归还申请（确认归还/发起异议）时，取消超时任务
   *
   * @param orderId 订单ID
   */
  async cancelReturnConfirmTimeoutJob(orderId: string): Promise<void> {
    const job = await this.returnConfirmTimeoutQueue.getJob(`return-confirm-timeout-${orderId}`);

    if (job) {
      await job.remove();
      this.logger.log(`已取消归还确认超时任务: orderId=${orderId}`);
    }
  }

  /**
   * 取消续租支付超时任务
   *
   * 当订单归还、取消等场景下，未支付的续租账单不再有效时，取消其倒计时任务
   *
   * @param paymentId 续租支付账单ID
   */
  async cancelRenewalPaymentTimeoutJob(paymentId: string): Promise<void> {
    try {
      const job = await this.paymentTimeoutQueue.getJob(`renewal-payment-timeout-${paymentId}`);
      if (job) {
        await job.remove();
        this.logger.log(`已取消续租支付超时任务: paymentId=${paymentId}`);
      }
    } catch {
      // 任务不存在或已被消费，忽略
    }
  }
}
