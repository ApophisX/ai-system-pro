/**
 * 押金状态枚举
 */
export enum DepositStatus {
  /**
   * 待支付/待冻结
   */
  PENDING = 'pending',

  /**
   * 支付中
   */
  PAYING = 'paying',

  /**
   * 已冻结
   */
  FROZEN = 'frozen',

  /**
   * 已支付
   */
  PAID = 'paid',

  /**
   * 部分扣除
   */
  PARTIAL_DEDUCTED = 'partial_deducted',

  /**
   * 已全部扣除
   */
  FULLY_DEDUCTED = 'fully_deducted',

  /**
   * 已解冻
   */
  UNFROZEN = 'unfrozen',

  /**
   * （已退还）
   */
  RETURNED = 'returned',

  /**
   * 已取消
   */
  CANCELED = 'canceled',

  /**
   * 无押金
   */
  NONE = 'none',

  /**
   * 冻结失败或支付失败
   */
  FAILED = 'failed',

  /**
   * 退款/解冻中
   */
  REFUNDING = 'refunding',
}

/**
 * 押金状态标签映射
 */
export const DepositStatusLabelMap: Record<DepositStatus, string> = {
  [DepositStatus.PENDING]: '待支付',
  [DepositStatus.FROZEN]: '已冻结',
  [DepositStatus.PAID]: '已支付',
  [DepositStatus.PARTIAL_DEDUCTED]: '部分扣除',
  [DepositStatus.FULLY_DEDUCTED]: '已全部扣除',
  [DepositStatus.UNFROZEN]: '已解冻',
  [DepositStatus.RETURNED]: '已退还',
  [DepositStatus.CANCELED]: '已取消',
  [DepositStatus.NONE]: '无押金',
  [DepositStatus.FAILED]: '冻结失败或支付失败',
  [DepositStatus.REFUNDING]: '处理中',
  [DepositStatus.PAYING]: '支付中',
};
