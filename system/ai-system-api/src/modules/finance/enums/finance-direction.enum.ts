/**
 * 账务方向枚举
 */
export enum FinanceDirection {
  /**
   * 收入
   */
  INCOME = 'income',

  /**
   * 支出
   */
  EXPENSE = 'expense',
}

export const FinanceDirectionLabelMap: Record<FinanceDirection, string> = {
  [FinanceDirection.INCOME]: '收入',
  [FinanceDirection.EXPENSE]: '支出',
};
