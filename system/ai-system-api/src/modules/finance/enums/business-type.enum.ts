/**
 * 业务大类枚举
 *
 * 用于统计 / 报表 / 快速筛选
 */
export enum BusinessType {
  /**
   * 订单相关（订单租金收入、租金退款）
   */
  ORDER = 'ORDER',

  /**
   * 押金相关（押金扣款收入、押金退还）
   */
  DEPOSIT = 'DEPOSIT',

  /**
   * 罚金相关（逾期费用收入、违约费用收入）
   */
  PENALTY = 'PENALTY',

  /**
   * 赔偿相关（赔偿收入）
   */
  COMPENSATION = 'COMPENSATION',

  /**
   * 提现相关（提现支出）
   */
  WITHDRAW = 'WITHDRAW',
}

export const BusinessTypeLabelMap: Record<BusinessType, string> = {
  [BusinessType.ORDER]: '订单相关',
  [BusinessType.DEPOSIT]: '押金相关',
  [BusinessType.PENALTY]: '罚金相关',
  [BusinessType.COMPENSATION]: '赔偿相关',
  [BusinessType.WITHDRAW]: '提现相关',
};

/**
 * 根据收入/支出类型推导业务大类
 */
export function getBusinessTypeByIncomeType(incomeType: string): BusinessType | undefined {
  const mapping: Record<string, BusinessType> = {
    order_rent: BusinessType.ORDER,
    deposit_deduct: BusinessType.DEPOSIT,
    late_fee: BusinessType.PENALTY,
    breach_fee: BusinessType.PENALTY,
    compensation: BusinessType.COMPENSATION,
  };
  return mapping[incomeType] || undefined;
}

/**
 * 根据支出类型推导业务大类
 */
export function getBusinessTypeByExpenseType(expenseType: string): BusinessType | undefined {
  const mapping: Record<string, BusinessType> = {
    rent_refund: BusinessType.ORDER,
    deposit_refund: BusinessType.DEPOSIT,
    withdraw: BusinessType.WITHDRAW,
  };
  return mapping[expenseType] || undefined;
}
