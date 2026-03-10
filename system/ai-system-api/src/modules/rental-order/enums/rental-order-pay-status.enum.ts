/**
 * 租赁订单支付状态枚举
 *
 * 定义订单支付流程状态
 */
export enum RentalOrderPayStatus {
  /**
   * 无支付状态
   */
  NONE = 'none',

  /**
   * 待支付
   */
  PENDING = 'pending',

  /**
   * 处理中
   */
  PROCESSING = 'processing',

  /**
   * 支付成功
   */
  COMPLETED = 'completed',

  /**
   * 支付失败
   */
  FAILED = 'failed',

  /**
   * 支付超时
   */
  TIMEOUT = 'timeout',

  /**
   * 支付取消
   */
  CANCELED = 'canceled',
}

export const RentalOrderPaymentStatusLabel: Record<RentalOrderPayStatus, string> = {
  [RentalOrderPayStatus.NONE]: '未支付',
  [RentalOrderPayStatus.PENDING]: '待支付',
  [RentalOrderPayStatus.PROCESSING]: '处理中',
  [RentalOrderPayStatus.COMPLETED]: '支付成功',
  [RentalOrderPayStatus.FAILED]: '支付失败',
  [RentalOrderPayStatus.TIMEOUT]: '支付超时',
  [RentalOrderPayStatus.CANCELED]: '支付取消',
};
