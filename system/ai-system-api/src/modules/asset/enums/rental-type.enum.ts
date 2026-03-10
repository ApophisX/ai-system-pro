/**
 * 租赁方式枚举
 *
 * 定义租赁计费的时间单位
 */
export enum RentalType {
  /**
   * 小时租
   */
  HOURLY = 'hourly',

  /**
   * 日租
   */
  DAILY = 'daily',

  /**
   * 周租
   */
  WEEKLY = 'weekly',

  /**
   * 月租
   */
  MONTHLY = 'monthly',

  /**
   * 季租（3个月）
   */
  QUARTERLY = 'quarterly',

  /**
   * 年租
   */
  YEARLY = 'yearly',

  /**
   * 购买
   */
  BUY = 'buy',
}

export const RentalTypeValues = Object.values(RentalType);
