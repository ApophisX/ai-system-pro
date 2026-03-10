/**
 * 商户邀请关系状态
 *
 * 四级转化漏斗：REGISTERED → VERIFIED → LISTED → FIRST_ORDER
 */
export enum MerchantInviteRelationStatus {
  /** 已注册 */
  REGISTERED = 'registered',
  /** 已认证 */
  VERIFIED = 'verified',
  /** 已上架（≥3 资产且审核通过） */
  LISTED = 'listed',
  /** 首单已完成 */
  FIRST_ORDER = 'first_order',
}
