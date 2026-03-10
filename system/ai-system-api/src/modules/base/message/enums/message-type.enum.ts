/**
 * 消息类型枚举
 *
 * 定义系统中所有消息的类型
 */
export enum MessageType {
  /**
   * 系统消息
   * 系统通知、公告等
   */
  SYSTEM = 'SYSTEM',

  /**
   * 用户消息
   * 用户之间的互动消息，如关注、私信等
   */
  USER = 'USER',

  /**
   * 订单消息
   * 订单相关的通知，如订单创建、支付、完成、取消等
   */
  ORDER = 'ORDER',

  /**
   * 实名认证消息
   * 实名认证审核结果通知
   */
  VERIFICATION = 'VERIFICATION',

  /**
   * 支付消息
   * 支付相关的通知，如支付成功、退款等
   */
  PAYMENT = 'PAYMENT',

  /**
   * 资产消息
   * 资产相关的通知，如资产审核、上架、下架等
   */
  ASSET = 'ASSET',

  /**
   * 评价消息
   * 评价相关的通知，如收到评价、评价回复等
   */
  REVIEW = 'REVIEW',
}
