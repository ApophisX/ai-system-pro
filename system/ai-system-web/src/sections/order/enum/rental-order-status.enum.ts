/**
 * 租赁订单状态枚举
 *
 * 定义订单生命周期状态
 */
export enum RentalOrderStatus {
  /**
   * 已创建，待支付
   */
  CREATED = 'created',

  /**
   * 已支付，待使用
   */
  PAID = 'paid',

  /**
   * 使用中
   */
  IN_USE = 'in_use',

  /**
   * 超时使用（超过租期仍在使用中）
   */
  OVERDUE_USE = 'overdue_use',

  /**
   * 逾期（租期到期但未归还）
   */
  OVERDUE = 'overdue',

  /**
   * 已归还，待确认
   */
  RETURNED = 'returned',

  /**
   * 已完成
   */
  COMPLETED = 'completed',

  /**
   * 已取消
   */
  CANCELED = 'canceled',

  /**
   * 争议中
   */
  DISPUTE = 'dispute',

  /**
   * 强制关闭
   */
  CLOSED = 'closed',

  /**
   * 支付超时
   */
  PAYMENT_TIMEOUT = 'payment_timeout',
}
