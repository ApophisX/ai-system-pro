/**
 * 分期支付状态枚举
 */
export enum InstallmentStatus {
  /**
   *  生成中
   */
  GENERATING = 'generating',

  /**
   * 待支付
   */
  PENDING = 'pending',

  /**
   * 已到期
   */
  DUE = 'due',

  /**
   * 已支付
   */
  PAID = 'paid',

  /**
   * 逾期
   */
  OVERDUE = 'overdue',

  /**
   * 已取消
   */
  CANCELED = 'canceled',

  /**
   * 已关闭
   */
  CLOSED = 'closed',

  /**
   * 已过期
   */
  EXPIRED = 'expired',

  /**
   * 部分支付
   */
  PARTIAL_PAID = 'partial_paid',

  /**
   * 已完成
   */
  COMPLETED = 'completed',
}
