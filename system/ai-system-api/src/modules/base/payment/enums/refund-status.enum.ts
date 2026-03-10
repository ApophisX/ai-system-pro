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

export const RefundStatusLabelMap: Record<RefundStatus, string> = {
  [RefundStatus.NONE]: '无退款',
  [RefundStatus.PROCESSING]: '退款中',
  [RefundStatus.COMPLETED]: '退款成功',
  [RefundStatus.FAILED]: '退款失败',
  [RefundStatus.TIMEOUT]: '退款超时',
  [RefundStatus.CANCELED]: '退款取消',
  [RefundStatus.PARTIAL_REFUND]: '部分退款',
};
