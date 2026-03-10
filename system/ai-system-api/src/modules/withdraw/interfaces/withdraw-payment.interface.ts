/**
 * 提现打款适配器接口
 *
 * 用于对接第三方支付渠道（微信/支付宝/银行）
 * 实现类需保证：携带 idempotency_key 防重复打款
 */
export interface WithdrawPaymentResult {
  success: boolean;
  thirdPartyWithdrawNo?: string;
  failedReason?: string;
}

import { WithdrawChannel } from '../enums';

export interface WithdrawTransferParams {
  channel: WithdrawChannel;
  targetAccount: string;
  amount: string;
  idempotencyKey: string;
  bankBranchAddress?: string;
}

export interface IWithdrawPaymentAdapter {
  /**
   * 执行打款
   * @param params 打款参数（渠道、账户、金额、幂等键、开户行等）
   */
  transfer(params: WithdrawTransferParams): Promise<WithdrawPaymentResult>;
}
