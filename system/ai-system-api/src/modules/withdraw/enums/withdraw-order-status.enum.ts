/**
 * 提现订单状态枚举
 *
 * 遵循 doc/merchant_account.md 设计
 */
export enum WithdrawOrderStatus {
  /** 待审核 */
  PENDING = 'pending',

  /** 审核中 */
  REVIEWING = 'reviewing',

  /** 审核通过，待打款 */
  APPROVED = 'approved',

  /** 审核拒绝 */
  REJECTED = 'rejected',

  /** 商户主动取消（PENDING/REVIEWING 时可取消） */
  CANCELED = 'canceled',

  /** 打款中 */
  PROCESSING = 'processing',

  /** 打款成功（已到账） */
  COMPLETED = 'completed',

  /** 打款失败，已退回到 available */
  FAILED = 'failed',
}

export const WithdrawOrderStatusLabelMap: Record<WithdrawOrderStatus, string> = {
  [WithdrawOrderStatus.PENDING]: '待审核',
  [WithdrawOrderStatus.REVIEWING]: '审核中',
  [WithdrawOrderStatus.APPROVED]: '审核通过待打款',
  [WithdrawOrderStatus.REJECTED]: '审核拒绝',
  [WithdrawOrderStatus.CANCELED]: '已取消',
  [WithdrawOrderStatus.PROCESSING]: '打款中',
  [WithdrawOrderStatus.COMPLETED]: '打款成功',
  [WithdrawOrderStatus.FAILED]: '打款失败',
};

/** 商户可取消的状态 */
export const WITHDRAW_CANCELABLE_STATUSES: WithdrawOrderStatus[] = [
  WithdrawOrderStatus.PENDING,
  WithdrawOrderStatus.REVIEWING,
];

/** 审核相关状态 */
export const WITHDRAW_REVIEW_STATUSES: WithdrawOrderStatus[] = [
  WithdrawOrderStatus.PENDING,
  WithdrawOrderStatus.REVIEWING,
];
