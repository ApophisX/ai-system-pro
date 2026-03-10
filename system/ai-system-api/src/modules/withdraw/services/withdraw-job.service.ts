import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { WITHDRAW_QUEUE } from '../constants/withdraw-queue.constant';
import { WithdrawProcessJobData } from '../processors/withdraw-process.processor';

@Injectable()
export class WithdrawJobService {
  constructor(
    @InjectQueue(WITHDRAW_QUEUE)
    private readonly withdrawQueue: Queue,
  ) {}

  /**
   * 添加打款任务（审核通过后调用）
   */
  async addProcessJob(withdrawOrderId: string): Promise<void> {
    await this.withdrawQueue.add('process-withdraw', { withdrawOrderId } as WithdrawProcessJobData, {
      jobId: withdrawOrderId,
      removeOnComplete: 1000,
    });
  }
}
