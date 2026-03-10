import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentRecordRepository, RefundRecordRepository } from '../repositories';
import { PaymentEntity, PaymentRecordEntity, RefundRecordEntity } from '../entities';
import { InstallmentStatus, PaymentStatus, PaymentType, RefundStatus } from '../enums';
import Decimal from 'decimal.js';
import { OutputPaymentDto } from '../dto/output-payment.dto';
import { plainToInstance } from 'class-transformer';
import {
  PaymentEvents,
  PaymentCompletedEvent,
  PaymentFailedEvent,
  RefundCompletedEvent,
  RefundFailedEvent,
  PayDepositCompletedEvent,
  PayDepositFailedEvent,
  DepositRefundCompletedEvent,
  DepositRefundFailedEvent,
  PayOverdueFeeCompletedEvent,
} from '../events';
import { DepositEntity } from '@/modules/rental-order/entities';
import { DepositStatus } from '@/modules/rental-order/enums';

/**
 * 支付回调服务
 *
 * 处理第三方支付平台（如微信支付）的回调通知
 * 包括支付回调、退款回调、押金回调等
 */
@Injectable()
export class PaymentCallbackService {
  private readonly logger = new Logger(PaymentCallbackService.name);

  constructor(
    private readonly paymentRecordRepo: PaymentRecordRepository,
    private readonly refundRecordRepo: RefundRecordRepository,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {
    //
  }

  /**
   * 处理超时使用费支付回调
   *
   * 更新支付记录状态并发射 PayOverdueFeeCompletedEvent，由订单模块监听并累加 order.overdueFeePaidAmount。
   */
  private async handleOverdueFeePaymentCallback(
    record: PaymentRecordEntity,
    thirdPartyPaymentNo: string,
    isSuccess: boolean,
    callbackData: WxPay.Notify.TransactionResult,
  ): Promise<null> {
    if (record.status === PaymentStatus.COMPLETED && record.thirdPartyPaymentNo === thirdPartyPaymentNo) {
      this.logger.warn(
        `重复的超时使用费支付回调，已忽略: recordNo=${record.recordNo}, thirdPartyPaymentNo=${thirdPartyPaymentNo}`,
      );
      return null;
    }

    const paidAt = new Date();

    record.callbackData = callbackData;
    record.thirdPartyPaymentNo = thirdPartyPaymentNo;
    record.status = isSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;
    if (isSuccess) {
      record.amount = new Decimal(callbackData.amount.payer_total).div(100).toNumber().toString();
      record.paidAt = paidAt;
      record.expiredAt = undefined;
    }
    await this.paymentRecordRepo.save(record);

    this.logger.log(
      `超时使用费支付回调处理完成: recordNo=${record.recordNo}, orderId=${record.orderId}, status=${record.status}`,
    );

    if (isSuccess) {
      const amount = new Decimal(callbackData.amount.payer_total).div(100).toNumber();
      const event = new PayOverdueFeeCompletedEvent(
        record.recordNo,
        record.orderId,
        record.orderNo ?? null,
        thirdPartyPaymentNo,
        amount,
        paidAt,
        callbackData as Record<string, any>,
      );
      setImmediate(() => this.eventEmitter.emit(PaymentEvents.PAY_OVERDUE_FEE_COMPLETED, event));
    }

    return null;
  }

  /**
   * 处理押金回调
   *
   * @param outTradeNo 支付单号
   * @param thirdPartyPaymentNo 第三方支付流水号
   * @param isSuccess 是否成功
   * @param attach 支付附件
   * @param callbackData 回调数据
   */
  handleDepositCallback(
    outTradeNo: string,
    thirdPartyPaymentNo: string,
    isSuccess: boolean,
    attach: WxPay.WxPayAttach,
    callbackData: WxPay.Notify.TransactionResult,
  ) {
    const amount = new Decimal(callbackData.amount.payer_total).div(100).toNumber();
    try {
      if (isSuccess) {
        const successEvent = new PayDepositCompletedEvent(
          thirdPartyPaymentNo,
          outTradeNo,
          amount,
          new Date(),
          callbackData,
        );
        this.logger.log(`发送押金支付完成事件: outTradeNo=${outTradeNo}, thirdPartyPaymentNo=${thirdPartyPaymentNo}`);
        this.eventEmitter.emit(PaymentEvents.PAY_DEPOSIT_COMPLETED, successEvent);
      } else {
        const failedEvent = new PayDepositFailedEvent(thirdPartyPaymentNo, outTradeNo, '押金支付失败', callbackData);
        this.logger.log(`发送押金支付失败事件: outTradeNo=${outTradeNo}, thirdPartyPaymentNo=${thirdPartyPaymentNo}`);
        this.eventEmitter.emit(PaymentEvents.PAY_DEPOSIT_FAILED, failedEvent);
      }
    } catch (error) {
      this.logger.error(`处理押金回调失败: outTradeNo=${outTradeNo}, error=${error}`);
    }
  }

  /**
   * 处理支付回调
   *
   * 该方法处理第三方支付平台（如微信支付）的回调通知
   * 处理完成后会发射相应的事件，通知订单模块等其他模块
   *
   * @param outTradeNo 支付单号（平台内部）
   * @param thirdPartyPaymentNo 第三方支付流水号
   * @param isSuccess 是否成功
   * @param callbackData 原始回调数据
   * @returns 更新后的支付记录
   */
  async handlePaymentCallback(
    outTradeNo: string,
    thirdPartyPaymentNo: string,
    isSuccess: boolean,
    callbackData: WxPay.Notify.TransactionResult,
  ): Promise<OutputPaymentDto | null> {
    const record = await this.paymentRecordRepo.findOne({
      where: { recordNo: outTradeNo },
      relations: { payment: true },
    });
    if (!record) {
      this.logger.error(`支付记录不存在: outTradeNo=${outTradeNo}`);
      return null;
    }

    // 超时使用费支付：无关联租金账单，单独处理并发射事件由订单模块更新 overdueFeePaidAmount
    if (record.paymentType === PaymentType.OVERDUE_FEE && !record.paymentId) {
      return this.handleOverdueFeePaymentCallback(record, thirdPartyPaymentNo, isSuccess, callbackData);
    }

    const { payment } = record;

    if (!payment) {
      this.logger.error(`支付记录关联的租赁账单不存在: outTradeNo=${outTradeNo}`);
      return null;
    }

    // 幂等性检查：如果已经处理过相同的回调，直接返回
    if (record.status === PaymentStatus.COMPLETED && record.thirdPartyPaymentNo === thirdPartyPaymentNo) {
      this.logger.warn(`重复的支付回调，已忽略: outTradeNo=${outTradeNo}, thirdPartyPaymentNo=${thirdPartyPaymentNo}`);
      return plainToInstance(OutputPaymentDto, payment, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      });
    }

    const paidAt = new Date();

    try {
      const updatedPayment = await this.dataSource.transaction(async manager => {
        // 更新支付记录
        record.callbackData = callbackData;
        record.thirdPartyPaymentNo = thirdPartyPaymentNo;
        record.status = isSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;
        if (isSuccess) {
          record.amount = new Decimal(callbackData.amount.payer_total).div(100).toNumber().toString();
          record.paidAt = paidAt;
          record.expiredAt = undefined;
        }
        await manager.save(PaymentRecordEntity, record);

        // 如果支付成功，更新支付账单状态
        if (isSuccess) {
          // 查询该支付单下所有已完成的租金/续租支付记录（RENTAL/INSTALLMENT/RENEWAL 同属租金类）
          const paymentRecords = await manager.find(PaymentRecordEntity, {
            where: {
              paymentNo: payment.paymentNo,
              status: PaymentStatus.COMPLETED,
              paymentType: In([PaymentType.RENTAL, PaymentType.INSTALLMENT, PaymentType.RENEWAL]),
            },
          });

          // 使用 Decimal 精确计算已支付总额
          const totalAmount = paymentRecords.reduce((acc, next) => acc.plus(next.amount), new Decimal(0));
          payment.paidAmount = totalAmount.toString();

          // 使用 Decimal 比较金额，避免字符串比较导致的错误
          // 注意：比较的是总应付金额（包含逾期费用，减去优惠金额），而不是原始金额
          const paidAmountDecimal = new Decimal(payment.paidAmount);
          const totalPayableAmount = payment.totalPayableAmount;

          if (paidAmountDecimal.gte(totalPayableAmount)) {
            // 已支付金额 >= 总应付金额，标记为已支付
            payment.status = InstallmentStatus.PAID;
            payment.paidAt = paidAt;
          } else {
            // 已支付金额 < 总应付金额，标记为部分支付
            payment.status = InstallmentStatus.PARTIAL_PAID;
          }

          await manager.save(PaymentEntity, payment);
        }

        this.logger.log(`支付回调处理完成: outTradeNo=${outTradeNo}, status=${record.status}`);
        return payment;
      });

      // 事务提交后发射事件，确保数据已持久化
      // 使用 setImmediate 确保事件在当前事务完成后异步发射
      setImmediate(() => {
        this.emitPaymentEvent(
          updatedPayment,
          record,
          thirdPartyPaymentNo,
          isSuccess,
          paidAt,
          callbackData,
          record.paymentType,
        );
      });

      return plainToInstance(OutputPaymentDto, updatedPayment, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      });
    } catch (error) {
      this.logger.error(`支付回调处理失败: outTradeNo=${outTradeNo}`, error);
      return null;
    }
  }

  /**
   * 处理押金退款回调
   *
   * 该方法处理第三方支付平台（如微信支付）的押金退款回调通知
   * 处理完成后会更新押金状态，并发射相应的事件通知订单模块
   *
   * 处理流程：
   * 1. 根据退款单号查找押金记录
   * 2. 幂等性检查（避免重复处理）
   * 3. 更新押金状态
   * 4. 发射押金退款事件通知其他模块
   *
   * @param refundNo 退款单号（平台内部）
   * @param thirdPartyRefundNo 第三方退款流水号
   * @param status 退款状态
   * @param callbackData 原始回调数据
   * @returns 更新后的押金记录
   */
  async handleDepositRefundCallback(
    refundNo: string,
    thirdPartyRefundNo: string,
    status: RefundStatus,
    callbackData?: WxPay.Notify.RefundResult,
  ): Promise<DepositEntity> {
    // 1. 根据退款单号查找押金记录
    const deposit = await this.dataSource.manager.findOne(DepositEntity, {
      where: { refundNo },
    });

    if (!deposit) {
      this.logger.error(`押金记录不存在: refundNo=${refundNo}`);
      throw new NotFoundException('押金记录不存在');
    }

    // 2. 幂等性检查：如果已经处理过相同的回调，直接返回
    if (deposit.thirdPartyRefundNo === thirdPartyRefundNo && deposit.status === DepositStatus.RETURNED) {
      this.logger.warn(`重复的押金退款回调，已忽略: refundNo=${refundNo}, thirdPartyRefundNo=${thirdPartyRefundNo}`);
      return deposit;
    }

    const refundedAt = new Date();

    // 3-4. 在事务中更新押金状态并发射事件
    const updatedDeposit = await this.dataSource.transaction(async manager => {
      // 3. 更新押金记录
      deposit.thirdPartyRefundNo = thirdPartyRefundNo;
      deposit.refundCallbackData = callbackData;

      if (status === RefundStatus.COMPLETED) {
        deposit.status = DepositStatus.RETURNED;
        deposit.unfrozenAt = refundedAt;
      } else if (status === RefundStatus.FAILED || status === RefundStatus.CANCELED) {
        deposit.status = DepositStatus.FAILED;
        deposit.paymentFailureReason =
          status === RefundStatus.CANCELED
            ? '退款已关闭'
            : callbackData?.refund_status === 'ABNORMAL'
              ? '退款异常'
              : '退款失败';
      }
      // PROCESSING 状态保持 RETURNED，等待后续回调

      const savedDeposit = await manager.save(DepositEntity, deposit);

      this.logger.log(
        `押金退款回调处理完成: depositNo=${deposit.depositNo}, refundNo=${refundNo}, status=${status}, depositStatus=${savedDeposit.status}`,
      );

      return savedDeposit;
    });

    // 4. 事务提交后发射事件，确保数据已持久化
    // 使用 setImmediate 确保事件在当前事务完成后异步发射
    setImmediate(() => {
      this.emitDepositRefundEvent(updatedDeposit, thirdPartyRefundNo, status, refundedAt, callbackData);
    });

    return updatedDeposit;
  }

  /**
   * 处理退款回调
   *
   * 该方法处理第三方支付平台（如微信支付）的退款回调通知
   * 处理完成后会更新退款记录、支付记录和支付账单状态，并发射相应的事件
   *
   * 处理流程：
   * 1. 根据退款单号查找退款记录
   * 2. 幂等性检查（避免重复处理）
   * 3. 更新退款记录状态
   * 4. 同步更新关联的支付记录（PaymentRecordEntity）的退款状态
   * 5. 计算已退款金额，更新支付账单（PaymentEntity）的退款状态
   * 6. 发射退款事件通知其他模块
   *
   * @param refundNo 退款单号（平台内部）
   * @param thirdPartyRefundNo 第三方退款流水号
   * @param status 退款状态
   * @param callbackData 原始回调数据
   * @returns 更新后的退款记录
   */
  async handleRefundCallback(
    refundNo: string,
    thirdPartyRefundNo: string,
    status: RefundStatus,
    callbackData?: WxPay.Notify.RefundResult,
  ): Promise<RefundRecordEntity> {
    // 1. 根据退款单号查找退款记录
    const refundRecord = await this.refundRecordRepo.findByRefundNo(refundNo);

    if (!refundRecord) {
      this.logger.error(`退款记录不存在: refundNo=${refundNo}`);
      throw new NotFoundException('退款记录不存在');
    }

    // 2. 幂等性检查：如果已经处理过相同的回调，直接返回
    if (refundRecord.thirdPartyRefundNo === thirdPartyRefundNo && refundRecord.status === status) {
      this.logger.warn(`重复的退款回调，已忽略: refundNo=${refundNo}, thirdPartyRefundNo=${thirdPartyRefundNo}`);
      return refundRecord;
    }

    const refundedAt = new Date();

    // 3-5. 在事务中更新退款记录、支付记录和支付账单状态
    const updatedRefund = await this.dataSource.transaction(async manager => {
      // 3. 更新退款记录
      refundRecord.status = status;
      refundRecord.thirdPartyRefundNo = thirdPartyRefundNo;
      refundRecord.callbackData = callbackData;

      if (status === RefundStatus.COMPLETED) {
        refundRecord.refundedAt = refundedAt;
      }

      if (status === RefundStatus.FAILED || status === RefundStatus.CANCELED) {
        refundRecord.failureReason =
          status === RefundStatus.CANCELED
            ? '退款已关闭'
            : callbackData?.refund_status === 'ABNORMAL'
              ? '退款异常'
              : '退款失败';
      }

      const savedRefund = await manager.save(RefundRecordEntity, refundRecord);

      // 4. 查找并更新关联的支付记录（PaymentRecordEntity）的退款状态
      // 根据退款记录中的 paymentId 查找所有相关的支付记录
      // 如果回调数据中有 out_trade_no（支付记录单号），则优先更新该支付记录
      // 否则更新该支付账单下的所有支付记录
      if (callbackData?.out_trade_no) {
        // 优先根据支付记录单号查找并更新
        // paymentId 为空时（如 OVERDUE_FEE 等）仅按 recordNo 匹配，确保回调可回写
        const where: { recordNo: string; paymentId?: string } = { recordNo: callbackData.out_trade_no };
        if (refundRecord.paymentId) {
          where.paymentId = refundRecord.paymentId;
        }
        const paymentRecord = await manager.findOne(PaymentRecordEntity, {
          where,
          relations: ['payment'],
        });

        if (paymentRecord) {
          paymentRecord.refundStatus = status;
          if (status === RefundStatus.COMPLETED) {
            paymentRecord.refundedAt = refundedAt;
          }
          await manager.save(PaymentRecordEntity, paymentRecord);
          this.logger.log(`支付记录退款状态已更新: recordNo=${paymentRecord.recordNo}, refundStatus=${status}`);
        } else {
          this.logger.warn(
            `未找到关联的支付记录: recordNo=${callbackData.out_trade_no}, paymentId=${refundRecord.paymentId}`,
          );
        }
      } else {
        // 如果没有支付记录单号，更新该支付账单下的所有支付记录
        const paymentRecords = await manager.find(PaymentRecordEntity, {
          where: {
            paymentId: refundRecord.paymentId,
            orderId: refundRecord.orderId,
          },
        });

        if (paymentRecords.length > 0) {
          for (const record of paymentRecords) {
            record.refundStatus = status;
            if (status === RefundStatus.COMPLETED) {
              record.refundedAt = refundedAt;
            }
          }
          await manager.save(PaymentRecordEntity, paymentRecords);
          this.logger.log(
            `已更新 ${paymentRecords.length} 条支付记录的退款状态: paymentId=${refundRecord.paymentId}, refundStatus=${status}`,
          );
        } else {
          this.logger.warn(
            `未找到关联的支付记录: paymentId=${refundRecord.paymentId}, orderId=${refundRecord.orderId}`,
          );
        }
      }

      // 5. 更新支付账单（PaymentEntity）的退款状态
      // 重新加载退款记录以获取最新的关联数据
      const payment = await manager.findOne(PaymentEntity, {
        where: { id: refundRecord.paymentId },
        relations: { refundRecords: true, paymentRecords: true },
      });

      if (payment) {
        // 计算已退款金额（使用退款记录，而不是支付记录）
        const totalRefundAmount = payment.refundedAmount;

        // 使用 Decimal 精确计算
        const paidAmountDecimal = new Decimal(payment.paidAmount || 0);
        const refundAmountDecimal = new Decimal(totalRefundAmount);

        // 判断退款状态
        if (refundAmountDecimal.gte(paidAmountDecimal) && refundAmountDecimal.gt(0)) {
          // 已退款金额 >= 已支付金额，标记为全部退款
          payment.refundStatus = RefundStatus.COMPLETED;
          payment.refundedAt = refundedAt;
        } else if (refundAmountDecimal.gt(0)) {
          // 已退款金额 > 0 但 < 已支付金额，标记为部分退款
          payment.refundStatus = RefundStatus.PARTIAL_REFUND;
          payment.refundedAt = refundedAt;
        } else {
          // 已退款金额 = 0，根据当前退款记录状态更新
          if (status === RefundStatus.PROCESSING) {
            payment.refundStatus = RefundStatus.PROCESSING;
          } else if (status === RefundStatus.FAILED || status === RefundStatus.CANCELED) {
            // 如果所有退款都失败或取消，保持原有状态或设置为 NONE
            const hasProcessingRefund = payment.refundRecords?.some(
              r => r.id !== refundRecord.id && r.status === RefundStatus.PROCESSING,
            );
            if (!hasProcessingRefund) {
              payment.refundStatus = RefundStatus.NONE;
            }
          }
        }

        await manager.save(PaymentEntity, payment);

        this.logger.log(
          `支付账单退款状态已更新: paymentId=${payment.id}, paymentNo=${payment.paymentNo}, refundStatus=${payment.refundStatus}, paidAmount=${paidAmountDecimal.toString()}, refundAmount=${refundAmountDecimal.toString()}`,
        );
      } else {
        this.logger.error(`支付账单不存在: paymentId=${refundRecord.paymentId}`);
      }

      return savedRefund;
    });

    // 6. 事务提交后发射事件，确保数据已持久化
    // 使用 setImmediate 确保事件在当前事务完成后异步发射
    setImmediate(() => {
      this.emitRefundEvent(updatedRefund, thirdPartyRefundNo, status, refundedAt, callbackData);
    });

    return updatedRefund;
  }

  /**
   * 发射押金退款事件
   *
   * @param deposit 押金记录
   * @param thirdPartyRefundNo 第三方退款流水号
   * @param status 退款状态
   * @param refundedAt 退款完成时间
   * @param callbackData 原始回调数据
   */
  private emitDepositRefundEvent(
    deposit: DepositEntity,
    thirdPartyRefundNo: string,
    status: RefundStatus,
    refundedAt: Date,
    callbackData?: WxPay.Notify.RefundResult,
  ): void {
    try {
      if (status === RefundStatus.COMPLETED) {
        const event = new DepositRefundCompletedEvent(
          deposit.orderNo,
          deposit.thirdPartyPaymentNo || '',
          deposit.depositNo,
          deposit.refundNo || '',
          thirdPartyRefundNo,
          Number(deposit.amount),
          refundedAt,
          callbackData,
        );

        this.logger.log(`发射押金退款完成事件: depositNo=${deposit.depositNo}, refundNo=${deposit.refundNo}`);
        this.eventEmitter.emit(PaymentEvents.DEPOSIT_REFUND_COMPLETED, event);
      } else if (status === RefundStatus.FAILED) {
        const event = new DepositRefundFailedEvent(
          deposit.orderNo,
          deposit.thirdPartyPaymentNo || '',
          deposit.depositNo,
          deposit.refundNo || '',
          deposit.paymentFailureReason || '退款失败',
          callbackData,
        );

        this.logger.log(`发射押金退款失败事件: depositNo=${deposit.depositNo}, refundNo=${deposit.refundNo}`);
        this.eventEmitter.emit(PaymentEvents.DEPOSIT_REFUND_FAILED, event);
      }
    } catch (error) {
      this.logger.error(`发射押金退款事件失败: depositNo=${deposit.depositNo}`, error);
    }
  }

  /**
   * 发射支付事件
   *
   * 根据支付状态发射相应的事件，通知其他模块（如订单模块）
   * 使用事件驱动方式解耦模块间依赖，避免循环依赖
   */
  private emitPaymentEvent(
    payment: PaymentEntity,
    record: PaymentRecordEntity,
    thirdPartyPaymentNo: string,
    isSuccess: boolean,
    paidAt: Date,
    callbackData?: Record<string, any>,
    paymentType?: string,
  ): void {
    try {
      if (isSuccess) {
        const event = new PaymentCompletedEvent(
          payment.paymentNo,
          payment.orderNo,
          thirdPartyPaymentNo,
          payment.totalPayableAmount, // 使用总应付金额（包含逾期费用，减去优惠金额）
          record.id,
          paidAt,
          callbackData,
          paymentType,
        );

        this.logger.log(`发射支付完成事件: paymentNo=${payment.paymentNo}, orderId=${payment.orderId}`);
        this.eventEmitter.emit(PaymentEvents.COMPLETED, event);
      } else {
        const event = new PaymentFailedEvent(
          payment.paymentNo,
          payment.orderNo,
          thirdPartyPaymentNo,
          record.id,
          '支付失败',
          callbackData,
        );
        this.logger.log(`发射支付失败事件: paymentNo=${payment.paymentNo}, orderId=${payment.orderId}`);
        this.eventEmitter.emit(PaymentEvents.FAILED, event);
      }
    } catch (error) {
      // 事件发射失败不应影响回调处理的响应
      // 记录错误日志，后续可通过补偿机制处理
      this.logger.error(`Failed to emit payment event: paymentNo=${payment.paymentNo}`, error);
    }
  }

  /**
   * 发射退款事件
   *
   * @param refund 退款记录
   * @param thirdPartyRefundNo 第三方退款流水号
   * @param status 退款状态
   * @param refundedAt 退款完成时间
   * @param callbackData 原始回调数据
   */
  private emitRefundEvent(
    refund: RefundRecordEntity,
    thirdPartyRefundNo: string,
    status: RefundStatus,
    refundedAt: Date,
    callbackData?: WxPay.Notify.RefundResult,
  ): void {
    try {
      if (status === RefundStatus.COMPLETED) {
        const event = new RefundCompletedEvent(
          refund.paymentNo,
          refund.orderNo,
          refund.payment?.thirdPartyPaymentNo || '', // thirdPartyPaymentNo - 退款时可能没有,
          refund.refundNo,
          thirdPartyRefundNo,
          Number(refund.amount),
          refundedAt,
          callbackData,
        );

        this.logger.log(`发射退款完成事件: refundNo=${refund.refundNo}, orderId=${refund.orderId}`);
        this.eventEmitter.emit(PaymentEvents.REFUND_COMPLETED, event);
      } else if (status === RefundStatus.FAILED) {
        const event = new RefundFailedEvent(
          refund.paymentNo,
          refund.orderNo,
          '',
          refund.refundNo,
          '退款失败',
          callbackData,
        );

        this.logger.log(`发射退款失败事件: refundNo=${refund.refundNo}, orderId=${refund.orderId}`);
        this.eventEmitter.emit(PaymentEvents.REFUND_FAILED, event);
      }
    } catch (error) {
      this.logger.error(`发射退款事件失败: refundNo=${refund.refundNo}`, error);
    }
  }
}
