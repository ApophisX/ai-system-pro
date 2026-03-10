/**
 * 商户邀请领域事件
 *
 * 用于模块间解耦，避免循环依赖
 */
export const MerchantInviteEvents = {
  /** 用户使用邀请码注册成功 */
  USER_REGISTERED_WITH_INVITE: 'merchant_invite.user.registered_with_invite',
  /** 用户认证通过（实名/企业） */
  USER_VERIFIED: 'merchant_invite.user.verified',
} as const;
