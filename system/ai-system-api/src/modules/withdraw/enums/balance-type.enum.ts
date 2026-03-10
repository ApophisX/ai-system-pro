/**
 * 余额类型枚举
 *
 * 标识流水影响的余额类型
 */
export enum BalanceType {
  /** 可提现余额 */
  AVAILABLE = 'available',

  /** 冻结余额 */
  FROZEN = 'frozen',

  /** 总余额 */
  TOTAL = 'total',
}
