/**
 * 后台评论列表项
 * 基于 API 返回的 OutputRentalReviewAdminDto，扩展展示所需字段（后端可能返回但 typings 未声明）
 */
export type AdminRentalReviewListItem = MyApi.OutputRentalReviewAdminDto & {
  /** 状态枚举（后端可能返回，用于操作按钮逻辑） */
  status?: 'pending' | 'approved' | 'rejected' | 'hidden';
  /** 评分 1-5 */
  score?: number;
  /** 评论内容 */
  content?: string;
  /** 图片 URL 数组 */
  images?: string[];
  /** 商家回复内容 */
  replyContent?: string;
  /** 商家回复时间 */
  replyAt?: string;
  /** 拒绝原因（rejected 时） */
  rejectReason?: string;
  /** 关联资产信息 */
  asset?: { id: string; name: string; coverImage?: string };
};
