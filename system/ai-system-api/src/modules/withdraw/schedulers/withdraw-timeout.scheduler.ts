import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { WithdrawOrderRepository } from '../repositories/withdraw-order.repository';
import { WithdrawOrderStatus } from '../enums';
import { WITHDRAW_CONFIG_KEY, WithdrawConfig } from '@/config';

/**
 * 提现打款超时补偿定时任务
 *
 * 扫描 PROCESSING 状态超过 N 分钟的记录
 * 主动查询第三方订单状态或标记为 FAILED 执行退款
 */
@Injectable()
export class WithdrawTimeoutScheduler {
  private readonly logger = new Logger(WithdrawTimeoutScheduler.name);

  constructor(
    private readonly withdrawOrderRepo: WithdrawOrderRepository,
    private readonly configService: ConfigService,
  ) {}

  private get withdrawConfig(): WithdrawConfig {
    return this.configService.get<WithdrawConfig>(WITHDRAW_CONFIG_KEY)!;
  }

  @Cron('*/5 * * * *')
  async handleProcessingTimeout(): Promise<void> {
    const timeoutMinutes = this.withdrawConfig.processingTimeoutMinutes;
    const orders = await this.withdrawOrderRepo.findProcessingTimeoutOrders(timeoutMinutes);

    if (orders.length === 0) {
      return;
    }

    this.logger.warn(
      `发现 ${orders.length} 笔打款超时订单，需主动查询第三方状态或标记失败: timeoutMinutes=${timeoutMinutes}`,
    );

    for (const order of orders) {
      this.logger.warn(
        `打款超时: withdrawNo=${order.withdrawNo}, processedAt=${order.processedAt}, 建议人工核查或接入第三方查询 API`,
      );
      // TODO: 接入第三方支付渠道的订单状态查询 API
      // 若查询为失败或 unknown，可执行 onWithdrawFail 并更新状态为 FAILED
    }
  }
}
