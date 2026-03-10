/**
 * 凭证审核状态枚举
 *
 * 定义凭证的审核状态
 */
export enum EvidenceAuditStatus {
  /**
   * 待审核
   */
  PENDING = 'pending',

  /**
   * 已通过
   */
  APPROVED = 'approved',

  /**
   * 已拒绝
   */
  REJECTED = 'rejected',
}

export const EvidenceAuditStatusLabel: Record<EvidenceAuditStatus, string> = {
  [EvidenceAuditStatus.PENDING]: '待审核',
  [EvidenceAuditStatus.APPROVED]: '已通过',
  [EvidenceAuditStatus.REJECTED]: '已拒绝',
};
