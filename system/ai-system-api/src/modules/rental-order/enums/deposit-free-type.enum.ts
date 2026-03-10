/**
 * 免押类型枚举
 */
export enum DepositFreeType {
  /**
   * 无免押
   */
  NONE = 'none',

  /**
   * 支付宝免押
   */
  ALIPAY = 'alipay',

  /**
   * 微信免押
   */
  WECHAT = 'wechat',
}

/**
 * 免押类型标签映射
 */
export const DepositFreeTypeLabelMap: Record<DepositFreeType, string> = {
  [DepositFreeType.NONE]: '无免押',
  [DepositFreeType.ALIPAY]: '支付宝免押',
  [DepositFreeType.WECHAT]: '微信免押',
};
