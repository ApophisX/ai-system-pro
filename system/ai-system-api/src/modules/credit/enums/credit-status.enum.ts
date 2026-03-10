/**
 * 信用状态枚举
 *
 * 与 user.status 区分：
 * - user.status：账户级（active/frozen/banned），影响登录、提现等全功能
 * - credit_status：信用级，仅影响下单、免押、分期等信用相关能力
 */
export enum CreditStatus {
  /** 正常 */
  NORMAL = 'normal',

  /** 冻结（争议、大额逾期、风控命中等） */
  FROZEN = 'frozen',
}
