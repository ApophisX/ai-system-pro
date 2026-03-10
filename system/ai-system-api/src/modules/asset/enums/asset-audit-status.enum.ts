/**
 * 资产审核状态枚举
 *
 * 定义资产审核流程的状态
 */
export enum AssetAuditStatus {
  /**
   * 待审核
   */
  PENDING = 'pending',

  /**
   * 审核中
   */
  AUDITING = 'auditing',

  /**
   * 审核通过
   */
  APPROVED = 'approved',

  /**
   * 审核拒绝
   */
  REJECTED = 'rejected',
}

export const AssetAuditStatusValues = Object.values(AssetAuditStatus);
