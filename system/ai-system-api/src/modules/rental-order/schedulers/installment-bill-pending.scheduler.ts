/**
 * 分期账单「生成中→待支付」定时调度器
 *
 * 每日凌晨扫描，将应付日期已到（或已过）的「生成中」分期账单改为「待支付」
 * 判定：账单状态=GENERATING，且 DATE(payableTime) <= 当前日期（应付时间以单期结束日 23:59:59 为准）
 *
 * 启动补跑：应用启动时异步执行一次相同逻辑，避免停服/发布导致错过凌晨 0 点 cron 时延迟一天才变为待支付。
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { RentalOrderEntity } from '../entities';
import { RentalOrderStatus, RentalOrderUsageStatus } from '../enums';
import { PaymentEntity } from '@/modules/base/payment/entities';
import { InstallmentStatus } from '@/modules/base/payment/enums';

/** 仅处理以下订单状态下的账单（已进入履约，useageStatus=IN_USE 含逾期 overdueStatus=OVERDUE/OVERDUE_USE，不含 OVERDUE_FEE_PAID） */
const ORDER_MAIN_STATUSES_FOR_BILL_PENDING = [RentalOrderStatus.RECEIVED] as const;
const ORDER_USAGE_STATUSES_FOR_BILL_PENDING = [
  RentalOrderUsageStatus.IN_USE,
  RentalOrderUsageStatus.RETURNED_PENDING,
] as const;

@Injectable()
export class InstallmentBillPendingScheduler implements OnModuleInit {
  private readonly logger = new Logger(InstallmentBillPendingScheduler.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * 应用启动后异步执行一次「生成中→待支付」补跑，不阻塞应用就绪。
   * 用于弥补停服/发布期间错过凌晨 0 点 cron 的情况。
   */
  onModuleInit(): void {
    setImmediate(() => {
      this.logger.log('启动补跑：执行分期账单生成中→待支付');
      void this.handleInstallmentBillGeneratingToPending();
    });
  }

  /**
   * 每日凌晨执行一次，将「生成中」且应付日期已到（或已过）的分期账单改为「待支付」
   *
   * 逻辑闭环：
   * 1. 只处理分期订单（isInstallment=true）下的账单
   * 2. 只处理订单已进入履约的订单（RECEIVED 且 useageStatus=IN_USE），排除待支付/已取消等
   * 3. 判定：账单状态=生成中（GENERATING），且 应付日期的日期部分 <= 当前日期
   * 4. 事务内二次查询+状态校验，防止并发重复更新
   */
  @Cron('0 0 * * *')
  async handleInstallmentBillGeneratingToPending(): Promise<void> {
    try {
      const paymentRepo = this.dataSource.getRepository(PaymentEntity);
      const toPendingPayments = await paymentRepo
        .createQueryBuilder('p')
        .innerJoin(RentalOrderEntity, 'o', 'o.id = p.orderId AND o.isInstallment = 1')
        .where('p.status = :generating', { generating: InstallmentStatus.GENERATING })
        .andWhere('o.isProductPurchase = :isProductPurchase', { isProductPurchase: false })
        .andWhere('(o.status IN (:...orderMainStatuses) OR o.useageStatus IN (:...orderUsageStatuses))', {
          orderMainStatuses: [...ORDER_MAIN_STATUSES_FOR_BILL_PENDING],
          orderUsageStatuses: [...ORDER_USAGE_STATUSES_FOR_BILL_PENDING],
        })
        .andWhere('p.payableTime IS NOT NULL')
        .andWhere('DATE(p.payableTime) <= CURDATE()')
        .select(['p.id', 'p.orderId', 'p.orderNo', 'p.paymentNo', 'p.periodIndex', 'p.status', 'p.payableTime'])
        .getMany();

      if (toPendingPayments.length === 0) {
        return;
      }

      this.logger.log(
        `分期账单生成中→待支付：检测到 ${toPendingPayments.length} 笔待处理: ${toPendingPayments.map(p => p.paymentNo).join(', ')}`,
      );

      for (const payment of toPendingPayments) {
        try {
          await this.processBillGeneratingToPending(payment.id, payment.orderNo, payment.paymentNo);
        } catch (err) {
          this.logger.error(
            `处理分期账单生成中→待支付失败: paymentId=${payment.id}, orderNo=${payment.orderNo}`,
            err instanceof Error ? err.stack : err,
          );
        }
      }
    } catch (error) {
      this.logger.error('分期账单生成中→待支付定时检测执行失败', error instanceof Error ? error.stack : error);
    }
  }

  /**
   * 处理单笔「生成中→待支付」：事务内再次查询，校验状态仍为 GENERATING 再更新为 PENDING
   */
  private async processBillGeneratingToPending(paymentId: string, orderNo: string, paymentNo: string): Promise<void> {
    await this.dataSource.transaction(async manager => {
      const current = await manager.findOne(PaymentEntity, {
        where: { id: paymentId },
        select: ['id', 'status'],
      });

      if (!current || current.status !== InstallmentStatus.GENERATING) {
        if (current) {
          this.logger.debug(`分期账单状态已变更，跳过: paymentNo=${paymentNo}, status=${current.status}`);
        }
        return;
      }

      await manager.update(PaymentEntity, { id: paymentId }, { status: InstallmentStatus.PENDING });

      this.logger.log(
        `分期账单生成中→待支付完成: paymentNo=${paymentNo}, orderNo=${orderNo}, status: ${InstallmentStatus.GENERATING} → ${InstallmentStatus.PENDING}`,
      );
    });
  }
}
