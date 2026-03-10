/**
 * 租赁订单使用状态枚举
 *
 * 定义订单使用阶段的状态（使用状态）
 * 注意：逾期/超时使用由 RentalOrderOverdueStatus 单独管理
 *
 * 状态组合规则：
 * - status = CREATED/PENDING_RECEIPT → useageStatus = NONE（待收货阶段）
 * - status = PENDING_RECEIPT + 承租方确认收货 → status = RECEIVED, useageStatus = IN_USE（使用中）
 * - useageStatus = IN_USE + 租期到期/逾期 → overdueStatus = OVERDUE_USE/OVERDUE（见 RentalOrderOverdueStatus）
 * - OVERDUE_USE + 付清超时使用费 → overdueStatus = OVERDUE_FEE_PAID
 * - useageStatus = IN_USE + 承租方提交归还 → useageStatus = RETURNED_PENDING（已归还待确认）
 * - useageStatus = RETURNED_PENDING + 出租方确认归还 → useageStatus = RETURNED（已归还）
 * - status = DISPUTE + 拒绝归还 → useageStatus = REJECTED（拒绝归还）
 */
export enum RentalOrderUsageStatus {
  /**
   * 无使用状态（订单尚未进入使用阶段）
   */
  NONE = 'none',

  /**
   * 使用中（正常使用阶段，含逾期时 overdueStatus 为 OVERDUE_USE/OVERDUE，付清超时费后为 OVERDUE_FEE_PAID）
   */
  IN_USE = 'in_use',

  /**
   * 已归还（出租方确认归还后）
   */
  RETURNED = 'returned',

  /**
   * 待归还（使用中，等待承租方归还）
   */
  WAIT_RETURN = 'wait_return',

  /**
   * 已归还待确认（承租方已提交归还，等待出租方确认）
   */
  RETURNED_PENDING = 'returned_pending',

  /**
   * 拒绝归还（出租方拒绝归还申请）
   * 对应 status: DISPUTE
   */
  REJECTED = 'rejected',
}
export type RentalOrderUsageStatusType = `${RentalOrderUsageStatus}`;
export const RentalOrderUsageStatusLabel: Record<RentalOrderUsageStatus, string> = {
  [RentalOrderUsageStatus.NONE]: '无使用状态',
  [RentalOrderUsageStatus.IN_USE]: '使用中',
  [RentalOrderUsageStatus.RETURNED]: '已归还',
  [RentalOrderUsageStatus.WAIT_RETURN]: '待归还',
  [RentalOrderUsageStatus.RETURNED_PENDING]: '已归还，待确认',
  [RentalOrderUsageStatus.REJECTED]: '未归还', // 商家未确认归还
};

export const InUseUsageStatuses = [
  RentalOrderUsageStatus.IN_USE,
  RentalOrderUsageStatus.WAIT_RETURN,
  RentalOrderUsageStatus.REJECTED,
] as const;
