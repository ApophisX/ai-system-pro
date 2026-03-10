/**
 * 聊天消息类型枚举
 */
export enum ChatMessageType {
  /**
   * 文本消息
   */
  TEXT = 'text',

  /**
   * 图片消息
   */
  IMAGE = 'image',

  /**
   * 视频消息
   */
  VIDEO = 'video',

  /**
   * 语音消息
   */
  AUDIO = 'audio',

  /**
   * 文件消息
   */
  FILE = 'file',

  /**
   * 系统消息（如：对方正在输入、消息撤回等）
   */
  SYSTEM = 'system',
}
