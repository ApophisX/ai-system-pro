/**
 * 企业认证状态枚举
 *
 * 与个人实名认证（verificationStatus）区分，企业认证需后台人工审核
 * 字段为 null 表示未提交/不适用（个人用户）
 */
export enum EnterpriseVerificationStatus {
  /**
   * 待审核：已提交企业资料，等待后台审核
   */
  PENDING = 'pending',

  /**
   * 已通过：后台审核通过，可进行商户相关操作
   */
  VERIFIED = 'verified',

  /**
   * 已拒绝：后台审核拒绝，可修改后重新提交
   */
  REJECTED = 'rejected',
}
