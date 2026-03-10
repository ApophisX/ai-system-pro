/**
 * 订单超时未支付任务数据
 */
export interface PaymentTimeoutJobData {
  orderId: string;
  orderNo: string;
  paymentExpiredAt: Date;
  /** 续租支付超时：仅关闭指定 Payment，不取消订单 */
  paymentId?: string;
}

/**
 * 订单分期逾期任务数据
 */
export type InstallmentOverdueJobData = {
  paymentId: string;
  orderId: string;
  orderNo: string;
  payableTime: Date;
};

/**
 * 订单支付逾期任务数据（租期到期未归还）
 */
export interface RentalOverdueJobData {
  orderId: string;
  orderNo: string;
  endDate: Date;
}

/**
 * 押金扣款超时任务数据（扣款申请超时未响应，触发平台审核）
 */
export interface DepositDeductionTimeoutJobData {
  deductionId: string;
  deductionNo: string;
  orderId: string;
  orderNo: string;
  depositId: string;
  timeoutAt: Date;
}

/**
 * 取消确认超时任务数据（承租方申请取消，出租方24小时未操作，自动退款）
 */
export interface CancelConfirmTimeoutJobData {
  orderId: string;
  orderNo: string;
  timeoutAt: Date;
}

/**
 * 归还确认超时任务数据（承租方提交归还，出租方24小时未操作，自动确认归还）
 */
export interface ReturnConfirmTimeoutJobData {
  orderId: string;
  orderNo: string;
  timeoutAt: Date;
}
