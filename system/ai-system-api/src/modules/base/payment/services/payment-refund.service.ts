import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { PaymentRepository, PaymentRecordRepository, RefundRecordRepository } from '../repositories';
import { PaymentEntity, PaymentRecordEntity, RefundRecordEntity } from '../entities';
import { InstallmentStatus, PaymentProvider, PaymentStatus, RefundStatus, WithdrawalStatus } from '../enums';
import { CreateRefundDto } from '../dto';
import { SequenceNumberPrefix, SequenceNumberService, SequenceNumberType } from '@/infrastructure/sequence-number';
import { WxPayService } from './wx-pay.service';
import { ConfigService } from '@nestjs/config';
import { SERVER_CONFIG_KEY, ServerConfig } from '@/config';
import Decimal from 'decimal.js';

/**
 * 支付退款服务
 *
 * 提供退款相关的业务逻辑
 */
@Injectable()
export class PaymentRefundService {
  private readonly logger = new Logger(PaymentRefundService.name);
  private readonly refundNotifyUrl: string;

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly paymentRecordRepo: PaymentRecordRepository,
    private readonly refundRecordRepo: RefundRecordRepository,
    private readonly dataSource: DataSource,
    private readonly sequenceNumberService: SequenceNumberService,
    private readonly wxPayService: WxPayService,
    private readonly configService: ConfigService,
  ) {
    const serverConfig = this.configService.get<ServerConfig>(SERVER_CONFIG_KEY)!;
    this.refundNotifyUrl = `${serverConfig.apiHost}${serverConfig.apiPrefix}/payment/wx-pay/refund-notify`;
  }

  /**
   * 创建退款记录
   *
   * @param userId 用户ID
   * @param dto 退款DTO
   * @returns 退款记录实体
   */
  async createRefund(userId: string, dto: CreateRefundDto): Promise<RefundRecordEntity> {
    const payment = await this.paymentRepo.findById(dto.paymentId);
    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    if (payment.userId !== userId) {
      throw new BadRequestException('无权操作此支付记录');
    }

    if (payment.status !== InstallmentStatus.PAID) {
      throw new BadRequestException('只有已支付的订单才能退款');
    }

    // 检查是否已提现
    if (payment.isWithdrawn) {
      throw new BadRequestException('账单已被提现，无法退款');
    }

    // 检查可退款金额
    const refundedAmount = await this.getRefundedAmount(dto.paymentId);
    const availableAmount = new Decimal(payment.paidAmount).minus(refundedAmount).toNumber();

    if (dto.amount > availableAmount) {
      throw new BadRequestException(`可退款金额不足，可退款金额：${availableAmount}分`);
    }

    return this.dataSource.transaction(async manager => {
      // 创建退款记录
      const refund = new RefundRecordEntity();
      refund.paymentId = payment.id;
      refund.paymentNo = payment.paymentNo;
      refund.orderId = payment.orderId;
      refund.orderNo = payment.orderNo;
      refund.userId = userId;
      refund.status = RefundStatus.PROCESSING;
      refund.amount = dto.amount.toString();
      refund.reason = dto.reason;
      refund.remark = dto.remark;

      const savedRefund = await manager.save(RefundRecordEntity, refund);

      this.logger.log(`已创建退款: refundNo=${refund.refundNo}, paymentNo=${payment.paymentNo}, 金额=${dto.amount}`);

      return savedRefund;
    });
  }

  /**
   * 在订单取消时处理租金退款（所有已支付的账单）
   *
   * 业务逻辑：
   * 1. 查找订单所有已支付的账单（PaymentEntity）
   * 2. 对每个已支付的账单创建退款记录
   * 3. 计算已退款金额，避免重复退款
   * 4. 从支付记录中获取支付提供商信息
   *
   * @param paidPayments 已支付的账单列表
   * @param reason 取消原因
   * @param manager 事务管理器（需要在外部事务中执行）
   */
  async refundAllPaymentsForOrderCancel(
    paidPayments: PaymentEntity[],
    reason: string,
    manager: EntityManager,
  ): Promise<void> {
    // 对每个已支付的账单创建退款记录
    for (const payment of paidPayments) {
      await this.refundPaymentWithManager(payment, reason, manager);
    }
  }

  /**
   * 针对单笔已支付账单生成退款记录，并处理相应业务逻辑
   * @param payment 支付记录
   * @param reason 退款原因
   * @param manager 事务管理器
   */
  async refundPaymentWithManager(payment: PaymentEntity, reason: string, manager: EntityManager): Promise<void> {
    // 检查是否已提现
    if (payment.isWithdrawn) {
      const message = `账单已被提现，无法退款，跳过: paymentId=${payment.id}, orderNo=${payment.orderNo}, withdrawalStatus=${payment.withdrawalStatus}`;
      this.logger.warn(message);
      throw new BadRequestException(message);
      // return;
    }

    // 计算已退款金额（查找该账单的所有已完成退款）
    const refundedAmount = await this.getRefundedAmountWithManager(payment.id, manager);

    // 计算可退款金额（已支付金额 - 已退款金额）
    const paidAmount = new Decimal(payment.paidAmount || 0).toNumber();
    const availableRefundAmount = new Decimal(paidAmount).minus(refundedAmount).toNumber();

    if (availableRefundAmount <= 0) {
      const message = `账单无可退款金额，跳过: paymentId=${payment.id}, paidAmount=${paidAmount}, refundedAmount=${refundedAmount}, orderNo=${payment.orderNo}`;
      this.logger.warn(message);
      return;
    }

    const paymentRecords = await manager.find(PaymentRecordEntity, {
      where: { paymentId: payment.id, status: PaymentStatus.COMPLETED },
      order: { createdAt: 'DESC' },
    });

    for (const paymentRecord of paymentRecords) {
      await this.refundPaymentRecordWithManager(paymentRecord, reason, manager);
    }
  }

  /**
   * 创建退款记录并根据支付渠道发起退款操作（全额退款，用于订单取消场景）
   * @param paymentRecord 支付记录实体
   * @param reason 退款原因
   * @param manager 数据库事务管理器
   */
  async refundPaymentRecordWithManager(
    paymentRecord: PaymentRecordEntity,
    reason: string,
    manager: EntityManager,
  ): Promise<RefundStatus> {
    // 调用部分退款方法，传入全额退款金额
    const fullAmount = new Decimal(paymentRecord.amount).toNumber();
    return this.refundPaymentRecordPartialWithManager(
      paymentRecord,
      fullAmount,
      `订单取消-${reason ?? ''}`,
      manager,
      false, // 不更新 payment 状态（订单取消场景由其他逻辑处理）
    );
  }

  /**
   * 单笔支付记录部分退款（支持多次部分退款）
   * @param paymentRecord 支付记录实体
   * @param refundAmount 退款金额（元）
   * @param reason 退款原因
   * @param manager 数据库事务管理器
   * @param updatePaymentStatus 是否更新 payment 的退款状态（默认 true）
   * @returns 本次退款的最终状态（COMPLETED/PROCESSING/FAILED），供调用方正确更新订单层状态
   */
  async refundPaymentRecordPartialWithManager(
    paymentRecord: PaymentRecordEntity,
    refundAmount: number,
    reason: string,
    manager: EntityManager,
    updatePaymentStatus: boolean = true,
  ): Promise<RefundStatus> {
    // 0. 悲观锁：防止并发超额退款（SELECT FOR UPDATE）
    const lockedRecord = await manager.findOne(PaymentRecordEntity, {
      where: { id: paymentRecord.id },
      lock: { mode: 'pessimistic_write' },
      relations: ['payment'],
    });
    if (!lockedRecord) {
      throw new NotFoundException('支付记录不存在');
    }
    Object.assign(paymentRecord, lockedRecord);

    // 1. 验证支付记录状态
    if (paymentRecord.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('支付记录状态不允许退款，必须是已支付状态');
    }

    // 2. 检查是否已提现
    if (paymentRecord.withdrawalStatus && paymentRecord.withdrawalStatus !== WithdrawalStatus.NONE) {
      throw new BadRequestException('支付记录已被提现，无法退款');
    }

    // 3. 计算已退款金额和剩余可退款金额
    const paidAmount = new Decimal(paymentRecord.amount).toNumber();
    const refundedAmount = await this.getRefundedAmountForPaymentRecordWithManager(paymentRecord.id, manager);
    const availableRefundAmount = paidAmount - refundedAmount;

    // 4. 验证退款金额
    if (refundAmount <= 0) {
      throw new BadRequestException('退款金额必须大于0');
    }

    if (new Decimal(refundAmount).gt(availableRefundAmount)) {
      throw new BadRequestException(
        `退款金额超过剩余可退款金额，已支付金额：${paidAmount}元，已退款金额：${refundedAmount}元，剩余可退款金额：${availableRefundAmount}元`,
      );
    }

    // 5. 生成退款单号
    const refundNo = await this.sequenceNumberService.generate({
      businessType: SequenceNumberType.REFUND,
      prefix: SequenceNumberPrefix.REFUND_RECORD,
    });

    // 6. 创建退款记录
    const refund = manager.create(RefundRecordEntity, {
      refundNo: refundNo,
      paymentId: paymentRecord.paymentId || '',
      paymentNo: paymentRecord.paymentNo || '',
      paymentRecordId: paymentRecord.id,
      paymentRecordNo: paymentRecord.recordNo,
      orderId: paymentRecord.orderId,
      orderNo: paymentRecord.orderNo,
      userId: paymentRecord.userId,
      lessorId: paymentRecord.lessorId,
      provider: paymentRecord.provider,
      status: RefundStatus.PROCESSING,
      amount: refundAmount.toString(),
      reason: reason || '商家发起单笔账单退款',
    });

    await manager.save(RefundRecordEntity, refund);

    this.logger.log(
      `单笔账单退款记录已创建: refundNo=${refundNo}, paymentRecordId=${paymentRecord.id}, paymentRecordNo=${paymentRecord.recordNo}, refundAmount=${refundAmount}, orderNo=${paymentRecord.orderNo}`,
    );

    // 7. 调用第三方支付进行退款
    if (paymentRecord.provider === PaymentProvider.WECHAT) {
      const result = await this.wxPayService.jsApiRefund({
        out_trade_no: paymentRecord.recordNo,
        out_refund_no: refund.refundNo,
        amount: {
          total: new Decimal(paymentRecord.amount).mul(100).toNumber(),
          refund: new Decimal(refundAmount).mul(100).toNumber(),
          currency: 'CNY',
        },
        notify_url: this.refundNotifyUrl,
        reason: reason || '商家发起单笔账单退款',
      });

      refund.callbackData = result;
      refund.thirdPartyRefundNo = result.refund_id;

      const logMessage = `out_trade_no=${paymentRecord.recordNo}, refund_id=${result.refund_id}, refund_amount=${refundAmount}`;

      switch (result.status) {
        case 'SUCCESS':
          {
            refund.status = RefundStatus.COMPLETED;
            refund.refundedAt = new Date();
            // 更新支付记录的退款状态
            const newRefundedAmount = new Decimal(refundedAmount).plus(refundAmount).toNumber();
            if (new Decimal(newRefundedAmount).gte(paidAmount)) {
              paymentRecord.refundStatus = RefundStatus.COMPLETED;
              paymentRecord.refundedAt = new Date();
            } else {
              paymentRecord.refundStatus = RefundStatus.PARTIAL_REFUND;
            }
            this.logger.log(`微信退款成功: ${logMessage}`);
          }
          break;
        case 'PROCESSING':
          refund.status = RefundStatus.PROCESSING;
          // 如果之前没有退款，设置为处理中；如果已有部分退款，保持部分退款状态
          if (!paymentRecord.refundStatus || paymentRecord.refundStatus === RefundStatus.NONE) {
            paymentRecord.refundStatus = RefundStatus.PROCESSING;
          }
          this.logger.log(`微信退款处理中: ${logMessage}`);
          break;
        default:
          refund.status = RefundStatus.FAILED;
          refund.failureReason = `${{ CLOSE: '退款关闭', ABNORMAL: '退款异常' }[result.status] || '退款失败'}: ${result.status}`;
          this.logger.error(`微信退款失败: ${logMessage}, reason=${result.status}`);
          break;
      }

      await manager.save(RefundRecordEntity, refund);
      await manager.save(PaymentRecordEntity, paymentRecord);

      // 8. 更新支付账单的退款状态（如果需要）
      if (updatePaymentStatus && paymentRecord.paymentId) {
        await this.updatePaymentRefundStatus(paymentRecord.paymentId, refund.status, manager);
      }

      return refund.status;
    } else if (paymentRecord.provider === PaymentProvider.ALIPAY) {
      // TODO: 支付宝退款待接入
      throw new BadRequestException('支付宝退款待接入');
    }

    throw new BadRequestException('不支持的支付方式');
  }

  /**
   * 获取支付记录的已退款金额（在事务中）
   * @param paymentRecordId 支付记录ID
   * @param manager 事务管理器
   * @returns 已退款金额
   */
  private async getRefundedAmountForPaymentRecordWithManager(
    paymentRecordId: string,
    manager: EntityManager,
  ): Promise<number> {
    const refunds = await manager.find(RefundRecordEntity, {
      where: { paymentRecordId },
    });
    return refunds
      .filter((r: RefundRecordEntity) => r.status === RefundStatus.COMPLETED)
      .reduce((sum: Decimal, r: RefundRecordEntity) => sum.plus(r.amount || 0), new Decimal(0))
      .toNumber();
  }

  /**
   * 获取支付记录的已退款金额（公开方法）
   * @param paymentRecordId 支付记录ID
   * @returns 已退款金额
   */
  async getRefundedAmountForPaymentRecord(paymentRecordId: string): Promise<number> {
    const [refunds] = await this.refundRecordRepo.findMany({ paymentRecordId });
    return refunds
      .filter((r: RefundRecordEntity) => r.status === RefundStatus.COMPLETED)
      .reduce((sum: Decimal, r: RefundRecordEntity) => sum.plus(r.amount || 0), new Decimal(0))
      .toNumber();
  }

  /**
   * 更新支付账单的退款状态
   * @param paymentId 支付账单ID
   * @param refundStatus 退款状态
   * @param manager 事务管理器
   */
  private async updatePaymentRefundStatus(
    paymentId: string,
    refundStatus: RefundStatus,
    manager: EntityManager,
  ): Promise<void> {
    const payment = await manager.findOne(PaymentEntity, {
      where: { id: paymentId },
      relations: { refundRecords: true, paymentRecords: true },
    });

    if (!payment) {
      this.logger.warn(`支付账单不存在，跳过更新退款状态: paymentId=${paymentId}`);
      return;
    }

    const totalRefundAmount = payment.refundedAmount;
    const paidAmountDecimal = new Decimal(payment.paidAmount);
    const refundAmountDecimal = new Decimal(totalRefundAmount);

    if (refundAmountDecimal.gte(paidAmountDecimal) && refundAmountDecimal.gt(0)) {
      payment.refundStatus = RefundStatus.COMPLETED;
      payment.refundedAt = new Date();
    } else if (refundAmountDecimal.gt(0)) {
      payment.refundStatus = RefundStatus.PARTIAL_REFUND;
      payment.refundedAt = new Date();
    } else if (refundStatus === RefundStatus.PROCESSING) {
      payment.refundStatus = RefundStatus.PROCESSING;
    }

    await manager.save(PaymentEntity, payment);
    this.logger.log(
      `支付账单退款状态已更新: paymentId=${payment.id}, paymentNo=${payment.paymentNo}, refundStatus=${payment.refundStatus}`,
    );
  }

  /**
   * 获取已退款金额
   * @param paymentId 支付ID
   * @returns 已退款金额
   */
  private async getRefundedAmount(paymentId: string): Promise<number> {
    const refunds = await this.refundRecordRepo.findByPaymentId(paymentId);
    return refunds
      .filter(r => r.status === RefundStatus.COMPLETED)
      .reduce((sum: Decimal, r: RefundRecordEntity) => sum.plus(r.amount || 0), new Decimal(0))
      .toNumber();
  }

  /**
   * 在指定事务管理器中获取已退款金额
   * @param paymentId 支付ID
   * @param manager 事务管理器
   * @returns 已退款金额
   */
  private async getRefundedAmountWithManager(paymentId: string, manager: EntityManager): Promise<number> {
    const refunds = await manager.find(RefundRecordEntity, {
      where: { paymentId },
    });
    return refunds
      .filter((r: RefundRecordEntity) => r.status === RefundStatus.COMPLETED)
      .reduce((sum: Decimal, r: RefundRecordEntity) => sum.plus(r.amount || 0), new Decimal(0))
      .toNumber();
  }
}
