/**
 * 举报原因枚举值
 */
export const REPORT_REASONS = [
  { value: 'fraud', label: '虚假信息/欺诈' },
  { value: 'illegal', label: '违法违规内容' },
  { value: 'spam', label: '垃圾信息/广告' },
  { value: 'inappropriate', label: '不当内容' },
  { value: 'duplicate', label: '重复发布' },
  { value: 'price_mismatch', label: '价格/联系方式与描述不符' },
  { value: 'copyright', label: '侵犯版权/盗用图片' },
  { value: 'privacy', label: '侵犯隐私/盗用他人信息' },
  { value: 'prohibited', label: '违禁物品出租' },
  { value: 'safety', label: '安全隐患/危险物品' },
  { value: 'harassment', label: '骚扰/威胁' },
  { value: 'other', label: '其他' },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]['value'];

export const REPORT_REASON_VALUES = REPORT_REASONS.map(r => r.value);

/**
 * 举报状态
 */
export enum ReportStatus {
  /** 待处理 */
  PENDING = 0,
  /** 举报成立 */
  APPROVED = 1,
  /** 举报驳回 */
  REJECTED = 2,
  /** 自动关闭 */
  AUTO_CLOSED = 3,
}

/**
 * 处理结果（action）
 */
export enum ReportHandleResult {
  /** 举报成立 */
  APPROVE = 'approve',
  /** 举报驳回 */
  REJECT = 'reject',
  /** 标记恶意举报 */
  MARK_MALICIOUS = 'mark_malicious',
}
