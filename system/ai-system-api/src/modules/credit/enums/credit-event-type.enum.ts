/**
 * 信用事件类型枚举
 *
 * 将业务行为转换为标准信用事件，用于评分引擎计算
 */
export enum CreditEventType {
  /** 订单正常完成（正面） */
  ORDER_COMPLETED = 'order_completed',

  /** 争议胜诉（仲裁结果利于己方，正面） */
  DISPUTE_WON = 'dispute_won',

  /** 逾期（含分期逾期、租赁逾期，负面） */
  ORDER_OVERDUE = 'order_overdue',

  /** 恶意违约（未付清、恶意取消等，负面） */
  ORDER_DEFAULT = 'order_default',

  /** 进入争议（负面） */
  DISPUTE_OPENED = 'dispute_opened',

  /** 争议败诉（平台仲裁裁定不利，负面） */
  DISPUTE_LOST = 'dispute_lost',

  /** 押金被扣除（负面） */
  DEPOSIT_DEDUCTED = 'deposit_deducted',

  /** 欺诈确认（人工标记，负面） */
  FRAUD_CONFIRMED = 'fraud_confirmed',

  /** 人工奖励（需权限+审计） */
  MANUAL_REWARD = 'manual_reward',

  /** 人工处罚（需权限+审计） */
  MANUAL_PENALTY = 'manual_penalty',
}

/**
 * 信用事件类型标签映射
 */
export const CreditEventTypeLabelMap: Record<CreditEventType, string> = {
  [CreditEventType.ORDER_COMPLETED]: '订单完成',
  [CreditEventType.DISPUTE_WON]: '争议胜诉',
  [CreditEventType.ORDER_OVERDUE]: '订单逾期',
  [CreditEventType.ORDER_DEFAULT]: '恶意违约',
  [CreditEventType.DISPUTE_OPENED]: '进入争议',
  [CreditEventType.DISPUTE_LOST]: '争议败诉',
  [CreditEventType.DEPOSIT_DEDUCTED]: '押金扣除',
  [CreditEventType.FRAUD_CONFIRMED]: '欺诈确认',
  [CreditEventType.MANUAL_REWARD]: '人工奖励',
  [CreditEventType.MANUAL_PENALTY]: '人工处罚',
};
