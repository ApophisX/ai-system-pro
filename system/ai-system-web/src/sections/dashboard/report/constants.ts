/** 举报原因选项（与用户端 CreateReportDto.reason 一致） */
export const REPORT_REASON_OPTIONS = [
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

/** 举报状态选项 */
export const REPORT_STATUS_OPTIONS = [
  { value: 'all' as const, label: '全部状态' },
  { value: 0 as const, label: '待处理' },
  { value: 1 as const, label: '举报成立' },
  { value: 2 as const, label: '举报驳回' },
  { value: 3 as const, label: '自动关闭' },
];
