/**
 * 币种枚举
 *
 * 支持多币种 / 加密货币 / 跨境结算
 */
export enum Currency {
  /**
   * 人民币
   */
  CNY = 'CNY',

  /**
   * 美元
   */
  USD = 'USD',

  /**
   * 欧元
   */
  EUR = 'EUR',

  /**
   * 日元
   */
  JPY = 'JPY',

  /**
   * 港币
   */
  HKD = 'HKD',

  /**
   * 英镑
   */
  GBP = 'GBP',

  /**
   * 比特币
   */
  BTC = 'BTC',

  /**
   * 以太坊
   */
  ETH = 'ETH',
}

export const CurrencyLabelMap: Record<Currency, string> = {
  [Currency.CNY]: '人民币',
  [Currency.USD]: '美元',
  [Currency.EUR]: '欧元',
  [Currency.JPY]: '日元',
  [Currency.HKD]: '港币',
  [Currency.GBP]: '英镑',
  [Currency.BTC]: '比特币',
  [Currency.ETH]: '以太坊',
};
