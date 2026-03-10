/**
 * 租赁订单消息提醒定时调度器
 *
 * 1. 逾期前30分钟提醒：每分钟扫描，对租期即将在30分钟内到期的订单发送一次提醒
 * 2. 逾期/超时每日提醒：每天中午12点检查逾期或超时使用的订单，发送消息提醒
 * 3. 分期待支付账单提醒：当日9点、12点对应付日期为当日且状态为待支付的分期账单发送支付提醒
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { RentalOrderEntity } from '../entities';
import { RentalOrderUsageStatus, RentalOrderOverdueStatus } from '../enums';
import { MessageEntity } from '@/modules/base/message/entities/message.entity';
import { MessageNotificationService } from '@/modules/base/message/services';
import { MessageType } from '@/modules/base/message/enums';
import dayjs from 'dayjs';
import { InstallmentStatus, PaymentType } from '@/modules/base/payment/enums';
import { PaymentEntity } from '@/modules/base/payment/entities';

/** 逾期前30分钟提醒：需要检测的订单使用状态 */
const USAGE_STATUSES_FOR_DUE_SOON = [RentalOrderUsageStatus.IN_USE, RentalOrderUsageStatus.RETURNED_PENDING] as const;

/** 逾期/超时每日提醒：需要检测的逾期状态 */
const OVERDUE_STATUSES_FOR_DAILY = [RentalOrderOverdueStatus.OVERDUE_USE, RentalOrderOverdueStatus.OVERDUE] as const;

/** 逾期/超时每日提醒：需要检测的订单使用状态 */
const USAGE_STATUSES_FOR_OVERDUE_DAILY = [
  RentalOrderUsageStatus.IN_USE,
  RentalOrderUsageStatus.RETURNED_PENDING,
] as const;

@Injectable()
export class RentalNotificationScheduler {
  private readonly logger = new Logger(RentalNotificationScheduler.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly messageNotificationService: MessageNotificationService,
  ) {
    // 补跑
    setImmediate(() => {
      this.logger.log('启动补跑：执行订单逾期前30分钟提醒');
      void this.handleOrderDueSoonReminder();
    });
    setImmediate(() => {
      this.logger.log('启动补跑：执行订单逾期/超时每日提醒');
      void this.handleOrderOverdueDailyReminder();
    });
  }

  /**
   * 逾期前30分钟提醒
   * 每分钟执行一次，找出租期将在30分钟内到期的订单，发送一次提醒（每订单仅一次）
   */
  @Cron('0 * * * * *') // 每分钟第0秒
  async handleOrderDueSoonReminder(): Promise<void> {
    const now = dayjs().toDate();
    const nowPlus30Min = dayjs().add(30, 'minute').toDate();

    try {
      const orders = await this.dataSource
        .getRepository(RentalOrderEntity)
        .createQueryBuilder('o')
        .where('o.useageStatus IN (:...useageStatuses)', {
          useageStatuses: [...USAGE_STATUSES_FOR_DUE_SOON],
        })
        .andWhere('o.overdueStatus = :overdueStatus', {
          overdueStatus: RentalOrderOverdueStatus.NONE,
        })
        .andWhere('o.isProductPurchase = :isProductPurchase', { isProductPurchase: false })
        .andWhere('o.endDate IS NOT NULL')
        .andWhere('o.endDate > :now', { now })
        .andWhere('o.endDate <= :nowPlus30Min', { nowPlus30Min })
        .andWhere('o.returnedAt IS NULL')
        .select(['o.id', 'o.orderNo', 'o.lesseeId', 'o.lessorId', 'o.endDate'])
        .getMany();

      if (orders.length === 0) {
        return;
      }

      const messageRepo = this.dataSource.getRepository(MessageEntity);

      const results = await Promise.allSettled(
        orders.map(async order => {
          // 去重：检查是否已发送过该订单的逾期前30分钟提醒
          const existingCount = await messageRepo
            .createQueryBuilder('m')
            .where('m.relatedId = :orderId', { orderId: order.id })
            .andWhere('m.type = :type', { type: MessageType.ORDER })
            .andWhere("JSON_UNQUOTE(JSON_EXTRACT(m.extra, '$.reminderType')) = :reminderType", {
              reminderType: 'order_due_30min',
            })
            .getCount();

          if (existingCount > 0) {
            this.logger.debug(`订单逾期前30分钟提醒已发送过，跳过: orderNo=${order.orderNo}`);
            return;
          }

          await this.messageNotificationService.notifyOrderDueSoon(order);
        }),
      );

      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          this.logger.error(
            `发送订单逾期前30分钟提醒失败: orderNo=${orders[i].orderNo}`,
            r.reason instanceof Error ? r.reason.stack : r.reason,
          );
        }
      });
    } catch (error) {
      this.logger.error('订单逾期前30分钟提醒定时任务执行失败', error instanceof Error ? error.stack : error);
    }
  }

  /**
   * 逾期/超时每日提醒
   * 每天中午12点执行，检查逾期或超时使用的订单，发送消息提醒（每订单每日仅一次）
   */
  @Cron('0 0 12 * * *') // 每天 12:00:00
  async handleOrderOverdueDailyReminder(): Promise<void> {
    const todayStart = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();

    try {
      const orders = await this.dataSource
        .getRepository(RentalOrderEntity)
        .createQueryBuilder('o')
        .where('o.useageStatus IN (:...useageStatuses)', {
          useageStatuses: [...USAGE_STATUSES_FOR_OVERDUE_DAILY],
        })
        .andWhere('(o.isOverdue = :isOverdue OR o.overdueStatus IN (:...overdueStatuses))', {
          isOverdue: true,
          overdueStatuses: [...OVERDUE_STATUSES_FOR_DAILY],
        })
        .andWhere('o.isProductPurchase = :isProductPurchase', { isProductPurchase: false })
        .andWhere('o.returnedAt IS NULL')
        .select(['o.id', 'o.orderNo', 'o.lesseeId', 'o.lessorId', 'o.endDate'])
        .getMany();

      if (orders.length === 0) {
        return;
      }

      this.logger.log(`逾期/超时每日提醒：检测到 ${orders.length} 个订单: ${orders.map(o => o.orderNo).join(', ')}`);

      const messageRepo = this.dataSource.getRepository(MessageEntity);

      const results = await Promise.allSettled(
        orders.map(async order => {
          // 去重：检查今日是否已发送过该订单的逾期每日提醒
          const existingCount = await messageRepo
            .createQueryBuilder('m')
            .where('m.relatedId = :orderId', { orderId: order.id })
            .andWhere('m.type = :type', { type: MessageType.ORDER })
            .andWhere("JSON_UNQUOTE(JSON_EXTRACT(m.extra, '$.reminderType')) = :reminderType", {
              reminderType: 'order_overdue_daily',
            })
            .andWhere('m.createdAt >= :todayStart', { todayStart })
            .andWhere('m.createdAt <= :todayEnd', { todayEnd })
            .getCount();

          if (existingCount > 0) {
            this.logger.debug(`订单逾期每日提醒今日已发送，跳过: orderNo=${order.orderNo}`);
            return;
          }

          await this.messageNotificationService.notifyOrderOverdueDaily(order);
        }),
      );

      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          this.logger.error(
            `发送订单逾期每日提醒失败: orderNo=${orders[i].orderNo}`,
            r.reason instanceof Error ? r.reason.stack : r.reason,
          );
        }
      });
    } catch (error) {
      this.logger.error('订单逾期/超时每日提醒定时任务执行失败', error instanceof Error ? error.stack : error);
    }
  }

  /**
   * 分期待支付账单当日9点发送支付提醒
   */
  @Cron('0 0 9 * * *')
  async handleInstallmentBillPending9amReminder(): Promise<void> {
    await this.runInstallmentBillPendingDailyReminder(9);
  }

  /**
   * 分期待支付账单当日12点发送支付提醒
   */
  @Cron('0 0 12 * * *')
  async handleInstallmentBillPending12pmReminder(): Promise<void> {
    await this.runInstallmentBillPendingDailyReminder(12);
  }

  /**
   * 分期待支付账单当日支付提醒（9点、12点各执行一次）
   * 查询应付日期为当日且状态为待支付的分期账单，向承租方发送支付提醒（每账单每时段仅一次）
   */
  private async runInstallmentBillPendingDailyReminder(reminderHour: 9 | 12): Promise<void> {
    const todayStart = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();
    const reminderType = `installment_bill_pending_${reminderHour}`;

    try {
      const payments = await this.dataSource
        .getRepository(PaymentEntity)
        .createQueryBuilder('p')
        .where('p.status = :status', { status: InstallmentStatus.PENDING })
        .andWhere('p.paymentType = :paymentType', { paymentType: PaymentType.INSTALLMENT })
        .andWhere('p.isProductPurchase = :isProductPurchase', { isProductPurchase: false })
        .andWhere('p.payableTime IS NOT NULL')
        .andWhere('DATE(p.payableTime) = CURDATE()')
        .select([
          'p.id',
          'p.orderId',
          'p.orderNo',
          'p.paymentNo',
          'p.userId',
          'p.lessorId',
          'p.periodIndex',
          'p.amount',
        ])
        .getMany();

      if (payments.length === 0) {
        return;
      }

      this.logger.log(
        `分期待支付账单${reminderHour}点提醒：检测到 ${payments.length} 笔待支付: ${payments.map(p => p.paymentNo).join(', ')}`,
      );

      const messageRepo = this.dataSource.getRepository(MessageEntity);

      const results = await Promise.allSettled(
        payments.map(async payment => {
          const existingCount = await messageRepo
            .createQueryBuilder('m')
            .where('m.type = :type', { type: MessageType.PAYMENT })
            .andWhere("JSON_UNQUOTE(JSON_EXTRACT(m.extra, '$.reminderType')) = :reminderType", {
              reminderType,
            })
            .andWhere("JSON_UNQUOTE(JSON_EXTRACT(m.extra, '$.paymentId')) = :paymentId", {
              paymentId: payment.id,
            })
            .andWhere('m.createdAt >= :todayStart', { todayStart })
            .andWhere('m.createdAt <= :todayEnd', { todayEnd })
            .getCount();

          if (existingCount > 0) {
            this.logger.debug(`分期待支付账单${reminderHour}点提醒今日已发送，跳过: paymentNo=${payment.paymentNo}`);
            return;
          }

          await this.messageNotificationService.notifyInstallmentBillPaymentReminder(payment, reminderHour);
        }),
      );

      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          this.logger.error(
            `发送分期待支付账单${reminderHour}点提醒失败: paymentNo=${payments[i].paymentNo}`,
            r.reason instanceof Error ? r.reason.stack : r.reason,
          );
        }
      });
    } catch (error) {
      this.logger.error(
        `分期待支付账单当日${reminderHour}点提醒定时任务执行失败`,
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
