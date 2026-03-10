/**
 * 续租规则（来自 rentalPlanSnapshot.renewalPolicy）
 */
export interface RenewalPolicy {
  /**
   * 是否允许续租
   */
  allowRenewal?: boolean;
  /**
   * 最大续租次数
   */
  maxRenewalTimes?: number;
  /**
   * 续租折扣
   */
  renewalDiscount?: number;
  /**
   * 最小续租时长
   */
  minDuration?: number;
  /**
   * 最大续租时长
   */
  maxDuration?: number;
  /**
   * 申请续租提前时间
   */
  applyBeforeEndMinutes?: number;
}
