/**
 * 租赁订单退款状态枚举
 *
 * 定义订单退款流程状态
 */
export enum RentalOrderRefundStatus {
  /**
   * 无退款（默认状态）
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
