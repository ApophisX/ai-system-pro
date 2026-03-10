/**
 * 租赁评价相关常量（跨模块共用）
 *
 * 用于订单模块计算 canReview/canReplyToReview，及评价模块校验有效期
 */

/** 评价有效期（天），从订单 completedAt 起算 */
export const RENTAL_REVIEW_VALID_DAYS = 30;

/** 评价状态：已通过（用于权限计算，避免耦合 reviews 模块的 enum） */
export const REVIEW_STATUS_APPROVED = 'approved';
