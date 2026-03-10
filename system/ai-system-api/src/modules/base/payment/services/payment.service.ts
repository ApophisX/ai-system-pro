import { Injectable } from '@nestjs/common';
import { PaymentQueryService } from './payment-query.service';
import { PaymentCreateService } from './payment-create.service';
import { PaymentRefundService } from './payment-refund.service';
import { PaymentCallbackService } from './payment-callback.service';
import { CreateRefundDto, QueryPaymentDto } from '../dto';
import { OutputPaymentDto } from '../dto/output-payment.dto';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import { RefundRecordEntity } from '../entities';
import { PaymentProvider } from '../enums';
import { OutputPayRentalOrderResultDto } from '@/modules/rental-order/dto';
import { RentalOrderEntity } from '@/modules/rental-order/entities';
import { PaymentEntity, PaymentRecordEntity } from '../entities';
import { EntityManager } from 'typeorm';
import { RefundStatus } from '../enums';

/**
 * 支付服务（门面服务）
 *
 * 组合各个子服务，提供统一的支付服务接口
 * 保持向后兼容，所有原有方法都通过委托给子服务实现
 */
@Injectable()
export class PaymentService {
  constructor(
    private readonly queryService: PaymentQueryService,
    private readonly createService: PaymentCreateService,
    private readonly refundService: PaymentRefundService,
    private readonly callbackService: PaymentCallbackService,
  ) {
    //
  }

  // ====================================== 查询相关方法 ===========================================

  /**
   * 查询支付记录
   */
  async queryPayments(
    userId: string,
    dto: QueryPaymentDto,
  ): Promise<{ data: OutputPaymentDto[]; meta: PaginationMetaDto }> {
    return this.queryService.queryPayments(userId, dto);
  }

  /**
   * 根据 ID 获取支付记录
   */
  async getPaymentById(id: string, userId?: string): Promise<OutputPaymentDto | null> {
    return this.queryService.getPaymentById(id, userId);
  }

  /**
   * 根据订单 ID 获取支付记录
   */
  async getPaymentsByOrderId(orderId: string): Promise<OutputPaymentDto[]> {
    return this.queryService.getPaymentsByOrderId(orderId);
  }

  // ====================================== 创建支付相关方法 ===========================================

  /**
   * 创建租赁订单第一期租金支付记录并调用第三方支付
   */
  async payFirstRentalOrderPayment(
    userId: string,
    order: RentalOrderEntity,
    firstPayment: PaymentEntity,
    provider: PaymentProvider,
  ): Promise<OutputPayRentalOrderResultDto> {
    return this.createService.payFirstRentalOrderPayment(userId, order, firstPayment, provider);
  }

  /**
   * 创建分期账单支付记录并调用第三方支付
   */
  async createInstallmentPaymentRecord(
    userId: string,
    order: RentalOrderEntity,
    payment: PaymentEntity,
    provider: PaymentProvider,
  ): Promise<OutputPayRentalOrderResultDto> {
    return this.createService.createInstallmentPaymentRecord(userId, order, payment, provider);
  }

  /**
   * 创建续租支付记录并调用第三方支付
   */
  async createRenewalPaymentRecord(
    userId: string,
    order: RentalOrderEntity,
    payment: PaymentEntity,
    provider: PaymentProvider,
  ): Promise<OutputPayRentalOrderResultDto> {
    return this.createService.createRenewalPaymentRecord(userId, order, payment, provider);
  }

  /**
   * 创建超时使用费支付记录并调用第三方支付
   *
   * 仅适用于：先付后用、非分期订单，且订单处于超时使用状态（overdueStatus=OVERDUE_USE）。
   * overdueStatus=OVERDUE_FEE_PAID 表示已付清，不可再次创建支付
   */
  async createOverdueFeePaymentRecord(
    userId: string,
    order: RentalOrderEntity,
    amount: number,
    provider: PaymentProvider,
  ): Promise<OutputPayRentalOrderResultDto> {
    return this.createService.createOverdueFeePaymentRecord(userId, order, amount, provider);
  }

  // ====================================== 退款相关方法 ===========================================

  /**
   * 创建退款记录
   */
  async createRefund(userId: string, dto: CreateRefundDto): Promise<RefundRecordEntity> {
    return this.refundService.createRefund(userId, dto);
  }

  /**
   * 在订单取消时处理租金退款（所有已支付的账单）
   */
  async refundAllPaymentsForOrderCancel(
    paidPayments: PaymentEntity[],
    reason: string,
    manager: EntityManager,
  ): Promise<void> {
    return this.refundService.refundAllPaymentsForOrderCancel(paidPayments, reason, manager);
  }

  /**
   * 针对单笔已支付账单生成退款记录，并处理相应业务逻辑
   */
  async refundPaymentWithManager(payment: PaymentEntity, reason: string, manager: EntityManager): Promise<void> {
    return this.refundService.refundPaymentWithManager(payment, reason, manager);
  }

  /**
   * 创建退款记录并根据支付渠道发起退款操作（全额退款，用于订单取消场景）
   */
  async refundPaymentRecordWithManager(
    paymentRecord: PaymentRecordEntity,
    reason: string,
    manager: EntityManager,
  ): Promise<RefundStatus> {
    return this.refundService.refundPaymentRecordWithManager(paymentRecord, reason, manager);
  }

  /**
   * 单笔支付记录部分退款（支持多次部分退款）
   */
  async refundPaymentRecordPartialWithManager(
    paymentRecord: PaymentRecordEntity,
    refundAmount: number,
    reason: string,
    manager: EntityManager,
    updatePaymentStatus: boolean = true,
  ): Promise<RefundStatus> {
    return this.refundService.refundPaymentRecordPartialWithManager(
      paymentRecord,
      refundAmount,
      reason,
      manager,
      updatePaymentStatus,
    );
  }

  /**
   * 获取支付记录的已退款金额（公开方法）
   */
  async getRefundedAmountForPaymentRecord(paymentRecordId: string): Promise<number> {
    return this.refundService.getRefundedAmountForPaymentRecord(paymentRecordId);
  }

  // ====================================== 回调处理方法 ===========================================

  /**
   * 处理押金回调
   */
  handleDepositCallback(
    outTradeNo: string,
    thirdPartyPaymentNo: string,
    isSuccess: boolean,
    attach: WxPay.WxPayAttach,
    callbackData: WxPay.Notify.TransactionResult,
  ) {
    return this.callbackService.handleDepositCallback(outTradeNo, thirdPartyPaymentNo, isSuccess, attach, callbackData);
  }

  /**
   * 处理支付回调
   */
  async handlePaymentCallback(
    outTradeNo: string,
    thirdPartyPaymentNo: string,
    isSuccess: boolean,
    callbackData: WxPay.Notify.TransactionResult,
  ): Promise<OutputPaymentDto | null> {
    return this.callbackService.handlePaymentCallback(outTradeNo, thirdPartyPaymentNo, isSuccess, callbackData);
  }

  /**
   * 处理超时使用费支付回调（委托给 handlePaymentCallback，内部按 paymentType 分支处理）
   */
  async handleOverdueFeeCallback(
    outTradeNo: string,
    thirdPartyPaymentNo: string,
    isSuccess: boolean,
    callbackData: WxPay.Notify.TransactionResult,
  ): Promise<OutputPaymentDto | null> {
    return this.callbackService.handlePaymentCallback(outTradeNo, thirdPartyPaymentNo, isSuccess, callbackData);
  }

  /**
   * 处理押金退款回调
   */
  async handleDepositRefundCallback(
    refundNo: string,
    thirdPartyRefundNo: string,
    status: RefundStatus,
    callbackData?: WxPay.Notify.RefundResult,
  ) {
    return this.callbackService.handleDepositRefundCallback(refundNo, thirdPartyRefundNo, status, callbackData);
  }

  /**
   * 处理退款回调
   */
  async handleRefundCallback(
    refundNo: string,
    thirdPartyRefundNo: string,
    status: RefundStatus,
    callbackData?: WxPay.Notify.RefundResult,
  ): Promise<RefundRecordEntity> {
    return this.callbackService.handleRefundCallback(refundNo, thirdPartyRefundNo, status, callbackData);
  }
}
