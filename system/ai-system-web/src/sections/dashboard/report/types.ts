/**
 * 后台举报列表项
 * 基于 API 返回的 OutputReportDto
 */
export type AdminReportListItem = MyApi.OutputReportDto;

/** 举报状态：0 待处理, 1 举报成立, 2 举报驳回, 3 自动关闭 */
export type ReportStatus = 0 | 1 | 2 | 3;

/** 举报处理动作 */
export type ReportHandleAction = 'approve' | 'reject' | 'mark_malicious';
