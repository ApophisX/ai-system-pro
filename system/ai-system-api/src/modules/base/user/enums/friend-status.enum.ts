/**
 * 好友状态枚举
 */
export enum FriendStatus {
  /**
   * 待确认（已发送好友请求，等待对方确认）
   */
  PENDING = 'pending',

  /**
   * 已接受（双方已确认，成为好友）
   */
  ACCEPTED = 'accepted',

  /**
   * 已屏蔽（一方屏蔽了另一方）
   */
  BLOCKED = 'blocked',
}
