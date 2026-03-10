/**
 * 订单分期逾期处理器
 *
 * 处理分期付款账单的逾期，将账单状态更新为逾期
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { PaymentRepository } from '@/modules/base/payment/repositories';
import { PaymentEntity } from '@/modules/base/payment/entities';
import { InstallmentStatus } from '@/modules/base/payment/enums';
import { RENTAL_ORDER_INSTALLMENT_OVERDUE_QUEUE } from '../constants/rental-order-queue.constant';
import dayjs from 'dayjs';
import { InstallmentOverdueJobData } from '../type';

@Processor(RENTAL_ORDER_INSTALLMENT_OVERDUE_QUEUE)
export class InstallmentOverdueProcessor extends WorkerHost {
  private readonly logger = new Logger(InstallmentOverdueProcessor.name);

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async process(job: Job<InstallmentOverdueJobData>): Promise<void> {
    const { paymentId, orderId, orderNo, payableTime } = job.data;

    this.logger.log(`Processing installment overdue job: paymentId=${paymentId}, orderNo=${orderNo}`);

    try {
      // 查询支付记录当前状态
      const payment = await this.paymentRepo.findById(paymentId);

      if (!payment) {
        this.logger.warn(`Payment not found: paymentId=${paymentId}`);
        return;
      }

      // 检查支付是否已经完成或已取消
      if (
        payment.status === InstallmentStatus.PAID ||
        payment.status === InstallmentStatus.COMPLETED ||
        payment.status === InstallmentStatus.CANCELED ||
        payment.status === InstallmentStatus.CLOSED
      ) {
        this.logger.log(`Payment already processed: paymentId=${paymentId}, status=${payment.status}`);
        return;
      }

      // 检查应付时间是否已过（考虑宽限期）
      const now = dayjs();
      const payableAt = dayjs(payableTime);
      const gracePeriodDays = payment.gracePeriod || 0;
      const overdueAt = payableAt.add(gracePeriodDays, 'day');

      if (now.isBefore(overdueAt)) {
        this.logger.log(
          `Payment not overdue yet: paymentId=${paymentId}, overdueAt=${overdueAt.format('YYYY-MM-DD HH:mm:ss')}`,
        );
        return;
      }

      // 在事务中更新支付状态
      await this.dataSource.transaction(async manager => {
        // 重新查询支付记录，确保获取最新状态
        const currentPayment = await manager.findOne(PaymentEntity, {
          where: { id: paymentId },
        });

        if (!currentPayment) {
          return;
        }

        // 再次检查状态，防止并发问题
        if (
          currentPayment.status === InstallmentStatus.PAID ||
          currentPayment.status === InstallmentStatus.COMPLETED ||
          currentPayment.status === InstallmentStatus.CANCELED
        ) {
          this.logger.log(`Payment status changed during processing: paymentId=${paymentId}`);
          return;
        }

        // 更新支付状态为逾期
        await manager.update(
          PaymentEntity,
          { id: paymentId },
          {
            status: InstallmentStatus.OVERDUE,
          },
        );

        this.logger.log(`Payment installment overdue processed: paymentId=${paymentId}, orderNo=${orderNo}`);
      });
    } catch (error) {
      this.logger.error(
        `Failed to process installment overdue job: paymentId=${paymentId}, orderNo=${orderNo}`,
        error.stack,
      );
      throw error;
    }
  }
}
