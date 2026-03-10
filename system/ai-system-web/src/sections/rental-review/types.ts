/**
 * 租赁评价相关类型定义
 * API 返回的评价列表项可能包含更多字段，此处扩展用于前端展示
 */
export type RentalReviewListItem = MyApi.OutputRentalReviewDto & {
  score?: number;
  content?: string;
  images?: string[];
  replyContent?: string;
  replyAt?: string;
  asset?: { id: string; name: string; coverImage?: string };
};

export type ReviewScoreRange = 'all' | 'good' | 'medium' | 'bad' | 'withImage';

export const REVIEW_SCORE_RANGE_OPTIONS: { value: ReviewScoreRange; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'good', label: '好评' },
  { value: 'medium', label: '中评' },
  { value: 'bad', label: '差评' },
  { value: 'withImage', label: '有图' },
];
