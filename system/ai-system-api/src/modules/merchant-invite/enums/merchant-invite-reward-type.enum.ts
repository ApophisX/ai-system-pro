/**
 * 商户邀请奖励类型
 *
 * 当前阶段仅 REBATE 发放，其他类型为预留
 */
export enum MerchantInviteRewardType {
  /** 注册奖励（预留，当前阶段不发） */
  REGISTER = 'register',
  /** 认证奖励（预留，当前阶段不发） */
  VERIFY = 'verify',
  /** 上架奖励（预留，当前阶段不发） */
  LIST = 'list',
  /** 首单奖励（预留，当前阶段不发） */
  FIRST_ORDER = 'first_order',
  /** 真实交易分润（当前阶段唯一发放类型） */
  REBATE = 'rebate',
}
