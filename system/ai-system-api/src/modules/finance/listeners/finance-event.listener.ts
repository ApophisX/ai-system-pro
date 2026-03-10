import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FinanceService } from '../services/finance.service';
import {
  PaymentEvents,
  PaymentCompletedEvent,
  PayOverdueFeeCompletedEvent,
  RefundCompletedEvent,
} from '@/modules/base/payment/events/payment.event';
import { PaymentRecordEntity } from '@/modules/base/payment/entities/payment-record.entity';
import { RefundRecordEntity } from '@/modules/base/payment/entities/refund-record.entity';
import { RentalOrderEntity } from '@/modules/rental-order/entities/rental-order.entity';
import { paymentTypeToFinanceIncomeType } from '../enums/finance-income-type.enum';
import { FinanceStatus } from '../enums';
import { DataSource } from 'typeorm';
import { PaymentType } from '@/modules/base/payment/enums';

/**
 * 财务事件监听器
 *
 * 监听各种业务事件，自动创建财务记录
 */
@Injectable()
export class FinanceEventListener {
  private readonly logger = new Logger(FinanceEventListener.name);

  constructor(
    private readonly financeService: FinanceService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 监听支付完成事件，创建收入记录
   *
   * - 已支付待收货（PAID）：待入账，确认入账在承租方确认收货时完成
   * - 使用中支付（IN_USE 等）：直接入账，incomeType 从 paymentRecord.paymentType 映射
   */
  @OnEvent(PaymentEvents.COMPLETED, { async: true })
  async handlePaymentCompleted(event: PaymentCompletedEvent): Promise<void> {
    this.logger.log(`收到支付完成事件，准备创建收入记录: paymentNo=${event.paymentNo}, orderNo=${event.orderNo}`);

    try {
      // 1. 查询支付记录和账单
      const paymentRecord = await this.dataSource.manager.findOne(PaymentRecordEntity, {
        where: { id: event.paymentRecordId || '' },
        relations: { payment: true },
      });

      if (!paymentRecord) {
        this.logger.warn(
          `支付记录不存在，跳过创建收入记录: paymentNo=${event.paymentNo}, paymentRecordId=${event.paymentRecordId}`,
        );
        return;
      }

      const payment = paymentRecord.payment;
      if (!payment) {
        this.logger.warn(`支付账单不存在，跳过创建收入记录: paymentNo=${event.paymentNo}`);
        return;
      }

      // 2. 检查是否已创建财务记录（幂等性检查）
      const existingFinance = await this.financeService['financeRepo'].findOne({
        where: { paymentRecordId: paymentRecord.id },
      });

      if (existingFinance) {
        this.logger.warn(`财务记录已存在，跳过创建: paymentRecordId=${paymentRecord.id}`);
        return;
      }

      // 3. 查询订单状态，判断是待入账还是直接入账
      // 注意：isInUse 依赖 useageStatus、status，必须 select 这些字段 getter 才生效
      const order = await this.dataSource.manager.findOne(RentalOrderEntity, {
        where: { id: payment.orderId },
        select: ['id', 'status', 'useageStatus'],
      });

      // 使用中支付（订单已在使用中）或「分期/逾期费」等使用中才发生的支付 → 直接入账
      const isInUsePaymentType =
        paymentRecord.paymentType === PaymentType.INSTALLMENT ||
        paymentRecord.paymentType === PaymentType.OVERDUE_FEE ||
        paymentRecord.paymentType === PaymentType.PENALTY;
      const isInUsePayment = isInUsePaymentType || (order?.isInUse ?? false);
      const incomeType = paymentTypeToFinanceIncomeType(paymentRecord.paymentType);

      // 4. 创建收入记录
      await this.financeService.createPaymentIncome({
        paymentRecordId: paymentRecord.id,
        paymentRecordNo: paymentRecord.recordNo,
        paymentId: payment.id,
        paymentNo: payment.paymentNo,
        orderId: payment.orderId,
        orderNo: payment.orderNo,
        lessorId: payment.lessorId,
        lesseeId: payment.userId,
        amount: paymentRecord.amount,
        paidAt: event.paidAt ?? new Date(),
        incomeType,
        autoConfirm: isInUsePayment,
      });

      this.logger.log(
        `收入记录创建成功: paymentNo=${event.paymentNo}, orderNo=${event.orderNo}, autoConfirm=${isInUsePayment}`,
      );
    } catch (error) {
      this.logger.error(
        `创建收入记录失败: paymentNo=${event.paymentNo}, orderNo=${event.orderNo}`,
        error instanceof Error ? error.stack : error,
      );
      // 不抛出异常，避免影响其他监听器
    }
  }

  /**
   * 监听超时使用费支付完成事件，创建 LessorFinanceEntity 收入记录
   *
   * 超时使用费属于使用中支付，直接入账（LATE_FEE 类型），影响出租方可提现余额。
   */
  @OnEvent(PaymentEvents.PAY_OVERDUE_FEE_COMPLETED, { async: true })
  async handlePayOverdueFeeCompleted(event: PayOverdueFeeCompletedEvent): Promise<void> {
    this.logger.log(
      `收到超时使用费支付完成事件，准备创建收入记录: recordNo=${event.recordNo}, orderId=${event.orderId}`,
    );

    try {
      // 1. 查询支付记录（超期费支付 record 有 orderId、lessorId、userId(承租方)）
      const paymentRecord = await this.dataSource.manager.findOne(PaymentRecordEntity, {
        where: { recordNo: event.recordNo },
      });

      if (!paymentRecord) {
        this.logger.warn(`超时使用费支付记录不存在，跳过创建收入记录: recordNo=${event.recordNo}`);
        return;
      }

      if (!paymentRecord.lessorId || !paymentRecord.userId) {
        this.logger.warn(`超时使用费支付记录缺少 lessorId 或 userId，跳过: recordNo=${event.recordNo}`);
        return;
      }

      // 2. 幂等性检查：是否已存在该支付记录对应的财务收入
      const existingFinance = await this.financeService['financeRepo'].findOne({
        where: { paymentRecordId: paymentRecord.id },
      });

      if (existingFinance) {
        this.logger.warn(`超时使用费收入记录已存在，跳过创建: paymentRecordId=${paymentRecord.id}`);
        return;
      }

      // 3. 创建收入记录并直接入账（使用支付记录的 amount 确保与回调一致）
      await this.financeService.createOverdueFeeIncome(
        paymentRecord.id,
        paymentRecord.recordNo,
        event.orderId,
        event.orderNo ?? paymentRecord.orderNo,
        paymentRecord.lessorId,
        paymentRecord.userId,
        paymentRecord.amount,
        event.paidAt ?? new Date(),
      );

      this.logger.log(
        `超时使用费收入记录创建成功: recordNo=${event.recordNo}, orderId=${event.orderId}, amount=${event.amount}`,
      );
    } catch (error) {
      this.logger.error(
        `创建超时使用费收入记录失败: recordNo=${event.recordNo}, orderId=${event.orderId}`,
        error instanceof Error ? error.stack : error,
      );
      // 不抛出异常，避免影响其他监听器
    }
  }

  /**
   * 退款完成事件
   *
   * - 若 payment-record 对应的收入为「待入账」：取消该收入（出租方从未入账，无需新建支出）
   * - 若对应收入已入账：新建退款支出记录并确认
   */
  @OnEvent(PaymentEvents.REFUND_COMPLETED, { async: true })
  async handleRefundCompleted(event: RefundCompletedEvent): Promise<void> {
    this.logger.log(`收到退款完成事件: refundNo=${event.refundNo}, orderNo=${event.orderNo}`);

    const refund = await this.dataSource.manager.findOne(RefundRecordEntity, {
      where: { refundNo: event.refundNo },
      relations: ['paymentRecord', 'payment'],
    });

    if (!refund) {
      this.logger.warn(`退款记录不存在，跳过: refundNo=${event.refundNo}`);
      return;
    }

    try {
      // 1. 检查是否已创建退款支出记录（幂等性）
      const existingRefundFinances = await this.financeService['financeRepo'].findByRefundRecordId(refund.id);
      if (existingRefundFinances.length > 0) {
        this.logger.warn(`退款支出记录已存在，跳过: refundRecordId=${refund.id}`);
        return;
      }

      // 2. 查询对应支付记录的收入财务状态
      const incomeFinances = await this.financeService['financeRepo'].findByPaymentRecordId(refund.paymentRecordId);
      const pendingIncome = incomeFinances.find(f => f.status === FinanceStatus.PENDING);

      if (pendingIncome) {
        // 待入账收入：取消即可，无需新建支出
        await this.financeService.cancelPendingIncomeByPaymentRecordId(refund.paymentRecordId);
        this.logger.log(`待入账收入已取消（退款无需新建支出）: refundNo=${event.refundNo}`);
        return;
      }

      // 3. 收入已入账或不存在：新建退款支出记录
      const paymentRecord = refund.paymentRecord;
      const payment = refund.payment || paymentRecord?.payment;
      if (!paymentRecord || !payment) {
        this.logger.warn(`支付记录/账单不存在，跳过创建支出: paymentRecordId=${refund.paymentRecordId}`);
        return;
      }

      await this.financeService.createRentRefundExpense(
        refund.id,
        refund.refundNo,
        refund.paymentId,
        refund.paymentNo,
        refund.paymentRecordId,
        refund.paymentRecordNo,
        refund.orderId,
        refund.orderNo,
        refund.lessorId,
        refund.userId,
        refund.amount,
        refund.refundedAt || event.refundedAt,
      );

      const finances = await this.financeService['financeRepo'].findByRefundRecordId(refund.id);
      if (finances.length > 0) {
        await this.financeService.confirmFinance({ financeId: finances[0].id });
      }

      this.logger.log(`租金退款支出记录创建成功: refundNo=${event.refundNo}`);
    } catch (error) {
      this.logger.error(
        `处理退款完成事件失败: refundNo=${event.refundNo}, orderNo=${event.orderNo}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  // -----------------------------------------------------------------
}
