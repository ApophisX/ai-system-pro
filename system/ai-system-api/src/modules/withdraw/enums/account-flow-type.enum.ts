/**
 * 账务流水类型枚举
 *
 * 遵循 doc/merchant_account.md 流水类型设计
 */
export enum AccountFlowType {
  /** 订单支付冻结 */
  ORDER_FREEZE = 'order_freeze',

  /** 订单结算解冻 */
  ORDER_SETTLE = 'order_settle',

  /** 订单取消解冻 */
  ORDER_CANCEL = 'order_cancel',

  /** 押金扣款入账 */
  DEPOSIT_DEDUCT = 'deposit_deduct',

  /** 提现审核扣款 */
  WITHDRAW_APPLY = 'withdraw_apply',

  /** 提现打款成功 */
  WITHDRAW_SUCCESS = 'withdraw_success',

  /** 提现失败退款 */
  WITHDRAW_FAIL = 'withdraw_fail',

  /** 争议结算 */
  DISPUTE_SETTLE = 'dispute_settle',
}
