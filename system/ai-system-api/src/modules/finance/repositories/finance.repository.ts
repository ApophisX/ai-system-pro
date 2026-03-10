import { Injectable } from '@nestjs/common';
import {
  DataSource,
  Repository,
  FindOptionsWhere,
  EntityManager,
  Not,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  SelectQueryBuilder,
} from 'typeorm';
import Decimal from 'decimal.js';
import { LessorFinanceEntity } from '../entities/lessor-finance.entity';
import {
  BusinessType,
  FinanceDirection,
  FinanceStatus,
  FinanceIncomeType,
  FinanceExpenseType,
  FinanceFlowStatus,
} from '../enums';

/**
 * 财务记录仓储
 */
@Injectable()
export class FinanceRepository extends Repository<LessorFinanceEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(LessorFinanceEntity, dataSource.createEntityManager());
  }

  /**
   * 为 QueryBuilder 应用业务发生时间范围筛选
   */
  private applyBusinessOccurredAtRange(
    qb: SelectQueryBuilder<LessorFinanceEntity>,
    options?: { startDate?: Date; endDate?: Date },
  ): SelectQueryBuilder<LessorFinanceEntity> {
    if (options?.startDate) {
      qb.andWhere('finance.businessOccurredAt >= :startDate', { startDate: options.startDate });
    }
    if (options?.endDate) {
      qb.andWhere('finance.businessOccurredAt <= :endDate', { endDate: options.endDate });
    }
    return qb;
  }

  /**
   * 根据出租方 ID 查询财务记录列表
   * @param options.startDate 开始日期（含当日 00:00:00，按业务发生时间筛选）
   * @param options.endDate 结束日期（含当日 23:59:59，按业务发生时间筛选）
   */
  async findByLessorId(
    lessorId: string,
    options?: {
      direction?: FinanceDirection;
      status?: FinanceStatus;
      businessType?: BusinessType;
      startDate?: Date;
      endDate?: Date;
      skip?: number;
      take?: number;
    },
  ): Promise<[LessorFinanceEntity[], number]> {
    const where: FindOptionsWhere<LessorFinanceEntity> = { lessorId };

    if (options?.direction) {
      where.direction = options.direction;
    }

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.businessType) {
      where.businessType = options.businessType;
    }

    if (options?.startDate && options?.endDate) {
      where.businessOccurredAt = Between(options.startDate, options.endDate);
    } else if (options?.startDate) {
      where.businessOccurredAt = MoreThanOrEqual(options.startDate);
    } else if (options?.endDate) {
      where.businessOccurredAt = LessThanOrEqual(options.endDate);
    }

    return this.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * 根据订单 ID 查询财务记录
   */
  async findByOrderId(orderId: string): Promise<LessorFinanceEntity[]> {
    return this.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据订单 ID 查询待入账的订单租金收入记录（用于确认收货后批量确认入账）
   * 按创建时间升序，保证确认入账时 balanceAfter 链正确
   */
  async findPendingOrderRentByOrderId(orderId: string): Promise<LessorFinanceEntity[]> {
    return this.find({
      where: {
        orderId,
        status: FinanceStatus.PENDING,
        incomeType: FinanceIncomeType.ORDER_RENT,
      },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 根据支付 ID 查询财务记录
   */
  async findByPaymentId(paymentId: string): Promise<LessorFinanceEntity[]> {
    return this.find({
      where: { paymentId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据支付记录 ID 查询财务记录
   */
  async findByPaymentRecordId(paymentRecordId: string): Promise<LessorFinanceEntity[]> {
    return this.find({
      where: { paymentRecordId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据押金扣款 ID 查询财务记录
   */
  async findByDepositDeductionId(depositDeductionId: string): Promise<LessorFinanceEntity | null> {
    return this.findOne({
      where: { depositDeductionId },
    });
  }

  /**
   * 根据退款记录 ID 查询财务记录
   */
  async findByRefundRecordId(refundRecordId: string): Promise<LessorFinanceEntity[]> {
    return this.find({
      where: { refundRecordId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据提现记录 ID 查询财务记录
   */
  async findByWithdrawalRecordId(withdrawalRecordId: string): Promise<LessorFinanceEntity | null> {
    return this.findOne({
      where: { withdrawalRecordId },
    });
  }

  /**
   * 根据财务单号查询财务记录
   */
  async findByFinanceNo(financeNo: string): Promise<LessorFinanceEntity | null> {
    return this.findOne({
      where: { financeNo },
    });
  }

  /**
   * 计算出租方的可用余额（可提现余额）
   */
  async calculateAvailableBalance(lessorId: string): Promise<string> {
    const result = await this.createQueryBuilder('finance')
      .select('SUM(finance.amount)', 'total')
      .where('finance.lessorId = :lessorId', { lessorId })
      .andWhere('finance.direction = :direction', { direction: FinanceDirection.INCOME })
      .andWhere('finance.status = :status', { status: FinanceStatus.CONFIRMED })
      .andWhere('finance.affectAvailable = :affectAvailable', { affectAvailable: true })
      .getRawOne();

    return result?.total || '0.00';
  }

  /**
   * 计算出租方的累计收入，包含待入账金额
   */
  async calculateTotalIncome(lessorId: string): Promise<string> {
    const [incomeResult, expenseResult] = await Promise.all([
      this.createQueryBuilder('finance')
        .select('SUM(finance.amount)', 'total')
        .where('finance.lessorId = :lessorId', { lessorId })
        .andWhere('finance.direction = :direction', { direction: FinanceDirection.INCOME })
        // .andWhere('finance.status = :status', { status: FinanceStatus.CONFIRMED })
        .andWhere('finance.status IN (:...statuses)', { statuses: [FinanceStatus.CONFIRMED, FinanceStatus.PENDING] })
        .getRawOne(),
      this.calculateTotalExpense(lessorId, FinanceExpenseType.RENT_REFUND),
    ]);
    return new Decimal(incomeResult?.total || '0').minus(expenseResult).toString();
  }

  /**
   * 计算出租方的累计支出
   */
  async calculateTotalExpense(lessorId: string, expenseType?: FinanceExpenseType): Promise<string> {
    const qb = this.createQueryBuilder('finance')
      .select('SUM(finance.amount)', 'total')
      .where('finance.lessorId = :lessorId', { lessorId })
      .andWhere('finance.direction = :direction', { direction: FinanceDirection.EXPENSE })
      .andWhere('finance.status = :status', { status: FinanceStatus.CONFIRMED });

    if (expenseType) {
      qb.andWhere('finance.expenseType = :expenseType', { expenseType });
    }
    const result = await qb.getRawOne<{ total: string }>();
    return result?.total || '0.00';
  }

  /**
   * 计算出租方已入账收入金额（status=已入账 + flowStatus=已入账，用于可提现余额计算）
   * @param options.startDate 开始日期（按业务发生时间筛选）
   * @param options.endDate 结束日期（按业务发生时间筛选）
   */
  async calculateCreditedIncomeSum(lessorId: string, options?: { startDate?: Date; endDate?: Date }): Promise<string> {
    const qb = this.createQueryBuilder('finance')
      .select('COALESCE(SUM(finance.amount), 0)', 'total')
      .where('finance.lessorId = :lessorId', { lessorId })
      .andWhere('finance.direction = :direction', { direction: FinanceDirection.INCOME })
      .andWhere('finance.status = :status', { status: FinanceStatus.CONFIRMED })
      .andWhere('finance.flowStatus = :flowStatus', { flowStatus: FinanceFlowStatus.CREDITED });
    this.applyBusinessOccurredAtRange(qb, options);
    const result = await qb.getRawOne<{ total: string }>();
    return result?.total || '0.00';
  }

  /**
   * 计算出租方已退款租金金额（status=已入账 + flowStatus=已退款，用于可提现余额扣减）
   * @param options.startDate 开始日期（按业务发生时间筛选）
   * @param options.endDate 结束日期（按业务发生时间筛选）
   */
  async calculateRefundedRentRefundSum(
    lessorId: string,
    options?: { startDate?: Date; endDate?: Date },
  ): Promise<string> {
    const qb = this.createQueryBuilder('finance')
      .select('COALESCE(SUM(finance.amount), 0)', 'total')
      .where('finance.lessorId = :lessorId', { lessorId })
      .andWhere('finance.direction = :direction', { direction: FinanceDirection.EXPENSE })
      .andWhere('finance.expenseType = :expenseType', { expenseType: FinanceExpenseType.RENT_REFUND })
      .andWhere('finance.status = :status', { status: FinanceStatus.CONFIRMED })
      .andWhere('finance.flowStatus = :flowStatus', { flowStatus: FinanceFlowStatus.REFUNDED });
    this.applyBusinessOccurredAtRange(qb, options);
    const result = await qb.getRawOne<{ total: string }>();
    return result?.total || '0.00';
  }

  /**
   * 计算出租方已提现金额（flowStatus=已提现，用于累计结算与可提现余额）
   * @param options.startDate 开始日期（按业务发生时间筛选）
   * @param options.endDate 结束日期（按业务发生时间筛选）
   */
  async calculateWithdrawnSum(lessorId: string, options?: { startDate?: Date; endDate?: Date }): Promise<string> {
    const qb = this.createQueryBuilder('finance')
      .select('COALESCE(SUM(finance.amount), 0)', 'total')
      .where('finance.lessorId = :lessorId', { lessorId })
      .andWhere('finance.direction = :direction', { direction: FinanceDirection.EXPENSE })
      .andWhere('finance.expenseType = :expenseType', { expenseType: FinanceExpenseType.WITHDRAW })
      .andWhere('finance.flowStatus = :flowStatus', { flowStatus: FinanceFlowStatus.WITHDRAWN })
      .andWhere('finance.status = :status', { status: FinanceStatus.CONFIRMED });
    this.applyBusinessOccurredAtRange(qb, options);
    const result = await qb.getRawOne<{ total: string }>();
    return result?.total || '0.00';
  }

  /**
   * 计算出租方待入账金额（flowStatus=入账中/退款中 且 status=待入账 的净额，已取消的不计入）
   * 公式：入账中收入(CREDITING) - 退款中租金退款(REFUNDING)
   * @param options.startDate 开始日期（按业务发生时间筛选）
   * @param options.endDate 结束日期（按业务发生时间筛选）
   */
  async calculatePendingAmountByFlowStatus(
    lessorId: string,
    options?: { startDate?: Date; endDate?: Date },
  ): Promise<string> {
    const incomeQb = this.createQueryBuilder('finance')
      .select('COALESCE(SUM(finance.amount), 0)', 'total')
      .where('finance.lessorId = :lessorId', { lessorId })
      .andWhere('finance.direction = :direction', { direction: FinanceDirection.INCOME })
      .andWhere('finance.flowStatus = :flowStatus', { flowStatus: FinanceFlowStatus.CREDITING })
      .andWhere('finance.status = :status', { status: FinanceStatus.PENDING });
    this.applyBusinessOccurredAtRange(incomeQb, options);

    const refundQb = this.createQueryBuilder('finance')
      .select('COALESCE(SUM(finance.amount), 0)', 'total')
      .where('finance.lessorId = :lessorId', { lessorId })
      .andWhere('finance.direction = :direction', { direction: FinanceDirection.EXPENSE })
      .andWhere('finance.expenseType = :expenseType', { expenseType: FinanceExpenseType.RENT_REFUND })
      .andWhere('finance.flowStatus = :flowStatus', { flowStatus: FinanceFlowStatus.REFUNDING })
      .andWhere('finance.status = :status', { status: FinanceStatus.PENDING });
    this.applyBusinessOccurredAtRange(refundQb, options);

    const [incomeResult, refundResult] = await Promise.all([
      incomeQb.getRawOne<{ total: string }>(),
      refundQb.getRawOne<{ total: string }>(),
    ]);
    const income = new Decimal(incomeResult?.total || '0');
    const refund = new Decimal(refundResult?.total || '0');
    return income.minus(refund).toString();
  }

  /**
   * 获取最后一条财务记录的账后余额
   * @param lessorId 出租方 ID
   * @param options.excludeFinanceId 排除的财务记录 ID（同一事务内刚插入时传入，避免取到自身）
   * @param options.manager 传入时使用同一事务查询
   */
  async getLastBalanceAfter(
    lessorId: string,
    options?: { excludeFinanceId?: string; manager?: EntityManager },
  ): Promise<string | null> {
    const where: FindOptionsWhere<LessorFinanceEntity> = { lessorId };
    if (options?.excludeFinanceId) {
      where.id = Not(options.excludeFinanceId);
    }
    const repo = options?.manager ? options.manager.getRepository(LessorFinanceEntity) : this;
    const lastFinance = await repo.findOne({
      where,
      order: { createdAt: 'DESC' },
    });
    return lastFinance?.balanceAfter ?? null;
  }
}
