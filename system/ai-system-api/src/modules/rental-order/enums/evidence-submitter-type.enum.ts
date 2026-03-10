/**
 * 凭证提交者类型枚举
 *
 * 定义谁提交了凭证
 */
export enum EvidenceSubmitterType {
  /**
   * 出租方
   */
  LESSOR = 'lessor',

  /**
   * 承租方
   */
  LESSEE = 'lessee',
}

export const EvidenceSubmitterTypeLabel: Record<EvidenceSubmitterType, string> = {
  [EvidenceSubmitterType.LESSOR]: '出租方',
  [EvidenceSubmitterType.LESSEE]: '承租方',
};
