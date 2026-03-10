/**
 * 送货方式枚举
 *
 * 定义资产的配送方式
 */
export enum DeliveryMethod {
  /**
   * 同城配送
   */
  SAME_CITY_DELIVERY = 'same-city-delivery',

  /**
   * 上门自提
   */
  SELF_PICKUP = 'self-pickup',

  /**
   * 快递配送
   */
  EXPRESS_DELIVERY = 'express-delivery',

  /**
   * 邮寄配送
   */
  MAIL_DELIVERY = 'mail-delivery',

  /**
   * 到付
   */
  CASH_ON_DELIVERY = 'cash-on-delivery',

  /**
   * 其他
   */
  OTHER = 'other',
}

export const DeliveryMethodValues = Object.values(DeliveryMethod);
