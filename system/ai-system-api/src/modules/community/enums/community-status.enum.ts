/**
 * 社区状态枚举
 */
export enum CommunityStatus {
  /** 待审核：用户创建后等待管理员审核 */
  PENDING = 'pending',
  /** 已通过：审核通过，可展示、可加入、可绑定资产 */
  APPROVED = 'approved',
  /** 已拒绝：审核拒绝，不可展示、不可加入 */
  REJECTED = 'rejected',
  /** 已关闭：管理员或创建者主动关闭，不可再加入 */
  CLOSED = 'closed',
}

export const CommunityStatusMap = {
  [CommunityStatus.PENDING]: '待审核',
  [CommunityStatus.APPROVED]: '已通过',
  [CommunityStatus.REJECTED]: '已拒绝',
  [CommunityStatus.CLOSED]: '已关闭',
};
