/**
 * 信用事件影响分常量
 *
 * 负面行为权重体系（来自架构文档）
 */
export const CREDIT_IMPACT = {
  /** 轻微逾期：逾期 ≤7 天 */
  SLIGHT_OVERDUE: -10,
  /** 严重逾期：逾期 >7 天或分期连续 2 期+ */
  SEVERE_OVERDUE: -30,
  /** 押金扣除 */
  DEPOSIT_DEDUCTED: -50,
  /** 欺诈（需人工确认） */
  FRAUD: -200,
  /** 恶意毁约 */
  MALICIOUS_DEFAULT: -150,
  /** 争议进入 */
  DISPUTE_OPENED: -10,
  /** 争议败诉 */
  DISPUTE_LOST: -30,
  /** 争议胜诉（正面） */
  DISPUTE_WON: 10,
  /** 订单完成（正面） */
  ORDER_COMPLETED: 5,
} as const;
