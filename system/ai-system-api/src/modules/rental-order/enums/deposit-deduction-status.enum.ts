/**
 * 押金扣款状态枚举
 */
export enum DepositDeductionStatus {
  /**
   * 待用户确认（出租方已提交申请，等待承租方响应）
   */
  PENDING_USER_CONFIRM = 'pending_user_confirm',

  /**
   * 待审核（等待平台审核，用户拒绝或超时未响应后进入此状态）
   */
  PENDING_AUDIT = 'pending_audit',

  /**
   * 平台已审核（平台审核通过，进入可执行状态）
   */
  PLATFORM_APPROVED = 'platform_approved',

  /**
   * 平台已拒绝（平台审核拒绝，流程终止）
   */
  PLATFORM_REJECTED = 'platform_rejected',

  /**
   * 已执行（扣款已成功执行）
   */
  EXECUTED = 'executed',

  /**
   * 已取消（扣款申请被取消）
   */
  CANCELLED = 'cancelled',
}

/**
 * 押金扣款状态标签映射
 */
export const DepositDeductionStatusLabelMap: Record<DepositDeductionStatus, string> = {
  [DepositDeductionStatus.PENDING_USER_CONFIRM]: '待确认',
  [DepositDeductionStatus.PENDING_AUDIT]: '待审核',
  [DepositDeductionStatus.PLATFORM_APPROVED]: '平台已审核',
  [DepositDeductionStatus.PLATFORM_REJECTED]: '平台已拒绝',
  [DepositDeductionStatus.EXECUTED]: '已执行',
  [DepositDeductionStatus.CANCELLED]: '已取消',
};
