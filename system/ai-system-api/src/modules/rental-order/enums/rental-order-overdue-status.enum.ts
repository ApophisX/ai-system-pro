/**
 * 租赁订单逾期状态枚举
 *
 * 定义订单的逾期/超时使用状态
 * 从 useageStatus 中提取，职责分离：useageStatus 表示使用阶段，overdueStatus 表示是否逾期
 *
 * 状态流转规则：
 * - useageStatus = IN_USE + 租期到期（先付后用，非分期）→ overdueStatus = OVERDUE_USE（超时使用）
 * - useageStatus = IN_USE + 分期账单逾期或先用后付逾期 → overdueStatus = OVERDUE（逾期）
 * - OVERDUE_USE/OVERDUE + 付清全部超时使用费 → overdueStatus = OVERDUE_FEE_PAID（超时使用费已支付）
 * - 订单归还确认/完成/取消后 → overdueStatus = NONE（清零）
 */
export enum RentalOrderOverdueStatus {
  /**
   * 未逾期
   */
  NONE = 'none',

  /**
   * 超时使用（超过租期仍在使用中，先付后用模式，非分期）
   */
  OVERDUE_USE = 'overdue_use',

  /**
   * 逾期（分期账单逾期或先用后付逾期）
   */
  OVERDUE = 'overdue',

  /**
   * 超时使用费已支付
   */
  OVERDUE_FEE_PAID = 'overdue_fee_paid',
}

export const RentalOrderOverdueStatusLabel: Record<RentalOrderOverdueStatus, string> = {
  [RentalOrderOverdueStatus.NONE]: '未逾期',
  [RentalOrderOverdueStatus.OVERDUE_USE]: '已超时',
  [RentalOrderOverdueStatus.OVERDUE]: '已逾期',
  [RentalOrderOverdueStatus.OVERDUE_FEE_PAID]: '已支付',
};
