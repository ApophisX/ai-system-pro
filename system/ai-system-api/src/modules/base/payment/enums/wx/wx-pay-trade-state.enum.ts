/**
 * 微信支付交易状态枚举
 *
 * 参考文档：https://pay.weixin.qq.com/wiki/doc/apiv3/terms_definition/chapter1_1_3.shtml
 */
export enum WxPayTradeState {
  /**
   * 支付成功
   */
  SUCCESS = 'SUCCESS',

  /**
   * 转入退款
   */
  REFUND = 'REFUND',

  /**
   * 未支付
   */
  NOTPAY = 'NOTPAY',

  /**
   * 已关闭
   */
  CLOSED = 'CLOSED',

  /**
   * 已撤销（付款码支付）
   */
  REVOKED = 'REVOKED',

  /**
   * 用户支付中（付款码支付）
   */
  USERPAYING = 'USERPAYING',

  /**
   * 支付失败(其他原因，如银行返回失败)
   */
  PAYERROR = 'PAYERROR',
}
