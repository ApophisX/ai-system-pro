/**
 * 商户邀请裂变配置常量
 *
 * 当前阶段：轻量分润模式，仅对已完成的真实订单分润
 */
export const MERCHANT_INVITE_CONFIG = {
  /** 分润比例（10% = 0.1），从平台费中计提 */
  REBATE_RATE: 0.1,
  /** 单笔分润封顶（元） */
  REBATE_CAP_PER_ORDER: 50,
  /** 员工月度分润封顶（元） */
  REBATE_CAP_MONTHLY: 500,
  /** 7 天观察期（天），观察期内发生租金退款则 REVOKED */
  REBATE_OBSERVE_DAYS: 7,
  /** 上架达标：资产数量阈值 */
  LISTED_ASSET_MIN_COUNT: 3,
} as const;
