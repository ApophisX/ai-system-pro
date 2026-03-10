import { Injectable, Logger } from '@nestjs/common';
import {
  IWithdrawPaymentAdapter,
  WithdrawPaymentResult,
  WithdrawTransferParams,
} from '../interfaces/withdraw-payment.interface';

/**
 * 提现打款 Mock 适配器
 *
 * 用于开发/测试环境，模拟打款成功
 * 生产环境需替换为真实的微信/支付宝转账实现
 */
@Injectable()
export class WithdrawPaymentMockAdapter implements IWithdrawPaymentAdapter {
  private readonly logger = new Logger(WithdrawPaymentMockAdapter.name);

  async transfer(params: WithdrawTransferParams): Promise<WithdrawPaymentResult> {
    this.logger.log(
      `[Mock] 模拟打款: channel=${params.channel}, targetAccount=${params.targetAccount}, amount=${params.amount}, idempotencyKey=${params.idempotencyKey}`,
    );

    return {
      success: true,
      thirdPartyWithdrawNo: `MOCK-${params.idempotencyKey.slice(0, 16)}`,
    };
  }
}
