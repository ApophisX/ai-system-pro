/**
 * 商户邀请相关类型定义
 * 基于 MerchantGrowthEngineV1 业务文档
 */

/** 邀请关系状态 */
export type MerchantInviteRelationStatus =
  | 'REGISTERED' // 已注册
  | 'VERIFIED' // 已认证
  | 'LISTED' // 已上架(≥3资产)
  | 'FIRST_ORDER'; // 首单完成

/** 奖励类型 */
export type MerchantInviteRewardType = 'REGISTER' | 'VERIFY' | 'LIST' | 'FIRST_ORDER' | 'REBATE';

/** 奖励状态 */
export type MerchantInviteRewardStatus = 'PENDING' | 'RELEASED' | 'REVOKED';

/** 我的邀请码与统计（API 响应） */
export interface MerchantInviteCodeOutput {
  /** 邀请码 */
  code: string;
  /** 过期时间（可选） */
  expireAt?: string;
  /** 已邀请总数 */
  totalInvited?: number;
  /** 已认证数 */
  verifiedCount?: number;
  /** 已上架数（≥3资产） */
  listedCount?: number;
  /** 首单完成数 */
  firstOrderCount?: number;
  /** 累计奖励金额（分） */
  totalRewardAmount?: number;
}

/** 邀请列表项 */
export interface MerchantInvitationItem {
  id: string;
  merchantId: string;
  /** 商户名称/企业名 */
  merchantName?: string;
  inviteCode: string;
  status: MerchantInviteRelationStatus;
  createdAt: string;
  verifiedAt?: string;
  listedAt?: string;
  firstOrderAt?: string;
}

/** 奖励列表项 */
export interface MerchantInviteRewardItem {
  id: string;
  merchantId: string;
  type: MerchantInviteRewardType;
  amount: number; // 分
  status: MerchantInviteRewardStatus;
  relatedOrderId?: string;
  releasedAt?: string;
  createdAt: string;
  /** 商户名称（可选） */
  merchantName?: string;
}
