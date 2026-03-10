import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { LessorFinanceEntity } from '../entities/lessor-finance.entity';
import { FinanceRepository } from '../repositories/finance.repository';
import { SequenceNumberService } from '@/infrastructure/sequence-number/sequence-number.service';
import { OutputFinanceDto } from '../dto/output-finance.dto';
import { QueryFinanceDto } from '../dto/query-finance.dto';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import {
  FinanceDirection,
  FinanceIncomeType,
  FinanceExpenseType,
  FinanceStatus,
  FinanceFlowStatus,
  Currency,
  getBusinessTypeByIncomeType,
  getBusinessTypeByExpenseType,
} from '../enums';
import { SequenceNumberType, SequenceNumberPrefix } from '@/infrastructure/sequence-number/sequence-number.enum';
import Decimal from 'decimal.js';
import dayjs from 'dayjs';
import { PaymentEntity } from '@/modules/base/payment/entities';

/**
 * 创建收入记录选项
 */
export interface CreateIncomeRecordOptions {
  lessorId: string;
  lesseeId: string;
  incomeType: FinanceIncomeType;
  amount: string;
  currency?: Currency;
  orderId?: string;
  orderNo?: string;
  paymentId?: string;
  paymentNo?: string;
  paymentRecordId?: string;
  paymentRecordNo?: string;
  depositDeductionId?: string;
  deductionNo?: string;
  businessOccurredAt?: Date;
  remark?: string;
  platformFeeAmount?: string;
  platformFeeRate?: string;
  manager?: EntityManager;
}

/**
 * 创建支出记录选项
 */
export interface CreateExpenseRecordOptions {
  lessorId: string;
  lesseeId: string;
  expenseType: FinanceExpenseType;
  amount: string;
  currency?: Currency;
  orderId?: string;
  orderNo?: string;
  paymentId?: string;
  paymentNo?: string;
  paymentRecordId?: string;
  paymentRecordNo?: string;
  refundRecordId?: string;
  refundNo?: string;
  withdrawalRecordId?: string;
  withdrawalNo?: string;
  depositDeductionId?: string;
  deductionNo?: string;
  businessOccurredAt?: Date;
  remark?: string;
  manager?: EntityManager;
}

/**
 * 确认入账选项
 */
export interface ConfirmFinanceOptions {
  financeId: string;
  manager?: EntityManager;
}

/**
 * 创建冲正记录选项
 */
export interface CreateReverseRecordOptions {
  originalFinanceId: string;
  reverseReason: string;
  manager?: EntityManager;
}

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    private readonly financeRepo: FinanceRepository,
    private readonly sequenceNumberService: SequenceNumberService,
    private readonly dataSource: DataSource,
  ) {
    // 暴露 financeRepo 供事件监听器使用
    (this as any).financeRepo = financeRepo;
  }

  /**
   * 出租方收支明细分页查询
   * 时间筛选按业务发生时间（businessOccurredAt）过滤
   */
  async findPageList(
    lessorId: string,
    dto: QueryFinanceDto,
  ): Promise<{ data: OutputFinanceDto[]; meta: PaginationMetaDto }> {
    const pagination = new PaginationMetaDto(dto.page, dto.pageSize);

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (dto.startDate) {
      startDate = dayjs(dto.startDate).startOf('day').toDate();
    }
    if (dto.endDate) {
      endDate = dayjs(dto.endDate).endOf('day').toDate();
    }

    if (startDate && endDate && dayjs(startDate).isAfter(endDate)) {
      throw new BadRequestException('开始日期不能晚于结束日期');
    }

    const [list, total] = await this.financeRepo.findByLessorId(lessorId, {
      direction: dto.direction,
      status: dto.status,
      businessType: dto.businessType,
      startDate,
      endDate,
      skip: pagination.skip,
      take: pagination.pageSize,
    });
    const data = plainToInstance(OutputFinanceDto, list, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
    pagination.total = total;
    return { data, meta: pagination };
  }

  /**
   * 创建收入记录
   */
  async createIncomeRecord(options: CreateIncomeRecordOptions): Promise<LessorFinanceEntity> {
    const execute = async (manager: EntityManager) => {
      // 1. 生成财务单号
      const financeNo = await this.sequenceNumberService.generate({
        businessType: SequenceNumberType.LESSOR_FINANCE,
        prefix: SequenceNumberPrefix.LESSOR_FINANCE_INCOME,
      });

      // 2. 推导业务大类
      const businessType = getBusinessTypeByIncomeType(options.incomeType);

      // 3. 创建财务记录
      const finance = manager.getRepository(LessorFinanceEntity).create({
        financeNo,
        lessorId: options.lessorId,
        lesseeId: options.lesseeId,
        direction: FinanceDirection.INCOME,
        incomeType: options.incomeType,
        businessType,
        status: FinanceStatus.PENDING,
        flowStatus: FinanceFlowStatus.CREDITING,
        currency: options.currency || Currency.CNY,
        amount: options.amount,
        affectAvailable: false, // 待入账，不影响可提现余额
        orderId: options.orderId,
        orderNo: options.orderNo,
        paymentId: options.paymentId,
        paymentNo: options.paymentNo,
        paymentRecordId: options.paymentRecordId,
        paymentRecordNo: options.paymentRecordNo,
        depositDeductionId: options.depositDeductionId,
        deductionNo: options.deductionNo,
        businessOccurredAt: options.businessOccurredAt || new Date(),
        remark: options.remark,
        platformFeeAmount: options.platformFeeAmount,
        platformFeeRate: options.platformFeeRate,
      });

      const savedFinance = await manager.save(LessorFinanceEntity, finance);

      this.logger.log(
        `创建收入记录成功: financeNo=${financeNo}, lessorId=${options.lessorId}, incomeType=${options.incomeType}, amount=${options.amount}`,
      );

      return savedFinance;
    };

    if (options.manager) {
      return execute(options.manager);
    } else {
      return this.dataSource.transaction(execute);
    }
  }

  /**
   * 创建支出记录
   */
  async createExpenseRecord(options: CreateExpenseRecordOptions): Promise<LessorFinanceEntity> {
    const execute = async (manager: EntityManager) => {
      // 1. 生成财务单号
      const prefix =
        options.expenseType === FinanceExpenseType.WITHDRAW
          ? SequenceNumberPrefix.LESSOR_FINANCE_WITHDRAW
          : SequenceNumberPrefix.LESSOR_FINANCE_EXPENSE;

      const financeNo = await this.sequenceNumberService.generate({
        businessType: SequenceNumberType.LESSOR_FINANCE,
        prefix,
      });

      // 2. 推导业务大类
      const businessType = getBusinessTypeByExpenseType(options.expenseType);

      // 3. 确定资金流状态
      let flowStatus: FinanceFlowStatus | undefined;
      if (options.expenseType === FinanceExpenseType.WITHDRAW) {
        flowStatus = FinanceFlowStatus.WITHDRAWING;
      } else if (options.expenseType === FinanceExpenseType.RENT_REFUND) {
        flowStatus = FinanceFlowStatus.REFUNDING;
      }

      // 4. 创建财务记录
      const finance = manager.create(LessorFinanceEntity, {
        financeNo,
        lessorId: options.lessorId,
        lesseeId: options.lesseeId,
        direction: FinanceDirection.EXPENSE,
        expenseType: options.expenseType,
        businessType,
        status: FinanceStatus.PENDING,
        flowStatus,
        currency: options.currency || Currency.CNY,
        amount: options.amount,
        affectAvailable: options.expenseType === FinanceExpenseType.WITHDRAW, // 提现影响可提现余额
        orderId: options.orderId,
        orderNo: options.orderNo,
        paymentId: options.paymentId,
        paymentNo: options.paymentNo,
        paymentRecordId: options.paymentRecordId,
        paymentRecordNo: options.paymentRecordNo,
        refundRecordId: options.refundRecordId,
        refundNo: options.refundNo,
        withdrawalRecordId: options.withdrawalRecordId,
        withdrawalNo: options.withdrawalNo,
        depositDeductionId: options.depositDeductionId,
        deductionNo: options.deductionNo,
        businessOccurredAt: options.businessOccurredAt || new Date(),
        remark: options.remark,
      });

      const savedFinance = await manager.save(LessorFinanceEntity, finance);

      this.logger.log(
        `创建支出记录成功: financeNo=${financeNo}, lessorId=${options.lessorId}, expenseType=${options.expenseType}, amount=${options.amount}`,
      );

      return savedFinance;
    };

    if (options.manager) {
      return execute(options.manager);
    } else {
      return this.dataSource.transaction(execute);
    }
  }

  /**
   * 按订单批量确认入账（确认收货后，将该订单下所有待入账的订单租金收入改为已入账）
   * 按创建时间升序逐条确认，保证 balanceAfter 链正确。
   */
  async confirmFinanceByOrderId(orderId: string): Promise<LessorFinanceEntity[]> {
    const list = await this.financeRepo.findPendingOrderRentByOrderId(orderId);
    if (list.length === 0) {
      this.logger.log(`订单无待入账的租金收入记录，跳过: orderId=${orderId}`);
      return [];
    }
    const result: LessorFinanceEntity[] = [];
    for (const finance of list) {
      const confirmed = await this.confirmFinance({ financeId: finance.id });
      result.push(confirmed);
    }
    this.logger.log(`订单确认入账完成: orderId=${orderId}, 确认条数=${result.length}`);
    return result;
  }

  /**
   * 确认入账（将待入账记录更新为已入账）
   */
  async confirmFinance(options: ConfirmFinanceOptions): Promise<LessorFinanceEntity> {
    const execute = async (manager: EntityManager) => {
      // 1. 查询财务记录
      const finance = await manager.findOne(LessorFinanceEntity, {
        where: { id: options.financeId },
      });

      if (!finance) {
        throw new Error(`财务记录不存在: financeId=${options.financeId}`);
      }

      if (finance.status === FinanceStatus.CONFIRMED) {
        this.logger.warn(`财务记录已经是已入账状态，跳过: financeId=${options.financeId}`);
        return finance;
      }

      if (finance.status === FinanceStatus.REVERSED) {
        throw new Error(`财务记录已被冲正，无法确认入账: financeId=${options.financeId}`);
      }

      // 2. 计算账后余额（传入 manager 时排除当前记录，避免同一事务内刚插入的本条被当作“上一条”）
      const lastBalanceAfter = await this.financeRepo.getLastBalanceAfter(finance.lessorId, {
        ...(options.manager && {
          manager: options.manager,
          excludeFinanceId: finance.id,
        }),
      });
      const lastBalance = lastBalanceAfter ? new Decimal(lastBalanceAfter) : new Decimal(0);
      const currentAmount = new Decimal(finance.amount);

      let balanceAfter: Decimal;
      if (finance.direction === FinanceDirection.INCOME) {
        balanceAfter = lastBalance.plus(currentAmount);
      } else {
        balanceAfter = lastBalance.minus(currentAmount);
      }

      // 3. 更新财务记录
      finance.status = FinanceStatus.CONFIRMED;
      finance.confirmedAt = new Date();
      finance.balanceAfter = balanceAfter.toString();
      finance.affectAvailable = finance.direction === FinanceDirection.INCOME; // 收入确认后影响可提现余额

      // 4. 更新资金流状态
      if (finance.direction === FinanceDirection.INCOME) {
        finance.flowStatus = FinanceFlowStatus.CREDITED;
      } else {
        if (finance.expenseType === FinanceExpenseType.WITHDRAW) {
          finance.flowStatus = FinanceFlowStatus.WITHDRAWN;
        } else {
          finance.flowStatus = FinanceFlowStatus.REFUNDED;
        }
      }

      const savedFinance = await manager.save(LessorFinanceEntity, finance);

      this.logger.log(
        `确认入账成功: financeId=${options.financeId}, financeNo=${finance.financeNo}, balanceAfter=${balanceAfter.toString()}`,
      );

      return savedFinance;
    };

    if (options.manager) {
      return execute(options.manager);
    } else {
      return this.dataSource.transaction(execute);
    }
  }

  /**
   * 创建冲正记录
   */
  async createReverseRecord(options: CreateReverseRecordOptions): Promise<LessorFinanceEntity> {
    const execute = async (manager: EntityManager) => {
      // 1. 查询原始财务记录
      const originalFinance = await manager.findOne(LessorFinanceEntity, {
        where: { id: options.originalFinanceId },
      });

      if (!originalFinance) {
        throw new Error(`原始财务记录不存在: financeId=${options.originalFinanceId}`);
      }

      if (originalFinance.status === FinanceStatus.REVERSED) {
        throw new Error(`原始财务记录已被冲正: financeId=${options.originalFinanceId}`);
      }

      // 2. 生成财务单号
      const financeNo = await this.sequenceNumberService.generate({
        businessType: SequenceNumberType.LESSOR_FINANCE,
        prefix: SequenceNumberPrefix.LESSOR_FINANCE_REVERSE,
      });

      // 3. 创建冲正记录（方向相反）
      const reverseDirection =
        originalFinance.direction === FinanceDirection.INCOME ? FinanceDirection.EXPENSE : FinanceDirection.INCOME;

      const now = new Date();
      const reverseFinance = manager.create(LessorFinanceEntity, {
        financeNo,
        lessorId: originalFinance.lessorId,
        direction: reverseDirection,
        incomeType:
          reverseDirection === FinanceDirection.INCOME
            ? originalFinance.expenseType === FinanceExpenseType.RENT_REFUND
              ? FinanceIncomeType.ORDER_RENT
              : undefined
            : undefined,
        expenseType:
          reverseDirection === FinanceDirection.EXPENSE
            ? originalFinance.incomeType === FinanceIncomeType.ORDER_RENT
              ? FinanceExpenseType.RENT_REFUND
              : undefined
            : undefined,
        businessType: originalFinance.businessType,
        status: FinanceStatus.REVERSED,
        currency: originalFinance.currency,
        amount: originalFinance.amount,
        affectAvailable: false, // 冲正不影响可提现余额
        orderId: originalFinance.orderId,
        orderNo: originalFinance.orderNo,
        paymentId: originalFinance.paymentId,
        paymentNo: originalFinance.paymentNo,
        paymentRecordId: originalFinance.paymentRecordId,
        paymentRecordNo: originalFinance.paymentRecordNo,
        depositDeductionId: originalFinance.depositDeductionId,
        deductionNo: originalFinance.deductionNo,
        refundRecordId: originalFinance.refundRecordId,
        refundNo: originalFinance.refundNo,
        withdrawalRecordId: originalFinance.withdrawalRecordId,
        withdrawalNo: originalFinance.withdrawalNo,
        reversedFinanceId: originalFinance.id,
        reversedFinanceNo: originalFinance.financeNo,
        reverseReason: options.reverseReason,
        businessOccurredAt: now,
        reversedAt: now,
      });

      const savedReverseFinance = await manager.save(LessorFinanceEntity, reverseFinance);

      // 4. 更新原始记录，标记已被冲正
      originalFinance.status = FinanceStatus.REVERSED;
      originalFinance.originalFinanceId = savedReverseFinance.id;
      originalFinance.originalFinanceNo = savedReverseFinance.financeNo;
      originalFinance.reversedAt = now;
      originalFinance.reverseReason = options.reverseReason;
      await manager.save(LessorFinanceEntity, originalFinance);

      this.logger.log(
        `创建冲正记录成功: financeNo=${financeNo}, originalFinanceId=${options.originalFinanceId}, reverseReason=${options.reverseReason}`,
      );

      return savedReverseFinance;
    };

    if (options.manager) {
      return execute(options.manager);
    } else {
      return this.dataSource.transaction(execute);
    }
  }

  /**
   * 根据支付记录创建订单租金收入记录（便捷方法，固定为 ORDER_RENT）
   */
  async createOrderRentIncome(
    paymentRecordId: string,
    paymentRecordNo: string,
    paymentId: string,
    paymentNo: string,
    orderId: string,
    orderNo: string,
    lessorId: string,
    lesseeId: string,
    amount: string,
    paidAt: Date,
    manager?: EntityManager,
  ): Promise<LessorFinanceEntity> {
    return this.createPaymentIncome({
      paymentRecordId,
      paymentRecordNo,
      paymentId,
      paymentNo,
      orderId,
      orderNo,
      lessorId,
      lesseeId,
      amount,
      paidAt,
      incomeType: FinanceIncomeType.ORDER_RENT,
      autoConfirm: false,
      manager,
    });
  }

  /**
   * 根据支付记录创建收入记录
   *
   * - 已支付待收货（PAID）：待入账，确认入账在承租方确认收货时完成
   * - 使用中支付（IN_USE 等）：直接入账，incomeType 从 paymentRecord.paymentType 映射
   */
  async createPaymentIncome(options: {
    paymentRecordId: string;
    paymentRecordNo: string;
    paymentId: string;
    paymentNo: string;
    orderId: string;
    orderNo: string;
    lessorId: string;
    lesseeId: string;
    amount: string;
    paidAt: Date;
    incomeType: FinanceIncomeType;
    /** 是否直接入账（使用中支付如分期、逾期费、违约金等） */
    autoConfirm?: boolean;
    manager?: EntityManager;
  }): Promise<LessorFinanceEntity> {
    const execute = async (manager: EntityManager) => {
      const finance = await this.createIncomeRecord({
        lessorId: options.lessorId,
        lesseeId: options.lesseeId,
        incomeType: options.incomeType,
        amount: options.amount,
        orderId: options.orderId,
        orderNo: options.orderNo,
        paymentId: options.paymentId,
        paymentNo: options.paymentNo,
        paymentRecordId: options.paymentRecordId,
        paymentRecordNo: options.paymentRecordNo,
        businessOccurredAt: options.paidAt,
        remark: `支付收入，支付记录号：${options.paymentRecordNo}`,
        manager,
      });

      if (options.autoConfirm) {
        await this.confirmFinance({ financeId: finance.id, manager });
      }

      return finance;
    };

    if (options.manager) {
      return execute(options.manager);
    }
    return this.dataSource.transaction(execute);
  }

  /**
   * 根据超时使用费支付记录创建收入记录
   *
   * 超时使用费属于使用中支付，直接入账（autoConfirm=true），影响出租方可提现余额。
   */
  async createOverdueFeeIncome(
    paymentRecordId: string,
    paymentRecordNo: string,
    orderId: string,
    orderNo: string,
    lessorId: string,
    lesseeId: string,
    amount: string,
    paidAt: Date,
    manager?: EntityManager,
  ): Promise<LessorFinanceEntity> {
    const execute = async (mgr: EntityManager) => {
      const finance = await this.createIncomeRecord({
        lessorId,
        lesseeId,
        incomeType: FinanceIncomeType.LATE_FEE,
        amount,
        orderId,
        orderNo,
        paymentRecordId,
        paymentRecordNo,
        businessOccurredAt: paidAt,
        remark: `超时使用费收入，支付记录号：${paymentRecordNo}`,
        manager: mgr,
      });

      await this.confirmFinance({ financeId: finance.id, manager: mgr });

      return finance;
    };

    if (manager) {
      return execute(manager);
    }
    return this.dataSource.transaction(execute);
  }

  /**
   * 根据押金扣款创建收入记录
   */
  async createDepositDeductionIncome(
    depositDeductionId: string,
    deductionNo: string,
    orderId: string,
    orderNo: string,
    lessorId: string,
    lesseeId: string,
    amount: string,
    deductedAt: Date,
    manager?: EntityManager,
  ): Promise<LessorFinanceEntity> {
    return this.createIncomeRecord({
      lessorId,
      lesseeId,
      incomeType: FinanceIncomeType.DEPOSIT_DEDUCT,
      amount,
      orderId,
      orderNo,
      depositDeductionId,
      deductionNo,
      businessOccurredAt: deductedAt,
      remark: `押金扣款收入，扣款单号：${deductionNo}`,
      manager,
    });
  }

  /**
   * 根据退款记录创建支出记录
   */
  async createRentRefundExpense(
    refundRecordId: string,
    refundNo: string,
    paymentId: string,
    paymentNo: string,
    paymentRecordId: string,
    paymentRecordNo: string,
    orderId: string,
    orderNo: string,
    lessorId: string,
    lesseeId: string,
    amount: string,
    refundedAt: Date,
    manager?: EntityManager,
  ): Promise<LessorFinanceEntity> {
    return this.createExpenseRecord({
      lessorId,
      lesseeId,
      expenseType: FinanceExpenseType.RENT_REFUND,
      amount,
      orderId,
      orderNo,
      paymentId,
      paymentNo,
      paymentRecordId,
      paymentRecordNo,
      refundRecordId,
      refundNo,
      businessOccurredAt: refundedAt,
      remark: `租金退款，退款单号：${refundNo}`,
      manager,
    });
  }

  /**
   * 根据提现记录创建支出记录
   */
  async createWithdrawExpense(
    withdrawalRecordId: string,
    withdrawalNo: string,
    paymentId: string,
    paymentNo: string,
    paymentRecordId: string,
    paymentRecordNo: string,
    orderId: string,
    orderNo: string,
    lessorId: string,
    lesseeId: string,
    amount: string,
    withdrawnAt: Date,
    manager?: EntityManager,
  ): Promise<LessorFinanceEntity> {
    return this.createExpenseRecord({
      lessorId,
      lesseeId,
      expenseType: FinanceExpenseType.WITHDRAW,
      amount,
      orderId,
      orderNo,
      paymentId,
      paymentNo,
      paymentRecordId,
      paymentRecordNo,
      withdrawalRecordId,
      withdrawalNo,
      businessOccurredAt: withdrawnAt,
      remark: `提现支出，提现单号：${withdrawalNo}`,
      manager,
    });
  }

  /**
   * 退款时，将对应支付记录的「收入 + 待入账」财务记录更新为已取消。
   * 适用于：待收货期间退款，出租方尚未入账，直接取消即可，无需新建支出。
   * @param paymentRecordId 被退款的支付记录 ID
   * @param manager 可选，外部事务的 EntityManager
   * @returns 被更新的记录数
   */
  async cancelPendingIncomeByPaymentRecordId(paymentRecordId: string, manager?: EntityManager): Promise<number> {
    const repo = manager ? manager.getRepository(LessorFinanceEntity) : this.financeRepo;
    const result = await repo.update(
      {
        paymentRecordId,
        direction: FinanceDirection.INCOME,
        status: FinanceStatus.PENDING,
      },
      { status: FinanceStatus.CANCELLED },
    );
    const affected = result.affected ?? 0;
    if (affected > 0) {
      this.logger.log(`退款完成，已将待入账收入置为已取消: paymentRecordId=${paymentRecordId}, count=${affected}`);
    }
    return affected;
  }

  /**
   * 订单取消时，将该订单下所有「收入 + 待入账」的财务记录更新为已取消，完成业务闭环。
   * @param orderId 被取消的订单 ID
   * @param manager 可选，外部事务的 EntityManager；传入时在同一事务内更新
   * @returns 被更新的记录数
   */
  async cancelPendingIncomeByOrderId(orderId: string, manager?: EntityManager): Promise<number> {
    const repo = manager ? manager.getRepository(LessorFinanceEntity) : this.financeRepo;
    const result = await repo.update(
      {
        orderId,
        direction: FinanceDirection.INCOME,
        status: FinanceStatus.PENDING,
      },
      { status: FinanceStatus.CANCELLED },
    );
    const affected = result.affected ?? 0;
    if (affected > 0) {
      this.logger.log(`订单取消，已将该订单下待入账收入置为已取消: orderId=${orderId}, count=${affected}`);
    }
    return affected;
  }
}
