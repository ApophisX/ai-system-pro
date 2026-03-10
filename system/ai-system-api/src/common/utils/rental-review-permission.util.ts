import dayjs from 'dayjs';
import { RENTAL_REVIEW_VALID_DAYS, REVIEW_STATUS_APPROVED } from '@/common/constants/rental-review.constant';

/**
 * 评价权限计算输入（review 侧，最小字段集）
 */
export interface RentalReviewPermissionInput {
  orderId: string;
  status: string;
  replyContent: string | null;
}

/**
 * 订单侧最小字段（用于权限计算）
 */
export interface RentalOrderForReviewPermission {
  status: string;
  payStatus: string;
  completedAt?: Date | null;
}

/**
 * 租赁订单评价权限结果
 */
export interface RentalOrderReviewPermission {
  canReview: boolean;
  canReplyToReview: boolean;
}

/**
 * 计算订单的评价/回复权限（纯逻辑，无模块依赖）
 *
 * - canReview：承租方在订单完成后、有效期内未评价时可评价
 * - canReplyToReview：出租方在评价已通过且未回复时可回复
 */
export function computeRentalOrderReviewPermissions(
  order: RentalOrderForReviewPermission,
  review: RentalReviewPermissionInput | null,
  role: 'lessee' | 'lessor',
): RentalOrderReviewPermission {
  const canReview =
    role === 'lessee' &&
    order.status === 'completed' &&
    order.payStatus === 'completed' &&
    !review &&
    !!order.completedAt &&
    dayjs().isBefore(dayjs(order.completedAt).add(RENTAL_REVIEW_VALID_DAYS, 'day'));

  const canReplyToReview =
    role === 'lessor' && !!review && review.status === REVIEW_STATUS_APPROVED && !review.replyContent;

  return { canReview, canReplyToReview };
}
