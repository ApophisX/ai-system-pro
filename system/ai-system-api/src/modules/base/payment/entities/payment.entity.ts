import { Entity, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import {
  InstallmentStatus,
  PaymentType,
  PaymentTypeLabels,
  RefundStatus,
  RefundStatusLabelMap,
  WithdrawalStatus,
  WithdrawalStatusLabelMap,
} from '../enums';
import { PaymentRecordEntity } from './payment-record.entity';
import { RefundRecordEntity } from './refund-record.entity';
import { WithdrawalRecordEntity } from './withdrawal-record.entity';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { RentalOrderEntity } from '@/modules/rental-order/entities';
import Decimal from 'decimal.js';
import dayjs from 'dayjs';
import { InstallmentStatusLabelMap } from '../constants';
import { calculateOverdueAmount } from '../utils';

/**
 * 支付实体
 *
 * 记录订单的支付信息，支持一次性支付和分期支付
 */
@Entity('payment')
@Index('IDX_payment_order_status', ['orderId', 'status'])
@Index('IDX_payment_user_status', ['userId', 'status'])
@Index('IDX_payment_status_refund', ['status', 'refundStatus'])
export class PaymentEntity extends BaseEntity {
  /**
   * 支付单号（唯一，业务标识）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    unique: true,
    comment: '支付单号（唯一，业务标识）',
  })
  paymentNo: string;

  /**
   * 订单 ID
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    comment: '订单 ID',
    nullable: true,
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
   * 用户 ID（支付方）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    comment: '用户 ID（支付方）',
    nullable: true,
  })
  @Index()
  userId: string;

  /**
   * 出租方 ID（承租方）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    comment: '出租方 ID',
    nullable: true,
  })
  lessorId: string;

  /**
   * 租金金额
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '租金金额',
    apiOptions: { type: 'number' },
  })
  rentalAmount: string;

  /**
   * 支付金额
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '支付金额，如果是第一笔支付，则包含平台服务费、运费',
    apiOptions: { type: 'number' },
  })
  amount: string;

  /**
   * 已支付金额
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '已支付金额',
    apiOptions: { type: 'number' },
  })
  paidAmount: string;

  /**
   * 逾期违约金
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '逾期违约金',
    apiOptions: { type: 'number' },
  })
  overduePenalty: string;

  /**
   * 逾期计时费用（单位：元/天）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '逾期计时费用（单位：元/天）',
    apiOptions: { type: 'number' },
  })
  overdueFee: string;

  @Expose()
  @ColumnWithApi({
    type: 'enum',
    enum: ['day', 'hour'],
    default: 'day',
    comment: '逾期计时费用单位',
  })
  overdueFeeUnit: 'day' | 'hour';

  /**
   * 优惠金额（出租方改价优惠）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '优惠金额（出租方改价优惠）',
    apiOptions: { type: 'number' },
  })
  discountAmount: string;

  /**
   * 第三方支付单号
   */
  @Expose()
  @ColumnWithApi({
    length: 100,
    nullable: true,
    comment: '第三方支付单号',
    optional: true,
  })
  thirdPartyPaymentNo?: string;

  /**
   * 支付回调数据（JSON）
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '支付回调数据（JSON）',
    optional: true,
  })
  callbackData?: Record<string, unknown>;

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
  failureReason?: string;

  // ====================================== 状态字段 ===========================================

  /**
   * 支付类型
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    default: PaymentType.RENTAL,
    comment:
      '支付类型：订单支付（order）/ 分期支付（installment）/ 押金支付（deposit）/ 租金支付（rental）/ 服务费支付（service_fee）/ 违约金支付（penalty）/ 逾期费用支付（overdue_fee）/ 续租支付（renewal）',
    apiOptions: {
      enum: PaymentType,
    },
  })
  paymentType: PaymentType;

  /**
   * 账单状态
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    default: InstallmentStatus.PENDING,
    length: 50,
    comment:
      '账单状态 pending（待支付）/ due（已到期）/ paid（已支付）/ overdue（逾期）/ canceled（已取消） / completed（已完成） / expired（已过期） / partial_completed（部分支付）',
    apiOptions: {
      enum: InstallmentStatus,
    },
  })
  status: InstallmentStatus;

  /**
   * 退款状态
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    default: RefundStatus.NONE,
    comment: '退款状态',
    apiOptions: {
      enum: RefundStatus,
    },
  })
  refundStatus: RefundStatus;

  /**
   * 提现状态
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    default: WithdrawalStatus.NONE,
    comment: '提现状态',
    apiOptions: {
      enum: WithdrawalStatus,
    },
  })
  withdrawalStatus: WithdrawalStatus;

  /**
   * 该账单是否逾期过（历史状态）
   */
  @Expose()
  @ColumnWithApi({
    type: 'boolean',
    default: false,
    comment: '该账单是否逾期过',
  })
  isOverdueHistory: boolean;

  /**
   * 是否是分期账单
   */
  @Expose()
  @ColumnWithApi({
    type: 'boolean',
    default: false,
    comment: '是否是分期账单',
    nullable: true,
  })
  isInstallment: boolean;

  /**
   * 是否是后付订单
   */
  @Expose()
  @ColumnWithApi({
    type: 'boolean',
    default: false,
    comment: '是否是后付订单',
  })
  isPostPayment: boolean;

  /**
   * 是否是商品购买支付
   */
  @Expose()
  @ColumnWithApi({
    type: 'boolean',
    default: false,
    comment: '是否是商品购买支付',
  })
  isProductPurchase: boolean;

  // ====================================== 时间字段 ===========================================

  /**
   * 逾期宽限期
   */
  @Expose()
  @ColumnWithApi({
    type: 'int',
    default: 0,
    comment: '逾期宽限期，分期订单逾期宽限期，非分期订单逾期宽限期为0',
  })
  gracePeriod: number;

  /**
   * 支付完成时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '支付完成时间',
    optional: true,
  })
  paidAt?: Date;

  /**
   * 开始时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '开始时间',
  })
  startTime: Date;

  /**
   * 结束时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '结束时间',
  })
  endTime: Date;

  /**
   * 应付时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '应付时间，如果是分期订单，则时间应该是当天最后时刻，例：2026-01-01 23:59:59',
  })
  payableTime: Date;

  /**
   * 退款时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '退款时间',
  })
  refundedAt?: Date;

  /**
   * 提现时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '提现时间',
  })
  withdrawnAt?: Date;

  // ====================================== 分期字段 ===========================================

  /**
   * 支付过期时间，续租订单特有，表示续租支付的截止时间，过了这个时间如果未支付则需要重新发起续租申请
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '续租支付过期时间，过了这个时间如果未支付则需要重新发起续租申请',
  })
  paymentExpireAt?: Date;

  /**
   * 续租信息，json duration userRemark
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '续租信息， 续租时长，续租时长单位，用户备注',
  })
  renewalInfo?: {
    duration: number;
    userRemark?: string;
  };

  // ====================================== 分期字段 ===========================================

  /**
   * 分期计划 ID（如果是分期支付）
   */
  @Expose()
  @ColumnWithApi({
    type: 'int',
    nullable: true,
    comment: '分期计划 ID（如果是分期支付）',
    optional: true,
  })
  installmentPlanId?: number;

  /**
   * 租赁分期期数（如果是分期支付）
   */
  @Expose()
  @ColumnWithApi({
    type: 'int',
    default: 1,
    comment: '分期期数（如果是分期支付）',
  })
  rentalPeriod: number;

  /**
   * 当前期数
   */
  @Expose()
  @ColumnWithApi({ type: 'int', default: 1, comment: '当前期数' })
  periodIndex: number;

  // ====================================== Relations ===========================================

  /**
   * 用户关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  /**
   * 支付记录关系（一对多）
   */
  @OneToMany(() => PaymentRecordEntity, record => record.payment, {
    cascade: true,
  })
  paymentRecords?: PaymentRecordEntity[];

  /**
   * 退款记录关系（一对多）
   */
  @OneToMany(() => RefundRecordEntity, record => record.payment, {
    cascade: true,
  })
  refundRecords?: RefundRecordEntity[];

  /**
   * 提现记录关系（一对多）
   */
  @OneToMany(() => WithdrawalRecordEntity, record => record.payment, {
    cascade: true,
  })
  withdrawalRecords?: WithdrawalRecordEntity[];

  /**
   * 订单关系（多对一）
   */
  @ManyToOne(() => RentalOrderEntity, order => order.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  rentalOrder?: RentalOrderEntity;

  // ====================================== Virtual Fields ===========================================

  /**
   * 状态标签
   */
  get statusLabel(): string {
    return InstallmentStatusLabelMap[this.status];
  }

  /**
   * 退款标签
   */
  get refundStatusLabel(): string {
    return RefundStatusLabelMap[this.refundStatus];
  }

  /**
   * 提现标签
   */
  get withdrawalStatusLabel(): string {
    return WithdrawalStatusLabelMap[this.withdrawalStatus];
  }

  /**
   * 是否已支付完成
   */
  get isPaid(): boolean {
    return this.status === InstallmentStatus.PAID;
  }

  /**
   * 是否部分支付
   */
  get isPartialPaid(): boolean {
    return this.status === InstallmentStatus.PARTIAL_PAID;
  }

  /**
   * 是否支付过，包好部分支付
   */
  get isPaidOrPartialPaid(): boolean {
    return this.status === InstallmentStatus.PAID || this.status === InstallmentStatus.PARTIAL_PAID;
  }

  /**
   * 是否已支付中
   */
  get isPending(): boolean {
    return this.status === InstallmentStatus.PENDING;
  }

  /**
   * 是否生成中
   */
  get isGenerating(): boolean {
    return this.status === InstallmentStatus.GENERATING;
  }

  /**
   * 是否已支付
   */
  get isCompleted(): boolean {
    return this.status === InstallmentStatus.COMPLETED;
  }

  /**
   * 是否已到期
   */
  get isDue(): boolean {
    return this.payableTime.getTime() <= new Date().getTime();
  }

  /**
   * 是否逾期
   */
  get isOverdue(): boolean {
    if (this.status === InstallmentStatus.OVERDUE) {
      return true;
    }
    if (this.status === InstallmentStatus.PARTIAL_PAID || this.status === InstallmentStatus.PENDING) {
      const graceEndTime = dayjs(this.payableTime).add(this.gracePeriod, 'day');
      return graceEndTime.isBefore(dayjs());
    }
    return false;
  }

  /**
   * 逾期时间(分钟)
   */
  get overdueMinutes(): number {
    const now = this.paidAt ? dayjs(this.paidAt) : dayjs();
    if (now.isAfter(this.payableTime)) {
      return Math.abs(now.diff(this.payableTime, 'minute'));
    }
    return 0;
  }

  /**
   * 应显示的逾期罚金（支付未完成前持续增加）
   */
  get overdueFineToDisplay(): number {
    return calculateOverdueAmount(this.overdueMinutes, this.overdueFee, this.overdueFeeUnit);
  }

  /**
   * 未支付逾期罚金
   * 按天计算：不足一天按一天计算
   * 按小时计算：不足半小时按半小时计算，超过半小时按一小时计算
   */
  get overdueAmount(): number {
    if (!this.isOverdue) {
      return 0;
    }
    return this.overdueFineToDisplay;
  }

  /**
   * 总应付金额（包含原始金额、逾期违约金和逾期罚金，减去优惠金额）
   * 公式：总应付金额 = 原始金额 + 逾期违约金 + 逾期罚金 - 优惠金额
   * 注意：优惠金额在此处扣除，确保金额计算的唯一来源
   * 订单层面汇总所有账单的 totalPayableAmount，确保金额一致性
   */
  get totalPayableAmount(): number {
    const total = new Decimal(this.amount || 0)
      .plus(this.overduePenalty || 0)
      .plus(this.overdueAmount || 0)
      .minus(this.discountAmount || 0);
    return total.greaterThan(0) ? total.toNumber() : 0;
  }

  /**
   * 未支付金额（包含逾期费用，已减去优惠金额）
   * 公式：未支付金额 = 总应付金额 - 已支付金额
   *       = (原始金额 + 逾期违约金 + 逾期罚金 - 优惠金额) - 已支付金额
   * 注意：确保金额计算的一致性，避免重复扣除或遗漏
   */
  get unpaidAmount(): number {
    const totalPayable = new Decimal(this.totalPayableAmount);
    const paid = new Decimal(this.paidAmount || 0);
    const unpaid = totalPayable.minus(paid).toNumber();
    return unpaid > 0 ? unpaid : 0;
  }

  /**
   * 是否可以提前支付，当前时间在开始和结束时间之间
   */
  get canPrepay(): boolean {
    const now = dayjs();
    if (this.isInstallment && this.isGenerating) {
      const condtion = now.isAfter(this.startTime) && now.isBefore(this.endTime);

      return this.isPostPayment ? condtion && this.periodIndex > 1 : condtion;
    }
    return false;
  }

  /**
   * 已退款金额
   */
  get refundedAmount(): number {
    const refundedRecords = this.getRefundedRecords();
    return refundedRecords.reduce((acc, next) => acc.plus(next.amount), new Decimal(0)).toNumber();
  }

  /**
   * 是否已全部退款
   */
  get isAllRefunded(): boolean {
    return this.refundedAmount >= new Decimal(this.paidAmount).toNumber();
  }

  /**
   * 已提现金额
   */
  get withdrawnAmount(): number {
    const withdrawnRecords = this.getWithdrawnRecords();
    return withdrawnRecords.reduce((acc, next) => acc.plus(next.amount), new Decimal(0)).toNumber();
  }

  /**
   * 是否已全部提现
   */
  get isAllWithdrawn(): boolean {
    return this.withdrawnAmount >= new Decimal(this.paidAmount).toNumber();
  }

  /**
   * 是否已提现（部分或全部）
   */
  get isWithdrawn(): boolean {
    return this.withdrawalStatus !== WithdrawalStatus.NONE && this.withdrawnAmount > 0;
  }

  /**
   * 逾期罚金单位标签
   */
  get overdueFeeUnitLabel(): string {
    return this.overdueFeeUnit === 'hour' ? '小时' : '天';
  }

  /**
   * 支付类型标签
   */
  get paymentTypeLabel(): string {
    const labelMap = PaymentTypeLabels as Partial<Record<PaymentType, string>>;
    return labelMap[this.paymentType] || this.paymentType;
  }

  // ====================================== Methods ===========================================
  /**
   * 获取已退款记录
   */
  getRefundedRecords(): RefundRecordEntity[] {
    return (this.refundRecords ?? []).filter(r => r.status === RefundStatus.COMPLETED);
  }

  /**
   * 获取已提现记录
   */
  getWithdrawnRecords(): WithdrawalRecordEntity[] {
    return (this.withdrawalRecords ?? []).filter(r => r.status === WithdrawalStatus.COMPLETED);
  }
}
