import { Entity, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { PaymentEntity } from './payment.entity';
import {
  PaymentProvider,
  PaymentStatus,
  PaymentStatusLabel,
  PaymentType,
  RefundStatus,
  RefundStatusLabelMap,
  WithdrawalStatus,
  WithdrawalStatusLabelMap,
} from '../enums';
import { ApiHideProperty } from '@nestjs/swagger';
import dayjs from 'dayjs';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { RefundRecordEntity } from './refund-record.entity';
import { WithdrawalRecordEntity } from './withdrawal-record.entity';

/**
 * 支付记录实体
 *
 * 记录每次支付操作的详细信息，用于追溯和审计
 * 所有金额交易都需要记录
 */
@Entity('payment_records')
@Index('IDX_payment_record_order_status', ['orderId', 'status'])
@Index('IDX_payment_record_payment_status', ['paymentId', 'status'])
export class PaymentRecordEntity extends BaseEntity {
  /**
   * 支付记录单号（唯一，业务标识）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    unique: true,
    comment: '支付记录单号（唯一，业务标识）',
  })
  recordNo: string;

  /**
   * 支付 ID（逾期费支付时可为空，无关联租金账单）
   */
  @Expose()
  @ColumnWithApi({ type: 'uuid', length: 50, comment: '支付 ID', nullable: true, optional: true })
  @Index()
  paymentId?: string | null;

  /**
   * 支付单号（冗余字段；逾期费支付时可为业务单号如 OF-订单号）
   */
  @Expose()
  @ColumnWithApi({ type: 'varchar', length: 50, comment: '支付单号', nullable: true, optional: true })
  paymentNo?: string | null;

  /**
   * 订单 ID
   */
  @Expose()
  @ColumnWithApi({ type: 'uuid', length: 50, comment: '订单 ID' })
  @Index()
  orderId: string;

  /**
   * 订单号（冗余字段）
   */
  @Expose()
  @ColumnWithApi({ length: 50, comment: '订单号' })
  orderNo: string;

  /**
   * 用户 ID（支付方）
   */
  @Expose()
  @ColumnWithApi({ type: 'uuid', length: 50, comment: '用户 ID（支付方）' })
  userId: string;

  /**
   * 出租方 ID
   */
  @Expose()
  @ColumnWithApi({ type: 'uuid', length: 50, comment: '出租方 ID', nullable: true })
  lessorId: string;

  /**
   * 支付提供商
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    comment: '支付提供商',
    apiOptions: { enum: PaymentProvider },
  })
  provider: PaymentProvider;

  /**
   * 支付状态
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    comment: '支付状态',
    apiOptions: { enum: PaymentStatus },
  })
  status: PaymentStatus;

  /**
   * 退款状态
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    comment: '退款状态',
    nullable: true,
    optional: true,
    apiOptions: { enum: RefundStatus },
  })
  refundStatus?: RefundStatus;

  /**
   * 提现状态
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    comment: '提现状态',
    nullable: true,
    optional: true,
    apiOptions: { enum: WithdrawalStatus },
  })
  withdrawalStatus?: WithdrawalStatus;

  /**
   * 支付金额
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '支付金额',
    apiOptions: { type: 'number' },
  })
  amount: string;

  /**
   * 第三方支付单号
   */
  @Expose()
  @ColumnWithApi({ length: 100, nullable: true, comment: '第三方支付单号', optional: true })
  thirdPartyPaymentNo?: string;

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

  /**
   * 支付过期时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '支付过期时间',
    optional: true,
  })
  expiredAt?: Date;

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
  callbackData?: Record<string, any>;

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

  /**
   * 支付类型 租金/违约金/逾期费用
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    comment:
      '支付类型： 订单支付（order）/ 分期支付（installment）/ 押金支付（deposit）/ 租金支付（rental）/ 服务费支付（service_fee）/ 违约金支付（penalty）/ 逾期费用支付（overdue_fee）',
    nullable: true,
    default: PaymentType.RENTAL,
  })
  paymentType: PaymentType;

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

  // ====================================== Relations ===========================================

  /**
   * 支付关系（多对一）
   */
  @ApiHideProperty()
  @ManyToOne(() => PaymentEntity, payment => payment.paymentRecords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_id' })
  payment?: PaymentEntity;

  /**
   * 退款记录关系（一对多）
   */
  @ApiHideProperty()
  @OneToMany(() => RefundRecordEntity, refundRecord => refundRecord.paymentRecord, {
    cascade: true,
  })
  refundRecords?: RefundRecordEntity[];

  /**
   * 提现记录关系（一对多）
   */
  @ApiHideProperty()
  @OneToMany(() => WithdrawalRecordEntity, withdrawalRecord => withdrawalRecord.paymentRecord, {
    cascade: true,
  })
  withdrawalRecords?: WithdrawalRecordEntity[];

  // ====================================== Virtual Fields ===========================================

  /**
   * 是否过期
   */
  get isExpired(): boolean {
    return this.expiredAt ? dayjs().isAfter(this.expiredAt) : false;
  }

  /**
   * 支付状态标签
   */
  get statusLabel(): string {
    return PaymentStatusLabel[this.status];
  }

  /**
   * 退款状态标签
   */
  get refundStatusLabel(): string {
    return this.refundStatus ? RefundStatusLabelMap[this.refundStatus] : '';
  }

  /**
   * 提现状态标签
   */
  get withdrawalStatusLabel(): string {
    return this.withdrawalStatus ? WithdrawalStatusLabelMap[this.withdrawalStatus] : '';
  }
}
