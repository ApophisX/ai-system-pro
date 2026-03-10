/**
 * 退款状态枚举
 */
export enum RefundStatus {
  /**
   * 无退款
   */
  NONE = 'none',

  /**
   * 退款中
   */
  PROCESSING = 'processing',

  /**
   * 退款成功
   */
  COMPLETED = 'completed',

  /**
   * 退款失败
   */
  FAILED = 'failed',

  /**
   * 退款超时
   */
  TIMEOUT = 'timeout',

  /**
   * 退款取消
   */
  CANCELED = 'canceled',

  /**
   * 部分退款
   */
  PARTIAL_REFUND = 'partial_refund',
}
