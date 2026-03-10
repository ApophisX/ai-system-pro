/**
 * 支付状态枚举
 */
export enum PaymentStatus {
  /**
   * 待支付
   */
  PENDING = 'pending',

  /**
   * 处理中
   */
  PROCESSING = 'processing',

  /**
   * 支付成功
   */
  COMPLETED = 'completed',

  /**
   * 支付失败
   */
  FAILED = 'failed',

  /**
   * 支付超时
   */
  TIMEOUT = 'timeout',

  /**
   * 支付取消
   */
  CANCELED = 'canceled',
}

export const PaymentStatusLabel: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: '待支付',
  [PaymentStatus.PROCESSING]: '处理中',
  [PaymentStatus.COMPLETED]: '支付成功',
  [PaymentStatus.FAILED]: '支付失败',
  [PaymentStatus.TIMEOUT]: '支付超时',
  [PaymentStatus.CANCELED]: '支付取消',
};
