/**
 * 实名认证状态枚举
 */
export enum VerificationStatus {
  /**
   * 未认证
   */
  UNVERIFIED = 'unverified',

  /**
   * 已认证
   */
  VERIFIED = 'verified',

  /**
   * 已拒绝
   */
  REJECTED = 'rejected',
}
