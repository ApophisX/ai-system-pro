/**
 * 租赁订单主状态枚举
 *
 * 定义订单生命周期的主状态（订单整体状态）
 * 注意：
 * - 支付相关状态请使用 RentalOrderPayStatus
 * - 使用相关状态请使用 RentalOrderUsageStatus
 *
 * 状态流转规则：
 * - CREATED → PENDING_RECEIPT: 支付完成（payStatus: PENDING → COMPLETED）
 * - PENDING_RECEIPT → RECEIVED: 承租方确认收货，useageStatus 变为 IN_USE
 * - IN_USE + 租期到期: overdueStatus = OVERDUE_USE（先付后用）或 OVERDUE（先用后付）
 * - IN_USE + 分期账单逾期: overdueStatus = OVERDUE
 * - OVERDUE_USE + 付清超时使用费: overdueStatus = OVERDUE_FEE_PAID
 * - IN_USE + 确认归还: useageStatus = RETURNED
 * - RETURNED → COMPLETED: 订单完成
 * - 任意状态 → CANCELED/DISPUTE/CLOSED: 取消/争议/关闭
 *
 * 状态与支付状态映射：
 * - CREATED: 订单已创建，payStatus 应为 PENDING（待支付）
 * - PENDING_RECEIPT: 支付完成，等待收货，payStatus 应为 COMPLETED（支付成功）
 * - RECEIVED: 已收货、使用中，useageStatus = IN_USE，overdueStatus = NONE/OVERDUE_USE/OVERDUE/OVERDUE_FEE_PAID
 * - CANCELED: 订单已取消，如果因支付超时取消，payStatus 应为 TIMEOUT（支付超时）
 */
export enum RentalOrderStatus {
  /**
   * 已创建（订单初始状态，此时 payStatus = PENDING）
   */
  CREATED = 'created',

  /**
   * 待收货（支付完成，等待收货，此时 payStatus = COMPLETED）
   */
  PENDING_RECEIPT = 'pending_receipt',

  /**
   * 已收货、使用中
   */
  RECEIVED = 'received',

  /**
   * 已完成
   */
  COMPLETED = 'completed',

  /**
   * 已取消（如果因支付超时取消，payStatus = TIMEOUT）
   */
  CANCELED = 'canceled',

  /**
   * 争议中
   */
  DISPUTE = 'dispute',

  /**
   * 已关闭（强制关闭）
   */
  CLOSED = 'closed',

  /**
   * 等待取消确认（已支付租金和押金，等待出租方同意取消）
   */
  CANCEL_PENDING = 'cancel_pending',
}

export const RentalOrderStatusLabel: Record<RentalOrderStatus, string> = {
  [RentalOrderStatus.CREATED]: '待支付',
  [RentalOrderStatus.PENDING_RECEIPT]: '待收货',
  [RentalOrderStatus.RECEIVED]: '已收货',
  [RentalOrderStatus.COMPLETED]: '已完成',
  [RentalOrderStatus.CANCELED]: '已取消',
  [RentalOrderStatus.DISPUTE]: '争议中',
  [RentalOrderStatus.CLOSED]: '已关闭',
  [RentalOrderStatus.CANCEL_PENDING]: '等待取消确认',
};
