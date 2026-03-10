import { Injectable } from '@nestjs/common';
import {
  CreateRentalOrderDto,
  PayRentalOrderDto,
  CancelRentalOrderDto,
  CancelByLessorDto,
  ApproveCancelOrderDto,
  RefundRentalOrderDto,
  QueryRentalOrderDto,
  OutputRentalOrderDto,
  OutputLessorOperationPermissionDto,
  PayInstallmentDto,
  PayOverdueUseFeeDto,
  OutputPayDepositResultDto,
  EndOrderDto,
  CreateDepositDeductionDto,
  RefundPaymentRecordDto,
  ConfirmDepositDeductionDto,
  CancelDepositDeductionDto,
  BindAssetInventoryDto,
  RebindAssetInventoryDto,
  ConfirmReceiptDto,
  ReturnAssetDto,
  ConfirmReturnAssetDto,
  OutputPayRentalOrderResultDto,
  SetDiscountDto,
  SetPaymentDiscountDto,
  SetOverdueUseDiscountDto,
  ForceCloseOrderDto,
} from '../dto';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import { QueryPendingRentalOrderDto } from '../dto';
import { RequestContext } from '@/common/dtos/request-context.dto';
import { RentalOrderCreateService } from './rental-order-create.service';
import { RentalOrderCancelService } from './rental-order-cancel.service';
import { RentalOrderEndService } from './rental-order-end.service';
import { RentalOrderRefundService } from './rental-order-refund.service';
import { RentalOrderQueryService } from './rental-order-query.service';
import { RentalOrderPaymentService } from './rental-order-payment.service';
import { RentalOrderDeductDepositService } from './rental-order-deduct-deposit.service';
import { RentalOrderDepositRefundService } from './rental-order-deposit-refund.service';
import { RentalOrderBindInventoryService } from './rental-order-bind-inventory.service';
import { RentalOrderConfirmReceiptService } from './rental-order-confirm-receipt.service';
import { RentalOrderReturnAssetService } from './rental-order-return-asset.service';
import { RentalOrderConfirmReturnService } from './rental-order-confirm-return.service';
import { RentalOrderDiscountService } from './rental-order-discount.service';
import { RentalOrderForceCloseService } from './rental-order-force-close.service';

/**
 * 租赁订单服务（门面）
 *
 * 对外统一 API，委托给 Create / Cancel / End / Refund / Query / Payment / DeductDeposit 等 feature 服务。
 * Controller 仅依赖本门面，便于维护与扩展。
 */
@Injectable()
export class RentalOrderService {
  constructor(
    private readonly createService: RentalOrderCreateService,
    private readonly cancelService: RentalOrderCancelService,
    private readonly endService: RentalOrderEndService,
    private readonly refundService: RentalOrderRefundService,
    private readonly queryService: RentalOrderQueryService,
    private readonly paymentService: RentalOrderPaymentService,
    private readonly deductDepositService: RentalOrderDeductDepositService,
    private readonly depositRefundService: RentalOrderDepositRefundService,
    private readonly bindInventoryService: RentalOrderBindInventoryService,
    private readonly confirmReceiptService: RentalOrderConfirmReceiptService,
    private readonly returnAssetService: RentalOrderReturnAssetService,
    private readonly confirmReturnService: RentalOrderConfirmReturnService,
    private readonly discountService: RentalOrderDiscountService,
    private readonly forceCloseService: RentalOrderForceCloseService,
  ) {
    //
  }

  // 创建订单
  async createOrder(userId: string, dto: CreateRentalOrderDto): Promise<OutputRentalOrderDto> {
    return this.createService.createOrder(userId, dto);
  }

  // 取消订单
  async cancelOrderByLessee(userId: string, orderId: string, dto: CancelRentalOrderDto): Promise<OutputRentalOrderDto> {
    return this.cancelService.cancelOrderByLessee(userId, orderId, dto);
  }

  // 删除订单
  async deleteOrder(userId: string, orderId: string): Promise<void> {
    return this.cancelService.deleteOrder(userId, orderId);
  }

  // 取消取消订单申请
  async revokeCancelOrder(userId: string, orderId: string): Promise<OutputRentalOrderDto> {
    return this.cancelService.revokeCancelOrder(userId, orderId);
  }

  // 审核取消订单申请
  async approveCancelOrder(userId: string, orderId: string, dto: ApproveCancelOrderDto): Promise<OutputRentalOrderDto> {
    return this.cancelService.approveCancelOrder(userId, orderId, dto);
  }

  // 由出租方取消订单
  async cancelByLessorOrder(userId: string, orderId: string, dto?: CancelByLessorDto): Promise<OutputRentalOrderDto> {
    return this.cancelService.cancelByLessorOrder(userId, orderId, dto);
  }

  // 结束订单
  async endOrder(userId: string, orderId: string, dto?: EndOrderDto): Promise<OutputRentalOrderDto> {
    return this.endService.endOrder(userId, orderId, dto);
  }

  // 退款订单
  async refundOrder(userId: string, dto: RefundRentalOrderDto): Promise<OutputRentalOrderDto> {
    return this.refundService.refundOrder(userId, dto);
  }

  // 退款支付记录
  async refundPaymentRecord(
    userId: string,
    orderId: string,
    dto: RefundPaymentRecordDto,
  ): Promise<OutputRentalOrderDto> {
    return this.refundService.refundPaymentRecord(userId, orderId, dto);
  }

  // 查询订单列表
  async queryOrders(
    userId: string,
    dto: QueryRentalOrderDto,
    role: 'lessee' | 'lessor' = 'lessee',
  ): Promise<{ data: OutputRentalOrderDto[]; meta: PaginationMetaDto }> {
    return this.queryService.queryOrders(userId, dto, role);
  }

  // 根据ID获取订单
  async getOrderById(id: string, userId?: string): Promise<OutputRentalOrderDto | null> {
    return this.queryService.getOrderById(id, userId);
  }

  // 查询待处理订单（出租方）
  async queryPendingOrders(
    userId: string,
    dto: QueryPendingRentalOrderDto,
  ): Promise<{ data: OutputRentalOrderDto[]; meta: PaginationMetaDto }> {
    return this.queryService.queryPendingOrders(userId, dto);
  }

  // 扣除押金
  async deductDeposit(userId: string, orderId: string, dto: CreateDepositDeductionDto): Promise<OutputRentalOrderDto> {
    return this.deductDepositService.deductDeposit(userId, orderId, dto);
  }

  // 支付订单
  async payOrder(userId: string, dto: PayRentalOrderDto, ctx: RequestContext) {
    return this.paymentService.payOrder(userId, dto, ctx);
  }

  // 支付押金
  async payDeposit(userId: string, dto: PayRentalOrderDto, ctx: RequestContext): Promise<OutputPayDepositResultDto> {
    return this.paymentService.payDeposit(userId, dto, ctx);
  }

  // 支付分期
  async payInstallment(userId: string, dto: PayInstallmentDto, ctx: RequestContext) {
    return this.paymentService.payInstallment(userId, dto, ctx);
  }

  // 支付超时使用费（仅限：先付后用、非分期、超时使用状态）
  async payOverdueUseFee(
    userId: string,
    orderId: string,
    dto: PayOverdueUseFeeDto,
  ): Promise<OutputPayRentalOrderResultDto> {
    return this.paymentService.payOverdueUseFee(userId, orderId, dto);
  }

  // 退还押金
  async refundDeposit(userId: string, orderId: string, remark?: string): Promise<OutputRentalOrderDto> {
    return this.depositRefundService.refundDeposit(userId, orderId, remark);
  }

  // 确认押金扣款申请
  async confirmDepositDeduction(
    userId: string,
    orderId: string,
    dto: ConfirmDepositDeductionDto,
  ): Promise<OutputRentalOrderDto> {
    return this.deductDepositService.confirmDepositDeduction(userId, orderId, dto);
  }

  // 取消押金扣款申请
  async cancelDepositDeduction(
    userId: string,
    orderId: string,
    dto: CancelDepositDeductionDto,
  ): Promise<OutputRentalOrderDto> {
    return this.deductDepositService.cancelDepositDeduction(userId, orderId, dto);
  }

  // 出租方获取订单操作权限（供前端条件判断与 UI 展示）
  async getLessorOperationPermission(userId: string, orderId: string): Promise<OutputLessorOperationPermissionDto> {
    return this.queryService.getLessorOperationPermission(userId, orderId);
  }

  // 绑定资产实例（出租方）
  async bindAssetInventory(
    lessorId: string,
    orderId: string,
    dto: BindAssetInventoryDto,
  ): Promise<OutputRentalOrderDto> {
    return this.bindInventoryService.bindAssetInventory(lessorId, orderId, dto);
  }

  // 承租方确认收货
  async confirmReceipt(lesseeId: string, orderId: string, dto: ConfirmReceiptDto): Promise<OutputRentalOrderDto> {
    return this.confirmReceiptService.confirmReceipt(lesseeId, orderId, dto);
  }

  // 换绑资产实例（出租方）
  async rebindAssetInventory(
    lessorId: string,
    orderId: string,
    dto: RebindAssetInventoryDto,
  ): Promise<OutputRentalOrderDto> {
    return this.bindInventoryService.rebindAssetInventory(lessorId, orderId, dto);
  }

  // 承租方归还资产
  async returnAsset(lesseeId: string, orderId: string, dto: ReturnAssetDto): Promise<OutputRentalOrderDto> {
    return this.returnAssetService.returnAsset(lesseeId, orderId, dto);
  }

  // 出租方确认归还资产
  async confirmReturn(lessorId: string, orderId: string, dto: ConfirmReturnAssetDto): Promise<OutputRentalOrderDto> {
    return this.confirmReturnService.confirmReturn(lessorId, orderId, dto);
  }

  // 出租方设置账单优惠金额（订单待支付时）
  async setOrderDiscount(lessorId: string, orderId: string, dto: SetDiscountDto): Promise<OutputRentalOrderDto> {
    return this.discountService.setOrderDiscount(lessorId, orderId, dto);
  }

  // 出租方设置分期账单、续租账单优惠金额（分期待支付或续租待支付时）
  async setPaymentDiscount(
    lessorId: string,
    orderId: string,
    dto: SetPaymentDiscountDto,
  ): Promise<OutputRentalOrderDto> {
    return this.discountService.setPaymentDiscount(lessorId, orderId, dto);
  }

  // 出租方设置超期使用优惠金额（超期使用费用待支付时）
  async setOverdueUseDiscount(
    lessorId: string,
    orderId: string,
    dto: SetOverdueUseDiscountDto,
  ): Promise<OutputRentalOrderDto> {
    return this.discountService.setOverdueUseDiscount(lessorId, orderId, dto);
  }

  // 出租方强制关闭在租订单
  async forceCloseOrder(lessorId: string, orderId: string, dto: ForceCloseOrderDto): Promise<OutputRentalOrderDto> {
    return this.forceCloseService.forceCloseOrder(lessorId, orderId, dto);
  }
}
