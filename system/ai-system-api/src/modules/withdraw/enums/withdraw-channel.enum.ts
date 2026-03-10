/**
 * 提现渠道枚举
 *
 * 微信/支付宝：转至商户绑定的收款账户
 * 银行：预留，后期接入
 */
export enum WithdrawChannel {
  /** 微信（商家转账到零钱） */
  WECHAT = 'wechat',

  /** 支付宝 */
  ALIPAY = 'alipay',

  /** 银行卡（预留，暂未支持） */
  BANK = 'bank',
}

export const WithdrawChannelLabelMap: Record<WithdrawChannel, string> = {
  [WithdrawChannel.WECHAT]: '微信',
  [WithdrawChannel.ALIPAY]: '支付宝',
  [WithdrawChannel.BANK]: '银行卡',
};
