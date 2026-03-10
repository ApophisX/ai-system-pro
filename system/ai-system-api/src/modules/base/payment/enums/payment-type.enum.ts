/**
 * 支付类型枚举
 */
export enum PaymentType {
  /**
   * 订单支付（租金+押金+服务费）
   */
  ORDER = 'order',

  /**
   * 分期支付（租金分期）
   */
  INSTALLMENT = 'installment',

  /**
   * 押金支付
   */
  DEPOSIT = 'deposit',

  /**
   * 租金支付
   */
  RENTAL = 'rental',

  /**
   * 服务费支付
   */
  SERVICE_FEE = 'service_fee',

  /**
   * 违约金支付
   */
  PENALTY = 'penalty',

  /**
   * 逾期费用支付
   */
  OVERDUE_FEE = 'overdue_fee',

  /**
   * 续租租金支付
   */
  RENEWAL = 'renewal',
}

export const PaymentTypeLabels = {
  [PaymentType.RENTAL]: '租金',
  [PaymentType.DEPOSIT]: '押金',
  [PaymentType.SERVICE_FEE]: '服务费',
  [PaymentType.PENALTY]: '违约金',
  [PaymentType.OVERDUE_FEE]: '逾期费用',
  [PaymentType.RENEWAL]: '续租租金',
};

export type PaymentTypeKey = keyof typeof PaymentTypeLabels;
