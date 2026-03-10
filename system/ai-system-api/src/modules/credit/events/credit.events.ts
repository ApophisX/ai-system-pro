/**
 * 信用领域事件常量
 *
 * 业务模块发射事件，CreditEventSubscriber 订阅并写入 credit_event
 */
export const CreditEvents = {
  /** 订单完成 */
  ORDER_COMPLETED: 'credit.order.completed',
  /** 订单逾期 */
  ORDER_OVERDUE: 'credit.order.overdue',
  /** 押金扣除执行 */
  DEPOSIT_DEDUCTED: 'credit.deposit.deducted',
  /** 进入争议 */
  DISPUTE_OPENED: 'credit.dispute.opened',
  /** 争议裁决（胜/败） */
  DISPUTE_RESOLVED: 'credit.dispute.resolved',
  /** 欺诈确认 */
  FRAUD_CONFIRMED: 'credit.fraud.confirmed',
  /** 人工奖励/处罚 */
  MANUAL_ADJUSTMENT: 'credit.manual.adjustment',
} as const;

export type CreditEventName = (typeof CreditEvents)[keyof typeof CreditEvents];
