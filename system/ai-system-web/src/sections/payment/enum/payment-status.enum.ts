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
