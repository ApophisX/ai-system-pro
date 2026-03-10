/**
 * 租赁评价状态枚举
 *
 * 状态流转：
 * PENDING（待审核） → APPROVED（已通过） → 公开展示
 *                 → REJECTED（已拒绝） → 不展示
 * APPROVED → HIDDEN（已隐藏，举报/违规后）
 */
export enum RentalReviewStatus {
  /**
   * 待平台审核
   */
  PENDING = 'pending',

  /**
   * 审核通过
   */
  APPROVED = 'approved',

  /**
   * 审核拒绝
   */
  REJECTED = 'rejected',

  /**
   * 已隐藏（举报/违规）
   */
  HIDDEN = 'hidden',
}

export const RentalReviewStatusLabel: Record<RentalReviewStatus, string> = {
  [RentalReviewStatus.PENDING]: '待审核',
  [RentalReviewStatus.APPROVED]: '已通过',
  [RentalReviewStatus.REJECTED]: '已拒绝',
  [RentalReviewStatus.HIDDEN]: '已隐藏',
};
