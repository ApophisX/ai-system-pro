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
}
