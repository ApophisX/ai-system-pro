import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { WITHDRAW_QUEUE } from '../constants/withdraw-queue.constant';
import { WithdrawOrderEntity } from '../entities/withdraw-order.entity';
import { WithdrawOrderStatus, WithdrawChannel } from '../enums';
import { WithdrawOrderRepository } from '../repositories/withdraw-order.repository';
import { MerchantAccountService } from '../services/merchant-account.service';
import { WithdrawPaymentMockAdapter } from '../adapters/withdraw-payment-mock.adapter';

export interface WithdrawProcessJobData {
  withdrawOrderId: string;
}

@Processor(WITHDRAW_QUEUE)
export class WithdrawProcessProcessor extends WorkerHost {
  private readonly logger = new Logger(WithdrawProcessProcessor.name);

  constructor(
    private readonly withdrawOrderRepo: WithdrawOrderRepository,
    private readonly merchantAccountService: MerchantAccountService,
    private readonly withdrawPaymentAdapter: WithdrawPaymentMockAdapter,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async process(job: Job<WithdrawProcessJobData>): Promise<void> {
    const { withdrawOrderId } = job.data;

    this.logger.log(`处理打款任务: withdrawOrderId=${withdrawOrderId}`);

    const order = await this.withdrawOrderRepo.findOne({
      where: { id: withdrawOrderId, status: WithdrawOrderStatus.APPROVED },
    });

    if (!order) {
      this.logger.warn(`提现单不存在或非待打款状态: withdrawOrderId=${withdrawOrderId}`);
      return;
    }

    const casOk = await this.withdrawOrderRepo.casApprovedToProcessing(order.id);
    if (!casOk) {
      this.logger.warn(`CAS 更新失败，可能已被其他 Worker 处理: withdrawOrderId=${withdrawOrderId}`);
      return;
    }

    try {
      const result = await this.withdrawPaymentAdapter.transfer({
        channel: order.withdrawChannel ?? WithdrawChannel.WECHAT,
        targetAccount: order.targetAccount,
        amount: order.amount,
        idempotencyKey: order.idempotencyKey,
        bankBranchAddress: order.bankBranchAddress,
      });

      await this.dataSource.transaction(async manager => {
        if (result.success) {
          await this.merchantAccountService.onWithdrawSuccess(
            order.merchantId,
            order.amount,
            order.id,
            order.idempotencyKey,
            manager,
          );

          const updated = await manager.findOne(WithdrawOrderEntity, { where: { id: order.id } });
          if (updated) {
            updated.status = WithdrawOrderStatus.COMPLETED;
            updated.completedAt = new Date();
            updated.thirdPartyWithdrawNo = result.thirdPartyWithdrawNo;
            await manager.save(WithdrawOrderEntity, updated);
          }

          // 注：merchant_account 已更新，流水已写入 account_flow
          // LessorFinanceEntity 的 createWithdrawExpense 需 WithdrawalRecordEntity，
          // 本流程使用 withdraw_order，暂不创建 LessorFinance 提现记录
          // 余额同步在 getOrCreateAndSync 中通过 LessorFinance + withdraw_orders 计算
        } else {
          await this.merchantAccountService.onWithdrawFail(
            order.merchantId,
            order.amount,
            order.id,
            order.idempotencyKey,
            manager,
          );

          const updated = await manager.findOne(WithdrawOrderEntity, { where: { id: order.id } });
          if (updated) {
            updated.status = WithdrawOrderStatus.FAILED;
            updated.completedAt = new Date();
            updated.failedReason = result.failedReason || '打款失败';
            await manager.save(WithdrawOrderEntity, updated);
          }
        }
      });

      this.logger.log(`打款任务完成: withdrawOrderId=${withdrawOrderId}, success=${result.success}`);
    } catch (error) {
      this.logger.error(`打款任务失败: withdrawOrderId=${withdrawOrderId}`, error);

      await this.dataSource.transaction(async manager => {
        await this.merchantAccountService.onWithdrawFail(
          order.merchantId,
          order.amount,
          order.id,
          order.idempotencyKey,
          manager,
        );

        const updated = await manager.findOne(WithdrawOrderEntity, { where: { id: order.id } });
        if (updated) {
          updated.status = WithdrawOrderStatus.FAILED;
          updated.completedAt = new Date();
          updated.failedReason = error instanceof Error ? error.message : '打款异常';
          await manager.save(WithdrawOrderEntity, updated);
        }
      });

      throw error;
    }
  }
}
