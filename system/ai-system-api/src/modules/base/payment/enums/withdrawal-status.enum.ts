/**
 * 提现状态枚举
 */
export enum WithdrawalStatus {
  /**
   * 无提现
   */
  NONE = 'none',

  /**
   * 提现中
   */
  PROCESSING = 'processing',

  /**
   * 提现成功
   */
  COMPLETED = 'completed',

  /**
   * 提现失败
   */
  FAILED = 'failed',

  /**
   * 提现取消
   */
  CANCELED = 'canceled',

  /**
   * 部分提现
   */
  PARTIAL_WITHDRAWAL = 'partial_withdrawal',
}

export const WithdrawalStatusLabelMap: Record<WithdrawalStatus, string> = {
  [WithdrawalStatus.NONE]: '无提现',
  [WithdrawalStatus.PROCESSING]: '提现中',
  [WithdrawalStatus.COMPLETED]: '提现成功',
  [WithdrawalStatus.FAILED]: '提现失败',
  [WithdrawalStatus.CANCELED]: '提现取消',
  [WithdrawalStatus.PARTIAL_WITHDRAWAL]: '部分提现',
};
