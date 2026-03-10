/**
 * 商户邀请奖励状态
 */
export enum MerchantInviteRewardStatus {
  /** 待发放（7 天观察期内） */
  PENDING = 'pending',
  /** 已发放 */
  RELEASED = 'released',
  /** 已回收（7 天内发生租金退款） */
  REVOKED = 'revoked',
}
