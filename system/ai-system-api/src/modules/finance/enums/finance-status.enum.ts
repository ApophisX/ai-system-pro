/**
 * 账务状态枚举（账务视角）
 */
export enum FinanceStatus {
  /**
   * 待入账（业务已发生，尚未确认记账）
   */
  PENDING = 'pending',

  /**
   * 已入账（账务确认，不可逆）
   */
  CONFIRMED = 'confirmed',

  /**
   * 已冲正（发生退款或撤销后的账务调整）
   */
  REVERSED = 'reversed',

  /**
   * 已取消（订单取消后的账务调整）
   */
  CANCELLED = 'cancelled',
}

export const FinanceStatusLabelMap: Record<FinanceStatus, string> = {
  [FinanceStatus.PENDING]: '待入账',
  [FinanceStatus.CONFIRMED]: '已入账',
  [FinanceStatus.REVERSED]: '已冲正',
  [FinanceStatus.CANCELLED]: '已取消',
};
