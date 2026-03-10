/**
 * 押金扣款超时处理器
 *
 * 处理押金扣款申请超时未响应的业务逻辑
 * 当出租方在扣款申请发起后超过 72 小时未进行任何操作（未同意亦未拒绝），
 * 视为超时未响应，触发平台介入审核
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { DepositDeductionRepository } from '../../repositories';
import { DepositDeductionEntity } from '../../entities';
import { DepositDeductionStatus } from '../../enums';
import { RENTAL_ORDER_DEPOSIT_DEDUCTION_TIMEOUT_QUEUE } from '../constants/rental-order-queue.constant';
import dayjs from 'dayjs';
import { DepositDeductionTimeoutJobData } from '../type';

@Processor(RENTAL_ORDER_DEPOSIT_DEDUCTION_TIMEOUT_QUEUE)
export class DepositDeductionTimeoutProcessor extends WorkerHost {
  private readonly logger = new Logger(DepositDeductionTimeoutProcessor.name);

  constructor(
    private readonly deductionRepo: DepositDeductionRepository,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async process(job: Job<DepositDeductionTimeoutJobData>): Promise<void> {
    const { deductionId, deductionNo, orderId, orderNo, depositId, timeoutAt } = job.data;

    this.logger.log(`处理押金扣款超时任务: deductionNo=${deductionNo}, orderNo=${orderNo}, deductionId=${deductionId}`);

    try {
      // 1. 查询扣款申请当前状态
      const deduction = await this.deductionRepo.findOneBy({ id: deductionId });

      if (!deduction) {
        this.logger.warn(`扣款申请不存在: deductionNo=${deductionNo}, deductionId=${deductionId}`);
        return;
      }

      // 2. 检查扣款申请是否处于待用户确认状态（只有待用户确认状态的申请才会超时）
      if (deduction.status !== DepositDeductionStatus.PENDING_USER_CONFIRM) {
        this.logger.log(
          `扣款申请已处理或不在待用户确认状态，跳过: deductionNo=${deductionNo}, status=${deduction.status}, statusLabel=${deduction.statusLabel}`,
        );
        return;
      }

      // 3. 检查超时时间是否已过
      const now = dayjs();
      const timeout = dayjs(timeoutAt);

      if (now.isBefore(timeout)) {
        this.logger.log(
          `扣款申请未超时: deductionNo=${deductionNo}, timeoutAt=${timeout.format('YYYY-MM-DD HH:mm:ss')}`,
        );
        return;
      }

      // 4. 在事务中处理超时逻辑
      await this.dataSource.transaction(async manager => {
        // 4.1 重新查询扣款申请，确保获取最新状态（使用悲观锁防止并发）
        const currentDeduction = await manager.findOne(DepositDeductionEntity, {
          where: { id: deductionId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!currentDeduction) {
          this.logger.warn(`扣款申请不存在（事务内）: deductionNo=${deductionNo}, deductionId=${deductionId}`);
          return;
        }

        // 4.2 再次检查状态，防止并发问题
        if (currentDeduction.status !== DepositDeductionStatus.PENDING_USER_CONFIRM) {
          this.logger.log(
            `扣款申请状态已发生变化，跳过处理: deductionNo=${deductionNo}, status=${currentDeduction.status}`,
          );
          return;
        }

        // 4.3 更新扣款申请状态，标记为超时未响应，触发平台审核
        // 注意：超时未响应不视为承租方同意，仅触发平台介入审核
        // 状态更新为 PENDING_AUDIT，表示等待平台审核
        const timeoutDescription = `承租方在扣款申请发起后超过 72 小时未进行任何操作（未同意亦未拒绝），视为超时未响应，已触发平台介入审核。原说明：${currentDeduction.description || '无'}`;

        await manager.update(
          DepositDeductionEntity,
          { id: deductionId },
          {
            status: DepositDeductionStatus.PENDING_AUDIT,
            description: timeoutDescription,
          },
        );

        this.logger.log(
          `押金扣款超时任务处理完成: deductionNo=${deductionNo}, orderNo=${orderNo}, deductionId=${deductionId}，已标记为超时未响应，等待平台审核`,
        );
      });
    } catch (error) {
      this.logger.error(
        `押金扣款超时任务处理失败: deductionNo=${deductionNo}, orderNo=${orderNo}, deductionId=${deductionId}`,
        error.stack,
      );
      throw error;
    }
  }
}
