import { PaymentType } from '@/modules/base/payment/enums';

/**
 * 收入类型枚举
 */
export enum FinanceIncomeType {
  /**
   * 订单租金收入
   */
  ORDER_RENT = 'order_rent',

  /**
   * 押金扣款收入
   */
  DEPOSIT_DEDUCT = 'deposit_deduct',

  /**
   * 逾期费用收入
   */
  LATE_FEE = 'late_fee',

  /**
   * 违约费用收入
   */
  BREACH_FEE = 'breach_fee',

  /**
   * 赔偿收入（如资产损坏赔偿）
   */
  COMPENSATION = 'compensation',

  /**
   * 分期收入
   */
  INSTALLMENT = 'installment',

  /**
   * 续租租金收入
   */
  RENEWAL_RENT = 'renewal_rent',
}

export const FinanceIncomeTypeLabelMap: Record<FinanceIncomeType, string> = {
  [FinanceIncomeType.ORDER_RENT]: '订单租金收入',
  [FinanceIncomeType.DEPOSIT_DEDUCT]: '押金扣款收入',
  [FinanceIncomeType.LATE_FEE]: '逾期费用收入',
  [FinanceIncomeType.BREACH_FEE]: '违约费用收入',
  [FinanceIncomeType.COMPENSATION]: '赔偿收入',
  [FinanceIncomeType.INSTALLMENT]: '分期收入',
  [FinanceIncomeType.RENEWAL_RENT]: '续租租金收入',
};

/**
 * 支付类型到财务收入类型的映射
 * 用于使用中订单的支付（分期、逾期费、违约金等）直接入账时确定收入类型
 */
export function paymentTypeToFinanceIncomeType(paymentType: PaymentType | undefined): FinanceIncomeType {
  if (!paymentType) return FinanceIncomeType.ORDER_RENT;
  const mapping: Partial<Record<PaymentType, FinanceIncomeType>> = {
    order: FinanceIncomeType.ORDER_RENT,
    rental: FinanceIncomeType.ORDER_RENT,
    installment: FinanceIncomeType.INSTALLMENT,
    renewal: FinanceIncomeType.RENEWAL_RENT,
    overdue_fee: FinanceIncomeType.LATE_FEE,
    deposit: FinanceIncomeType.DEPOSIT_DEDUCT,
    penalty: FinanceIncomeType.BREACH_FEE,
  };
  return mapping[paymentType] ?? FinanceIncomeType.ORDER_RENT;
}
