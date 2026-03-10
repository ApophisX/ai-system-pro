import { Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { PaymentEntity } from './payment.entity';
import { PaymentProvider, RefundStatus, RefundStatusLabelMap } from '../enums';
import { ApiHideProperty } from '@nestjs/swagger';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { PaymentRecordEntity } from './payment-record.entity';

/**
 * 退款记录实体
 *
 * 记录每次退款操作的详细信息，用于追溯和审计
 */
@Entity('refund_records')
@Index('IDX_refund_record_order_status', ['orderId', 'status'])
@Index('IDX_refund_record_payment_status', ['paymentId', 'status'])
export class RefundRecordEntity extends BaseEntity {
  /**
   * 退款单号（唯一，业务标识）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    unique: true,
    comment: '退款单号（唯一，业务标识）',
  })
  refundNo: string;

  /**
   * 账单 ID
   */
  @Expose()
  @ColumnWithApi({ type: 'uuid', length: 50, comment: '支付 ID', nullable: true })
  @Index()
  paymentId: string;

  /**
   * 账单支付单号（冗余字段）
   */
  @Expose()
  @ColumnWithApi({ length: 50, comment: '支付单号', nullable: true })
  paymentNo: string;

  /**
   * 账单支付记录 ID
   */
  @Expose()
  @ColumnWithApi({ type: 'uuid', length: 50, comment: '账单支付记录 ID' })
  @Index()
  paymentRecordId: string;

  /**
   * 账单支付记录号（冗余字段）
   */
  @Expose()
  @ColumnWithApi({ length: 50, comment: '账单支付记录号' })
  paymentRecordNo: string;

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
   * 用户 ID（退款接收方）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    comment: '用户 ID（退款接收方）',
  })
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
    default: PaymentProvider.WECHAT,
    nullable: true,
    apiOptions: { enum: PaymentProvider },
    comment: '支付提供商',
  })
  provider: PaymentProvider;

  /**
   * 退款状态
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    default: RefundStatus.NONE,
    nullable: true,
    comment: '退款状态',
    apiOptions: { enum: RefundStatus },
  })
  status: RefundStatus;

  /**
   * 退款金额（元）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '退款金额（元）',
    apiOptions: { type: 'number' },
  })
  amount: string;

  /**
   * 退款原因
   */
  @Expose()
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    comment: '退款原因',
    optional: true,
  })
  reason?: string;

  /**
   * 第三方退款单号
   */
  @Expose()
  @ColumnWithApi({ length: 100, nullable: true, comment: '第三方退款单号', optional: true })
  thirdPartyRefundNo?: string;

  /**
   * 退款完成时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    optional: true,
    comment: '退款完成时间',
  })
  refundedAt?: Date;

  /**
   * 退款回调数据（JSON）
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    optional: true,
    comment: '退款回调数据（JSON）',
  })
  callbackData?: Record<string, any>;

  /**
   * 退款失败原因
   */
  @Expose()
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    optional: true,
    comment: '退款失败原因',
  })
  failureReason?: string;

  // ====================================== Relations ===========================================

  /**
   * 支付关系（多对一）
   */
  @ApiHideProperty()
  @ManyToOne(() => PaymentEntity, payment => payment.refundRecords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_id' })
  payment?: PaymentEntity;

  /**
   * 账单支付记录关系（多对一）
   */
  @ApiHideProperty()
  @ManyToOne(() => PaymentRecordEntity, paymentRecord => paymentRecord.refundRecords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_record_id' })
  paymentRecord?: PaymentRecordEntity;

  // ====================================== Virtual Fields ===========================================

  /**
   * 退款状态标签
   */
  get statusLabel(): string {
    return this.status ? RefundStatusLabelMap[this.status] : '';
  }
}
