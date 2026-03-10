import { Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { ApiHideProperty } from '@nestjs/swagger';
import {
  FinanceDirection,
  FinanceDirectionLabelMap,
  FinanceIncomeType,
  FinanceIncomeTypeLabelMap,
  FinanceExpenseType,
  FinanceExpenseTypeLabelMap,
  FinanceStatus,
  FinanceStatusLabelMap,
  FinanceFlowStatus,
  FinanceFlowStatusLabelMap,
  Currency,
  CurrencyLabelMap,
  BusinessType,
  BusinessTypeLabelMap,
  getBusinessTypeByIncomeType,
  getBusinessTypeByExpenseType,
} from '../enums';
import { IsValidFinanceDirection } from '../validators/finance-direction-validator';
import { ValidateIf, IsNotEmpty } from 'class-validator';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import { RentalOrderEntity } from '@/modules/rental-order/entities/rental-order.entity';
import { PaymentEntity } from '@/modules/base/payment/entities/payment.entity';
import { PaymentRecordEntity } from '@/modules/base/payment/entities/payment-record.entity';
import { DepositDeductionEntity } from '@/modules/rental-order/entities/deposit-deduction.entity';
import { RefundRecordEntity } from '@/modules/base/payment/entities/refund-record.entity';
import { WithdrawalRecordEntity } from '@/modules/base/payment/entities/withdrawal-record.entity';

/**
 * 出租方财务明细账实体
 *
 * 记录出租方的所有收入/支出明细，用于财务对账和资金流追踪
 * 特征：不可变记录、可审计、可追溯业务来源
 */
@Entity('lessor_finance')
@Index('IDX_lessor_finance_lessor_status', ['lessorId', 'status'])
@Index('IDX_lessor_finance_lessor_direction', ['lessorId', 'direction'])
@Index('IDX_lessor_finance_lessor_business', ['lessorId', 'businessType'])
export class LessorFinanceEntity extends BaseEntity {
  /**
   * 财务单号（唯一，业务标识）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    unique: true,
    comment: '财务单号（唯一，业务标识）',
  })
  financeNo: string;

  /**
   * 出租方 ID
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    comment: '出租方 ID',
    nullable: true,
  })
  @Index()
  lessorId: string;

  /**
   * 承租方 ID（冗余字段，便于查询）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    comment: '承租方 ID',
    nullable: true,
  })
  lesseeId: string;

  /**
   * 账务方向：收入 / 支出
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    comment: '账务方向：income（收入）/ expense（支出）',
    apiOptions: {
      enum: FinanceDirection,
    },
  })
  @IsValidFinanceDirection({ message: '账务方向和类型不匹配' })
  direction: FinanceDirection;

  /**
   * 收入类型（当 direction = INCOME 时必填）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment:
      '收入类型：order_rent（订单租金收入）/ deposit_deduct（押金扣款收入）/ late_fee（逾期费用收入）/ breach_fee（违约费用收入）/ compensation（赔偿收入）',
    optional: true,
    apiOptions: {
      enum: FinanceIncomeType,
    },
  })
  @ValidateIf((o: LessorFinanceEntity) => o.direction === FinanceDirection.INCOME)
  @IsNotEmpty({ message: '收入类型不能为空' })
  incomeType?: FinanceIncomeType;

  /**
   * 支出类型（当 direction = EXPENSE 时必填）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '支出类型：rent_refund（租金退款）/ withdraw（提现支出）',
    optional: true,
    apiOptions: {
      enum: FinanceExpenseType,
    },
  })
  @ValidateIf((o: LessorFinanceEntity) => o.direction === FinanceDirection.EXPENSE)
  @IsNotEmpty({ message: '支出类型不能为空' })
  expenseType?: FinanceExpenseType;

  /**
   * 账务状态（账务视角）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    default: FinanceStatus.PENDING,
    comment: '账务状态：pending（待入账）/ confirmed（已入账）/ reversed（已冲正）/ cancelled（已取消）',
    apiOptions: {
      enum: FinanceStatus,
    },
  })
  status: FinanceStatus;

  /**
   * 资金流状态（前端展示用）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment:
      '资金流状态：crediting（入账中）/ credited（已入账）/ refunding（退款中）/ refunded（已退款）/ withdrawing（提现中）/ withdrawn（已提现）',
    optional: true,
    apiOptions: {
      enum: FinanceFlowStatus,
    },
  })
  flowStatus?: FinanceFlowStatus;

  /**
   * 币种
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 10,
    default: Currency.CNY,
    comment:
      '币种：CNY（人民币）/ USD（美元）/ EUR（欧元）/ JPY（日元）/ HKD（港币）/ GBP（英镑）/ BTC（比特币）/ ETH（以太坊）',
    apiOptions: {
      enum: Currency,
    },
  })
  currency: Currency;

  /**
   * 金额（根据币种单位）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '金额（根据币种单位）',
    apiOptions: { type: 'number' },
  })
  amount: string;

  /**
   * 账后余额快照（本条财务记录入账后的出租方可用余额）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    comment: '账后余额快照（本条财务记录入账后的出租方可用余额，用于历史对账、审计、快速计算）',
    optional: true,
    apiOptions: { type: 'number' },
  })
  balanceAfter?: string;

  /**
   * 可用余额影响标识（标识该记录是否影响"可提现余额"）
   */
  @Expose()
  @ColumnWithApi({
    type: 'boolean',
    default: false,
    comment: '可用余额影响标识：true（影响可提现余额，如已确认收入、提现）/ false（不影响，如待入账收入）',
  })
  affectAvailable: boolean;

  /**
   * 平台服务费金额（预留字段，用于平台抽成/服务费）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    nullable: true,
    comment: '平台服务费金额（预留字段，用于平台抽成/服务费）',
  })
  platformFeeAmount: string;

  /**
   * 平台服务费率（预留字段，用于平台抽成/服务费，单位：百分比，如 5.5 表示 5.5%）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: '平台服务费率（预留字段，单位：百分比，如 5.5 表示 5.5%）',
  })
  platformFeeRate: string;

  // ====================================== 关联业务标识 ===========================================

  /**
   * 订单 ID
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    nullable: true,
    comment: '订单 ID',
    optional: true,
  })
  @Index()
  orderId?: string;

  /**
   * 订单号（冗余字段，便于查询）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    nullable: true,
    comment: '订单号（冗余字段）',
    optional: true,
  })
  orderNo?: string;

  /**
   * 账单 ID（Payment）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    nullable: true,
    comment: '账单 ID（Payment）',
    optional: true,
  })
  @Index()
  paymentId?: string;

  /**
   * 账单号（冗余字段）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    nullable: true,
    comment: '账单号（冗余字段）',
    optional: true,
  })
  paymentNo?: string;

  /**
   * 账单支付记录 ID（PaymentRecord）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    nullable: true,
    comment: '账单支付记录 ID（PaymentRecord）',
    optional: true,
  })
  @Index()
  paymentRecordId?: string;

  /**
   * 账单支付记录号（冗余字段）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    nullable: true,
    comment: '账单支付记录号（冗余字段）',
    optional: true,
  })
  paymentRecordNo?: string;

  /**
   * 押金扣款记录 ID（DepositDeduction）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    nullable: true,
    comment: '押金扣款记录 ID（DepositDeduction）',
    optional: true,
  })
  @Index()
  depositDeductionId?: string;

  /**
   * 押金扣款单号（冗余字段）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    nullable: true,
    comment: '押金扣款单号（冗余字段）',
    optional: true,
  })
  deductionNo?: string;

  /**
   * 退款单 ID（RefundRecord）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    nullable: true,
    comment: '退款单 ID（RefundRecord）',
    optional: true,
  })
  @Index()
  refundRecordId?: string;

  /**
   * 退款单号（冗余字段）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    nullable: true,
    comment: '退款单号（冗余字段）',
    optional: true,
  })
  refundNo?: string;

  /**
   * 提现单 ID（WithdrawalRecord）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    nullable: true,
    comment: '提现单 ID（WithdrawalRecord）',
    optional: true,
  })
  @Index()
  withdrawalRecordId?: string;

  /**
   * 提现单号（冗余字段）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    nullable: true,
    comment: '提现单号（冗余字段）',
    optional: true,
  })
  withdrawalNo?: string;

  // ====================================== 时间字段 ===========================================

  /**
   * 入账时间（确认入账的时间）
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '入账时间（确认入账的时间）',
    optional: true,
  })
  confirmedAt?: Date;

  /**
   * 冲正时间（发生冲正的时间）
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '冲正时间（发生冲正的时间）',
    optional: true,
  })
  reversedAt?: Date;

  /**
   * 业务发生时间（业务实际发生的时间，如订单支付时间、扣款时间等）
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '业务发生时间（业务实际发生的时间）',
    optional: true,
  })
  businessOccurredAt?: Date;

  // ====================================== 其他字段 ===========================================

  /**
   * 冲正原因
   */
  @Expose()
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    comment: '冲正原因',
    optional: true,
  })
  reverseReason?: string;

  /**
   * 原始财务记录 ID（如果本条记录被冲正，则在原始记录中标记）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    nullable: true,
    comment: '原始财务记录 ID（如果本条记录被冲正，则在原始记录中标记，用于快速判断是否已被冲正）',
    optional: true,
  })
  @Index()
  originalFinanceId?: string;

  /**
   * 原始财务记录单号（冗余字段）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    nullable: true,
    comment: '原始财务记录单号（冗余字段）',
    optional: true,
  })
  originalFinanceNo?: string;

  /**
   * 关联的冲正记录 ID（如果本条记录是冲正记录，则关联被冲正的记录）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    nullable: true,
    comment: '关联的冲正记录 ID（如果本条记录是冲正记录，则关联被冲正的记录）',
    optional: true,
  })
  @Index()
  reversedFinanceId?: string;

  /**
   * 关联的冲正记录单号（冗余字段）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    nullable: true,
    comment: '关联的冲正记录单号（冗余字段）',
    optional: true,
  })
  reversedFinanceNo?: string;

  /**
   * 业务大类（用于统计 / 报表）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment:
      '业务大类：ORDER（订单相关）/ DEPOSIT（押金相关）/ PENALTY（罚金相关）/ COMPENSATION（赔偿相关）/ WITHDRAW（提现相关）',
    optional: true,
    apiOptions: {
      enum: BusinessType,
    },
  })
  businessType?: BusinessType;

  // ====================================== Relations ===========================================

  /**
   * 出租方关系（多对一）
   */
  @ApiHideProperty()
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessor_id' })
  lessor?: UserEntity;

  /**
   * 订单关系（多对一）
   */
  @ApiHideProperty()
  @ManyToOne(() => RentalOrderEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_id' })
  order?: RentalOrderEntity;

  /**
   * 账单关系（多对一）
   */
  @ApiHideProperty()
  @ManyToOne(() => PaymentEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'payment_id' })
  payment?: PaymentEntity;

  /**
   * 账单支付记录关系（多对一）
   */
  @ApiHideProperty()
  @ManyToOne(() => PaymentRecordEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'payment_record_id' })
  paymentRecord?: PaymentRecordEntity;

  /**
   * 押金扣款记录关系（多对一）
   */
  @ApiHideProperty()
  @ManyToOne(() => DepositDeductionEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deposit_deduction_id' })
  depositDeduction?: DepositDeductionEntity;

  /**
   * 退款记录关系（多对一）
   */
  @ApiHideProperty()
  @ManyToOne(() => RefundRecordEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'refund_record_id' })
  refundRecord?: RefundRecordEntity;

  /**
   * 提现记录关系（多对一）
   */
  @ApiHideProperty()
  @ManyToOne(() => WithdrawalRecordEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'withdrawal_record_id' })
  withdrawalRecord?: WithdrawalRecordEntity;

  /**
   * 原始财务记录关系（多对一，如果本条记录被冲正，则关联原始记录）
   */
  @ApiHideProperty()
  @ManyToOne(() => LessorFinanceEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'original_finance_id' })
  originalFinance?: LessorFinanceEntity;

  /**
   * 关联的冲正记录关系（多对一，如果本条记录是冲正记录，则关联被冲正的记录）
   */
  @ApiHideProperty()
  @ManyToOne(() => LessorFinanceEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reversed_finance_id' })
  reversedFinance?: LessorFinanceEntity;

  // ====================================== Virtual Fields ===========================================

  /**
   * 账务方向标签
   */
  get directionLabel(): string {
    return this.direction ? FinanceDirectionLabelMap[this.direction] : '';
  }

  /**
   * 收入类型标签
   */
  get incomeTypeLabel(): string {
    return this.incomeType ? FinanceIncomeTypeLabelMap[this.incomeType] : '';
  }

  /**
   * 支出类型标签
   */
  get expenseTypeLabel(): string {
    return this.expenseType ? FinanceExpenseTypeLabelMap[this.expenseType] : '';
  }

  /**
   * 账务状态标签
   */
  get statusLabel(): string {
    return this.status ? FinanceStatusLabelMap[this.status] : '';
  }

  /**
   * 资金流状态标签
   */
  get flowStatusLabel(): string {
    return this.flowStatus ? FinanceFlowStatusLabelMap[this.flowStatus] : '';
  }

  /**
   * 币种标签
   */
  get currencyLabel(): string {
    return this.currency ? CurrencyLabelMap[this.currency] : '';
  }

  /**
   * 业务大类标签
   */
  get businessTypeLabel(): string {
    return this.businessType ? BusinessTypeLabelMap[this.businessType] : '';
  }

  /**
   * 是否已被冲正
   */
  get isReversedByOther(): boolean {
    return !!this.originalFinanceId;
  }

  /**
   * 自动推导业务大类（如果未设置）
   */
  deriveBusinessType(): BusinessType | undefined {
    if (this.businessType) {
      return this.businessType;
    }

    if (this.direction === FinanceDirection.INCOME && this.incomeType) {
      return getBusinessTypeByIncomeType(this.incomeType);
    }

    if (this.direction === FinanceDirection.EXPENSE && this.expenseType) {
      return getBusinessTypeByExpenseType(this.expenseType);
    }

    return undefined;
  }

  /**
   * 是否为收入
   */
  get isIncome(): boolean {
    return this.direction === FinanceDirection.INCOME;
  }

  /**
   * 是否为支出
   */
  get isExpense(): boolean {
    return this.direction === FinanceDirection.EXPENSE;
  }

  /**
   * 是否已确认入账
   */
  get isConfirmed(): boolean {
    return this.status === FinanceStatus.CONFIRMED;
  }

  /**
   * 是否已取消
   */
  get isCancelled(): boolean {
    return this.status === FinanceStatus.CANCELLED;
  }

  /**
   * 是否已冲正
   */
  get isReversed(): boolean {
    return this.status === FinanceStatus.REVERSED;
  }

  /**
   * 是否待入账
   */
  get isPending(): boolean {
    return this.status === FinanceStatus.PENDING;
  }
}
