/**
 * 资金流状态枚举（前端展示用）
 */
export enum FinanceFlowStatus {
  /**
   * 入账中（收入）
   */
  CREDITING = 'crediting',

  /**
   * 已入账（收入）
   */
  CREDITED = 'credited',

  /**
   * 退款中（支出）
   */
  REFUNDING = 'refunding',

  /**
   * 已退款（支出）
   */
  REFUNDED = 'refunded',

  /**
   * 提现中（支出）
   */
  WITHDRAWING = 'withdrawing',

  /**
   * 已提现（支出）
   */
  WITHDRAWN = 'withdrawn',
}

export const FinanceFlowStatusLabelMap: Record<FinanceFlowStatus, string> = {
  [FinanceFlowStatus.CREDITING]: '入账中',
  [FinanceFlowStatus.CREDITED]: '已入账',
  [FinanceFlowStatus.REFUNDING]: '退款中',
  [FinanceFlowStatus.REFUNDED]: '已退款',
  [FinanceFlowStatus.WITHDRAWING]: '提现中',
  [FinanceFlowStatus.WITHDRAWN]: '已提现',
};
