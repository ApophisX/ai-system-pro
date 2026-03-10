/**
 * 支出类型枚举
 */
export enum FinanceExpenseType {
  /**
   * 租金退款
   */
  RENT_REFUND = 'rent_refund',

  /**
   * 提现支出
   */
  WITHDRAW = 'withdraw',
}

export const FinanceExpenseTypeLabelMap: Record<FinanceExpenseType, string> = {
  [FinanceExpenseType.RENT_REFUND]: '租金退款',
  [FinanceExpenseType.WITHDRAW]: '提现支出',
};
