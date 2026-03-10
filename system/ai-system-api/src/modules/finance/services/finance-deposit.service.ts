import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { FinanceService } from './finance.service';
import { LessorFinanceEntity } from '@/modules/finance/entities/lessor-finance.entity';
import { DepositDeductionEntity } from '@/modules/rental-order/entities/deposit-deduction.entity';
import { DepositDeductionStatus } from '@/modules/rental-order/enums';

/**
 * 押金扣款财务服务
 *
 * 处理押金扣款相关的财务记录创建
 */
@Injectable()
export class FinanceDepositService {
  private readonly logger = new Logger(FinanceDepositService.name);

  constructor(
    private readonly financeService: FinanceService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 当押金扣款执行完成时，创建收入记录
   *
   * 调用时机：押金扣款状态更新为 EXECUTED 时
   * @param deduction 扣款记录
   * @param manager 可选，传入时与调用方同一事务执行，避免跨事务锁等待（Lock wait timeout）
   */
  async handleDepositDeductionExecuted(deduction: DepositDeductionEntity, manager?: EntityManager): Promise<void> {
    this.logger.log(`押金扣款执行完成，准备创建收入记录: deductionNo=${deduction.deductionNo}`);

    try {
      // 1. 检查是否已创建财务记录（幂等性检查）
      const existingFinance = manager
        ? await manager.findOne(LessorFinanceEntity, { where: { depositDeductionId: deduction.id } })
        : await this.financeService['financeRepo'].findByDepositDeductionId(deduction.id);

      if (existingFinance) {
        this.logger.warn(`财务记录已存在，跳过创建: deductionId=${deduction.id}`);
        return;
      }

      // 2. 创建收入记录（待入账状态）
      await this.financeService.createDepositDeductionIncome(
        deduction.id,
        deduction.deductionNo,
        deduction.orderId,
        deduction.orderNo,
        deduction.lessorId,
        deduction.lesseeId,
        deduction.amount.toString(),
        deduction.deductedAt || new Date(),
        manager,
      );

      // 3. 确认入账（扣款执行完成即确认入账）
      const finance = manager
        ? await manager.findOne(LessorFinanceEntity, { where: { depositDeductionId: deduction.id } })
        : await this.financeService['financeRepo'].findByDepositDeductionId(deduction.id);

      if (finance) {
        await this.financeService.confirmFinance({ financeId: finance.id, manager });
      }

      this.logger.log(`押金扣款收入记录创建成功: deductionNo=${deduction.deductionNo}`);
    } catch (error) {
      this.logger.error(
        `创建押金扣款收入记录失败: deductionNo=${deduction.deductionNo}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  /**
   * 检查押金扣款是否已执行，如果已执行则创建财务记录
   *
   * 用于补偿机制：检查历史数据，确保所有已执行的扣款都有财务记录
   */
  async checkAndCreateFinanceForExecutedDeduction(deductionId: string): Promise<void> {
    const deduction = await this.dataSource.manager.findOne(DepositDeductionEntity, {
      where: { id: deductionId },
    });

    if (!deduction) {
      this.logger.warn(`押金扣款记录不存在: deductionId=${deductionId}`);
      return;
    }

    if (deduction.status === DepositDeductionStatus.EXECUTED) {
      await this.handleDepositDeductionExecuted(deduction);
    }
  }
}
