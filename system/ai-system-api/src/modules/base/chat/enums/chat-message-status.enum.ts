/**
 * 聊天消息状态枚举
 */
export enum ChatMessageStatus {
  /**
   * 发送中
   */
  SENDING = 'sending',

  /**
   * 已发送
   */
  SENT = 'sent',

  /**
   * 已送达
   */
  DELIVERED = 'delivered',

  /**
   * 已读
   */
  READ = 'read',

  /**
   * 发送失败
   */
  FAILED = 'failed',

  /**
   * 已撤回
   */
  RECALLED = 'recalled',
}
