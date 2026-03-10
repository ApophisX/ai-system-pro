/**
 * 聊天会话状态枚举
 */
export enum ChatConversationStatus {
  /**
   * 正常
   */
  ACTIVE = 'active',

  /**
   * 已删除（软删除）
   */
  DELETED = 'deleted',

  /**
   * 已屏蔽
   */
  BLOCKED = 'blocked',
}
