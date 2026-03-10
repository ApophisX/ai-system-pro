/**
 * 租赁订单逾期定时检测调度器
 *
 * 1. 租期逾期：每分钟扫描一次，检测租期已到期但未归还的订单，更新为逾期状态
 * 2. 分期账单逾期：每小时扫描一次，检测分期订单下应付时间+宽限期已过的未支付账单，更新为逾期
 *
 * 替代原先的延迟 Job 方式，避免大量订单时的 Job 堆积
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Brackets, DataSource, QueryDeepPartialEntity } from 'typeorm';
import { RentalOrderEntity } from '../entities';
import { RentalOrderUsageStatus, RentalOrderOverdueStatus } from '../enums';
import { PaymentEntity } from '@/modules/base/payment/entities';
import { InstallmentStatus } from '@/modules/base/payment/enums';
import { CreditEvents } from '@/modules/credit/events/credit.events';
import { CreditActorRole } from '@/modules/credit/enums';
import { MessageNotificationService } from '@/modules/base/message/services';
import dayjs from 'dayjs';

const OVERDUE_SEVERE_DAYS = 7;

/** 需要检测租期逾期的订单使用状态 */
const RENTAL_USAGE_STATUSES_TO_CHECK = [
  RentalOrderUsageStatus.IN_USE, // 使用中
  RentalOrderUsageStatus.RETURNED_PENDING, // 待归还
] as const;

/** 分期账单逾期扫描：仅处理待支付/已到期且未支付的账单 */
const INSTALLMENT_BILL_STATUSES_TO_CHECK = [
  InstallmentStatus.PENDING, // 待支付
  InstallmentStatus.DUE, // 已到期
] as const;

/** 分期订单在以下使用状态时，若存在分期账单逾期，则订单 overdueStatus 置为 OVERDUE */
const ORDER_USAGE_STATUSES_FOR_INSTALLMENT_OVERDUE = [RentalOrderUsageStatus.IN_USE] as const;

@Injectable()
export class RentalOverdueScheduler implements OnModuleInit {
  private readonly logger = new Logger(RentalOverdueScheduler.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageNotificationService: MessageNotificationService,
  ) {}

  onModuleInit(): void {
    setImmediate(() => {
      this.logger.log('启动补跑：执行分期账单逾期检测');
      void this.handleInstallmentBillOverdue();
    });
  }

  /**
   * 非分期订单逾期检测（使用中）
   * 每分钟执行一次，自动检测使用中/待归还的订单并更新为逾期状态
   */
  // @Cron('0 * * * * *')
  @Cron(CronExpression.EVERY_MINUTE)
  async handleRentalOverdue(): Promise<void> {
    const now = dayjs().toDate();

    try {
      const overdueOrders = await this.dataSource
        .getRepository(RentalOrderEntity)
        .createQueryBuilder('o')
        .where('o.useageStatus IN (:...useageStatuses)', { useageStatuses: [...RENTAL_USAGE_STATUSES_TO_CHECK] })
        .andWhere('o.overdueStatus = :overdueStatuses', {
          overdueStatuses: RentalOrderOverdueStatus.NONE,
        })
        .andWhere('o.isProductPurchase = :isProductPurchase', { isProductPurchase: false })
        .andWhere('o.endDate < :now', { now })
        .andWhere('o.returnedAt IS NULL') // 只查询未归还的订单
        .andWhere(
          new Brackets(qb =>
            qb
              .where('o.isInstallment = :isInstallment', { isInstallment: 0 })
              .orWhere('o.isRenewal = :isRenewal', { isRenewal: 1 }),
          ),
        )
        .select(['o.id', 'o.orderNo', 'o.lesseeId', 'o.lessorId', 'o.useageStatus', 'o.endDate'])
        .getMany();

      if (overdueOrders.length === 0) {
        return;
      }

      this.logger.log(
        `检测到 ${overdueOrders.length} 个逾期订单待处理: ${overdueOrders.map(o => o.orderNo).join(', ')}`,
      );

      const results = await Promise.allSettled(overdueOrders.map(order => this.processOverdueOrder(order)));
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          const order = overdueOrders[i];
          this.logger.error(
            `处理逾期订单失败: orderNo=${order.orderNo}`,
            r.reason instanceof Error ? r.reason.stack : r.reason,
          );
        }
      });
    } catch (error) {
      this.logger.error('租赁逾期定时检测执行失败', error instanceof Error ? error.stack : error);
    }
  }

  /**
   * 每小时执行一次，扫描分期订单下应付时间+宽限期已过的未支付账单，标记为逾期
   *
   * 逻辑闭环：
   * 1. 只处理分期订单（isInstallment=true）下的账单
   * 2. 只处理待支付/已到期且未支付的账单（PENDING、DUE），已支付/已取消/已关闭等不再更新
   * 3. 逾期判定：当前时间 > payableTime + gracePeriod（天）
   * 4. 单笔事务内二次查询+状态校验，防止并发重复更新
   * 5. 账单标为逾期后，若订单处于 PAID/IN_USE，则订单 overdueStatus 置为 OVERDUE、isOverdue 置为 true
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleInstallmentBillOverdue(): Promise<void> {
    const now = dayjs().toDate();

    try {
      const paymentRepo = this.dataSource.getRepository(PaymentEntity);

      // 查询：分期订单（且订单已进入履约：已支付/使用中/待归还）下，状态为待支付/已到期，且 应付时间+宽限期 < 当前时间 的账单
      const overduePayments = await paymentRepo
        .createQueryBuilder('p')
        .where('p.status IN (:...statuses)', { statuses: [...INSTALLMENT_BILL_STATUSES_TO_CHECK] })
        .andWhere('p.isInstallment = :isInstallment', { isInstallment: 1 })
        .andWhere('p.isProductPurchase = :isProductPurchase', { isProductPurchase: false })
        .andWhere('p.payableTime IS NOT NULL')
        .andWhere('DATE_ADD(p.payableTime, INTERVAL COALESCE(p.gracePeriod, 0) DAY) < :now', { now })
        .select([
          'p.id',
          'p.orderId',
          'p.orderNo',
          'p.paymentNo',
          'p.periodIndex',
          'p.status',
          'p.payableTime',
          'p.gracePeriod',
        ])
        .getMany();

      if (overduePayments.length === 0) {
        return;
      }

      this.logger.log(
        `分期账单逾期扫描：检测到 ${overduePayments.length} 笔待处理: ${overduePayments.map(p => p.paymentNo).join(', ')}`,
      );

      for (const payment of overduePayments) {
        try {
          await this.processInstallmentBillOverdue(
            payment.id,
            payment.orderId,
            payment.orderNo,
            payment.periodIndex,
            payment.paymentNo,
          );
        } catch (err) {
          this.logger.error(
            `处理分期账单逾期失败: paymentId=${payment.id}, orderNo=${payment.orderNo}`,
            err instanceof Error ? err.stack : err,
          );
          // 单笔失败不影响其他
        }
      }
    } catch (error) {
      this.logger.error('分期账单逾期定时检测执行失败', error instanceof Error ? error.stack : error);
    }
  }

  // ====================================== 私有方法 ===========================================

  /**
   * 处理单笔分期账单逾期
   *
   * 1. 事务内再次查询账单，校验状态仍为 PENDING/DUE 再更新为 OVERDUE
   * 2. 若订单处于 PAID/IN_USE，则订单 overdueStatus=OVERDUE、isOverdue=true
   * 3. 若订单已为其他终态，仅根据该订单下是否仍有逾期账单同步 isOverdue
   */
  private async processInstallmentBillOverdue(
    paymentId: string,
    orderId: string,
    orderNo: string,
    periodIndex: number,
    paymentNo: string,
  ): Promise<void> {
    let lesseeId: string | undefined;
    let orderForNotify: Pick<RentalOrderEntity, 'id' | 'orderNo' | 'lesseeId' | 'lessorId'> | null = null;
    await this.dataSource.transaction(async manager => {
      const currentPayment = await manager.findOne(PaymentEntity, {
        where: { id: paymentId },
        select: ['id', 'orderId', 'orderNo', 'status'],
      });

      if (!currentPayment) {
        return;
      }

      // 再次校验状态，防止重复处理
      const currentStatus = currentPayment.status as (typeof INSTALLMENT_BILL_STATUSES_TO_CHECK)[number];
      if (!INSTALLMENT_BILL_STATUSES_TO_CHECK.includes(currentStatus)) {
        this.logger.debug(`分期账单状态已变更，跳过: paymentId=${paymentId}, status=${currentPayment.status}`);
        return;
      }

      await manager.update(PaymentEntity, { id: paymentId }, { status: InstallmentStatus.OVERDUE });

      this.logger.log(
        `分期账单逾期处理完成: paymentId=${paymentId}, orderNo=${orderNo}, status: ${currentStatus} → ${InstallmentStatus.OVERDUE}`,
      );

      // 同步订单逾期状态：该订单下是否存在任意一笔逾期账单
      const orderPayments = await manager.find(PaymentEntity, {
        where: { orderId },
        select: ['id', 'status'],
      });
      const hasOverduePayment = orderPayments.some(p => p.id === paymentId || p.status === InstallmentStatus.OVERDUE);

      const currentOrder = await manager.findOne(RentalOrderEntity, {
        where: { id: orderId },
        select: [
          'id',
          'orderNo',
          'lesseeId',
          'lessorId',
          'useageStatus',
          'overdueStatus',
          'isOverdue',
          'isInstallment',
        ],
      });

      if (!currentOrder) {
        return;
      }

      const orderUsageStatus =
        currentOrder.useageStatus as (typeof ORDER_USAGE_STATUSES_FOR_INSTALLMENT_OVERDUE)[number];
      if (!currentOrder.isInstallment || !hasOverduePayment) {
        return;
      }
      lesseeId = currentOrder.lesseeId;
      orderForNotify = {
        id: currentOrder.id,
        orderNo: currentOrder.orderNo,
        lesseeId: currentOrder.lesseeId,
        lessorId: currentOrder.lessorId,
      };

      const orderUpdate: QueryDeepPartialEntity<RentalOrderEntity> = { isOverdue: true };
      if (ORDER_USAGE_STATUSES_FOR_INSTALLMENT_OVERDUE.includes(orderUsageStatus)) {
        orderUpdate.overdueStatus = RentalOrderOverdueStatus.OVERDUE;
      }

      await manager.update(RentalOrderEntity, { id: orderId }, orderUpdate);

      this.logger.log(
        `订单逾期状态已同步: orderNo=${orderNo}, isOverdue=true${orderUpdate.overdueStatus ? `, overdueStatus → ${RentalOrderOverdueStatus.OVERDUE}` : ''}`,
      );
    });

    // 发送分期账单逾期消息通知给出租方和承租方
    if (orderForNotify) {
      await this.messageNotificationService.notifyInstallmentBillOverdue(
        orderForNotify as RentalOrderEntity,
        periodIndex,
        paymentNo,
      );
    }

    // 发射信用事件：分期账单逾期（承租方）
    // 文档第八节：严重逾期 = 逾期>7天 或 分期连续2期+；单期分期逾期为轻微(-10)
    if (lesseeId) {
      const overdueCount = await this.dataSource
        .getRepository(PaymentEntity)
        .count({ where: { orderId, status: InstallmentStatus.OVERDUE } });
      this.eventEmitter.emit(CreditEvents.ORDER_OVERDUE, {
        userId: lesseeId,
        actorRole: CreditActorRole.LESSEE,
        orderId,
        isSevere: overdueCount >= 2,
        consecutiveOverduePeriods: overdueCount,
        operatorType: 'system',
      });
    }
  }

  /**
   * 处理单笔逾期订单
   *
   * 逾期状态判定逻辑（设置 overdueStatus，useageStatus 保持 IN_USE）：
   * - 先付后用：→ 超时使用（OVERDUE_USE）
   * - 先用后付：→ 逾期（OVERDUE）
   */
  private async processOverdueOrder(order: RentalOrderEntity): Promise<void> {
    await this.dataSource.transaction(async manager => {
      // 重新查询，防止并发下状态已变更（需加载 assetSnapshot 判断是否先用后付）
      const current = await manager.findOne(RentalOrderEntity, {
        where: { id: order.id },
        relations: { assetSnapshot: true },
        select: ['id', 'orderNo', 'lesseeId', 'useageStatus', 'overdueStatus', 'isInstallment', 'endDate'],
      });

      if (!current) {
        return;
      }

      // 再次校验状态，防止重复处理
      const currentUsageStatus = current.useageStatus as (typeof RENTAL_USAGE_STATUSES_TO_CHECK)[number];
      if (!RENTAL_USAGE_STATUSES_TO_CHECK.includes(currentUsageStatus)) {
        this.logger.debug(`订单使用状态已变更，跳过: orderNo=${order.orderNo}, useageStatus=${current.useageStatus}`);
        return;
      }

      // 超时使用费已支付的订单不再重复标记逾期
      if (current.overdueStatus === RentalOrderOverdueStatus.OVERDUE_FEE_PAID) {
        this.logger.debug(`订单超时使用费已支付，跳过: orderNo=${order.orderNo}`);
        return;
      }

      const isPostPayment = current.assetSnapshot?.isPostPayment ?? false;
      const newOverdueStatus = isPostPayment
        ? RentalOrderOverdueStatus.OVERDUE // 先用后付 → 逾期
        : RentalOrderOverdueStatus.OVERDUE_USE; // 非分期 且 先付后用 → 超时使用

      await manager.update(RentalOrderEntity, { id: order.id }, { overdueStatus: newOverdueStatus, isOverdue: true });

      this.logger.log(
        `租期逾期处理完成: orderNo=${order.orderNo}, overdueStatus: ${current.overdueStatus ?? 'none'} → ${newOverdueStatus}`,
      );
    });

    // 发射信用事件：订单逾期（承租方）
    const overdueDays = order.endDate ? Math.max(0, dayjs().diff(dayjs(order.endDate), 'day')) : 0;
    const isSevere = overdueDays > OVERDUE_SEVERE_DAYS;
    this.eventEmitter.emit(CreditEvents.ORDER_OVERDUE, {
      userId: order.lesseeId,
      actorRole: CreditActorRole.LESSEE,
      orderId: order.id,
      overdueDays,
      isSevere,
      operatorType: 'system',
    });

    // 发送逾期消息通知给出租方和承租方
    await this.messageNotificationService.notifyOrderOverdue(order);
  }
}
