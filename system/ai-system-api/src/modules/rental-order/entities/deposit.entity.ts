import { Entity, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import { RentalOrderEntity } from './rental-order.entity';
import { DepositDeductionEntity } from './deposit-deduction.entity';
import { DepositStatus, DepositFreeType, DepositDeductionStatus } from '../enums';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { DepositStatusLabelMap } from '../enums/deposit-status.enum';
import { PaymentProvider } from '@/modules/base/payment/enums';
import Decimal from 'decimal.js';

/**
 * 押金实体
 *
 * 一个订单对应一笔押金
 * 押金可以支持免押（支付宝免押、微信免押）
 */
@Entity('deposit')
@Index('IDX_deposit_user_status', ['userId', 'status'])
@Index('IDX_deposit_order_status', ['orderId', 'status'])
export class DepositEntity extends BaseEntity {
  /**
   * 押金单号（唯一，业务标识）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    unique: true,
    comment: '押金单号（唯一，业务标识）',
  })
  depositNo: string;

  /**
   * 订单 ID
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    comment: '订单 ID',
  })
  @Index()
  orderId: string;

  /**
   * 订单号（冗余字段，便于查询）
   */
  @Expose()
  @ColumnWithApi({ length: 50, comment: '订单号' })
  orderNo: string;

  /**
   * 用户 ID（承租方）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    comment: '用户 ID（承租方）',
    nullable: true,
  })
  @Index()
  userId: string;

  /**
   * 出租方 ID
   */
  @Expose()
  @ColumnWithApi({ type: 'uuid', length: 50, comment: '出租方 ID', nullable: true })
  lessorId: string;

  /**
   * 押金金额（元）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '押金金额（元）',
  })
  amount: number;

  /**
   * 已扣除金额（元）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '已扣除金额（元）',
  })
  deductedAmount: number;

  /**
   * 剩余金额（元）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '剩余金额（元）',
  })
  remainingAmount: number;

  /**
   * 免押类型
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    default: DepositFreeType.NONE,
    comment: '免押类型：none（无免押，现金支付押金）/ alipay（支付宝免押）/ wechat（微信免押）',
    apiOptions: {
      enum: DepositFreeType,
    },
  })
  freeType: DepositFreeType;

  /**
   * 免押授权号（第三方免押授权号）
   */
  @Expose()
  @ColumnWithApi({
    length: 100,
    nullable: true,
    comment: '免押授权号（第三方免押授权号）',
    optional: true,
  })
  freeAuthNo?: string;

  /**
   * 免押授权数据（JSON，存储第三方返回的授权信息）
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '免押授权数据（JSON）',
    optional: true,
  })
  freeAuthData?: Record<string, unknown>;

  /**
   * 支付方式（如果使用支付方式，alipay/wechat）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '支付方式（alipay/wechat）',
    optional: true,
    apiOptions: {
      enum: PaymentProvider,
    },
  })
  paymentProvider?: PaymentProvider;

  /**
   * 第三方支付单号（如果使用支付方式）
   */
  @Expose()
  @ColumnWithApi({
    length: 100,
    nullable: true,
    comment: '第三方支付单号（如果使用支付方式）',
    optional: true,
  })
  thirdPartyPaymentNo?: string;

  /**
   * 退款单号
   */
  @Expose()
  @ColumnWithApi({
    length: 100,
    nullable: true,
    comment: '退款单号',
    optional: true,
  })
  refundNo?: string;

  /**
   * 三方退款单号（如果使用退款方式）
   */
  @Expose()
  @ColumnWithApi({
    length: 100,
    nullable: true,
    comment: '三方退款单号（如果使用退款方式）',
    optional: true,
  })
  thirdPartyRefundNo?: string;

  /**
   * 支付回调数据（JSON，存储第三方返回的支付信息）
   */
  @Exclude()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '支付回调数据（JSON）',
    optional: true,
  })
  paymentCallbackData?: Record<string, any>;

  /**
   * 退款回调数据（JSON，存储第三方返回的退款信息）
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '退款回调数据（JSON）',
    optional: true,
  })
  refundCallbackData?: Record<string, any>;

  /**
   * 支付失败原因
   */
  @Expose()
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    comment: '支付失败原因',
    optional: true,
  })
  paymentFailureReason?: string;

  /**
   * 押金状态
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    default: DepositStatus.PENDING,
    comment: '押金状态',
    apiOptions: {
      enum: DepositStatus,
      description:
        'pending（待支付）/ frozen（已冻结）/ partial_deducted（部分扣除）/ fully_deducted（已全部扣除）/ unfrozen（已解冻）/ returned（已退还）/ canceled（已取消）/ none（无押金）/ failed（冻结失败或支付失败）/ refunding（退款/解冻中）',
    },
  })
  status: DepositStatus;

  /**
   * 冻结时间（支付完成时间或免押授权时间）
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '冻结时间（支付完成时间或免押授权时间）',
    optional: true,
  })
  frozenAt?: Date;

  /**
   * 解冻时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '解冻时间，解冻或退还押金成功的时间',
    optional: true,
  })
  unfrozenAt?: Date;

  // ====================================== Relations ===========================================

  /**
   * 订单关系（多对一）
   */
  @ManyToOne(() => RentalOrderEntity, order => order.deposits, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  rentalOrder?: RentalOrderEntity;

  /**
   * 用户关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  /**
   * 扣款记录关系（一对多）
   */
  @OneToMany(() => DepositDeductionEntity, deduction => deduction.deposit, {
    cascade: true,
  })
  deductions?: DepositDeductionEntity[];

  // ====================================== Virtual Fields ===========================================

  /**
   * 状态标签
   */
  get statusLabel(): string {
    return DepositStatusLabelMap[this.status];
  }

  /**
   * 是否已冻结
   */
  get isFrozen(): boolean {
    return this.status === DepositStatus.FROZEN;
  }

  /**
   * 是否已解冻
   */
  get isUnfrozen(): boolean {
    return this.status === DepositStatus.UNFROZEN;
  }

  /**
   * 是否已全部扣除
   */
  get isFullyDeducted(): boolean {
    return this.status === DepositStatus.FULLY_DEDUCTED;
  }

  /**
   * 是否支持免押
   */
  get isFreeDeposit(): boolean {
    return this.freeType === DepositFreeType.ALIPAY || this.freeType === DepositFreeType.WECHAT;
  }

  /**
   * 可扣除金额
   */
  get availableDeductAmount(): number {
    return new Decimal(this.amount).minus(this.deductedAmount).toNumber();
  }

  /**
   * 是否已支付或已冻结
   */
  get isPaidOrFree(): boolean {
    return (
      this.status === DepositStatus.PAID ||
      this.status === DepositStatus.FROZEN ||
      this.status === DepositStatus.PARTIAL_DEDUCTED
    );
  }

  /**
   * 扣款记录列表
   */
  get deductionList() {
    return this.deductions || [];
  }

  /**
   * 已执行的扣款记录列表
   */
  get executedList() {
    return this.deductionList.filter(d => d.status === DepositDeductionStatus.EXECUTED);
  }

  /**
   * 已执行的扣款记录数量
   */
  get executedCount(): number {
    return this.executedList.length;
  }

  /**
   * 获取进行中的扣款记录数量
   */
  get inProgressCount(): number {
    return this.deductionList.filter(d =>
      [DepositDeductionStatus.PENDING_USER_CONFIRM, DepositDeductionStatus.PENDING_AUDIT].includes(d.status),
    ).length;
  }

  // ====================================== Helper Methods ===========================================

  /**
   * 获取正在执行或已执行的扣款记录总金额
   */
  getExecutingOrExecutedDeductionsTotalAmount(): Decimal {
    const list = this.getExecutingOrExecutedDeductionsList();
    return list.reduce((sum, d) => sum.plus(d.amount), new Decimal(0));
  }

  /**
   * 正在执行或已执行的扣款记录列表
   */
  getExecutingOrExecutedDeductionsList() {
    return this.deductionList.filter(
      d =>
        d.status === DepositDeductionStatus.EXECUTED ||
        d.status === DepositDeductionStatus.PLATFORM_APPROVED ||
        d.status === DepositDeductionStatus.PENDING_AUDIT ||
        d.status === DepositDeductionStatus.PENDING_USER_CONFIRM,
    );
  }
}
