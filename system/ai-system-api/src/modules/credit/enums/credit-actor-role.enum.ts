/**
 * 信用行为主体角色枚举
 *
 * 双角色信用隔离：同一用户可同时为出租方和承租方
 * - lessee 承租方：履约、逾期、押金扣除、争议败诉等
 * - lessor 出租方：虚假凭证、恶意拒绝归还、恶意取消等
 */
export enum CreditActorRole {
  /** 承租方 */
  LESSEE = 'lessee',

  /** 出租方 */
  LESSOR = 'lessor',
}
