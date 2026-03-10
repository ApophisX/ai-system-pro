/**
 * 消息状态枚举
 *
 * 定义消息的阅读状态
 */
export enum MessageStatus {
  /**
   * 未读
   */
  UNREAD = 'UNREAD',

  /**
   * 已读
   */
  READ = 'READ',

  /**
   * 已删除
   */
  DELETED = 'DELETED',
}
