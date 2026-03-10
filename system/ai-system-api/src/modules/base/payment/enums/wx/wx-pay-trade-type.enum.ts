/**
 * 微信支付交易类型枚举
 *
 * 参考文档：https://pay.weixin.qq.com/wiki/doc/apiv3/terms_definition/chapter1_1_3.shtml
 */
export enum WxPayTradeType {
  /**
   * JSAPI支付（公众号支付）
   */
  JSAPI = 'JSAPI',

  /**
   * Native支付（扫码支付）
   */
  NATIVE = 'NATIVE',

  /**
   * APP支付
   */
  APP = 'APP',

  /**
   * 付款码支付
   */
  MICROPAY = 'MICROPAY',

  /**
   * H5支付
   */
  MWEB = 'MWEB',

  /**
   * 刷脸支付
   */
  FACEPAY = 'FACEPAY',
}
