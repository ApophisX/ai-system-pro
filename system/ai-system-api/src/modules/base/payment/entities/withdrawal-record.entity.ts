import { Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { PaymentEntity } from './payment.entity';
import { PaymentProvider, WithdrawalStatus, WithdrawalStatusLabelMap } from '../enums';
import { ApiHideProperty } from '@nestjs/swagger';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { PaymentRecordEntity } from './payment-record.entity';
import { UserEntity } from '@/modules/base/user/entities/user.entity';

/**
 * 提现记录实体
 *
 * 记录每次提现操作的详细信息，用于追溯和审计
 * 出租方从平台提现已结算的资金
 */
@Entity('withdrawal_records')
@Index('IDX_withdrawal_record_user_status', ['userId', 'status'])
@Index('IDX_withdrawal_record_order_status', ['orderId', 'status'])
export class WithdrawalRecordEntity extends BaseEntity {
  /**
   * 提现单号（唯一，业务标识）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    unique: true,
    comment: '提现单号（唯一，业务标识）',
  })
  withdrawalNo: string;

  /**
   * 账单 ID
   */
  @Expose()
  @ColumnWithApi({ type: 'uuid', length: 50, comment: '支付 ID' })
  @Index()
  paymentId: string;

  /**
   * 账单支付单号（冗余字段）
   */
  @Expose()
  @ColumnWithApi({ length: 50, comment: '支付单号' })
  paymentNo: string;

  /**
   * 账单支付记录 ID（可选，如果是对单笔支付记录提现）
   */
  @Expose()
  @ColumnWithApi({ type: 'uuid', length: 50, nullable: true, comment: '账单支付记录 ID', optional: true })
  paymentRecordId?: string;

  /**
   * 账单支付记录号（冗余字段）
   */
  @Expose()
  @ColumnWithApi({ length: 50, nullable: true, comment: '账单支付记录号', optional: true })
  paymentRecordNo?: string;

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
   * 用户 ID（提现方，出租方）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    comment: '用户 ID（提现方，出租方）',
    nullable: true,
  })
  @Index()
  userId: string;

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
   * 提现状态
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    default: WithdrawalStatus.PROCESSING,
    nullable: true,
    comment: '提现状态',
    apiOptions: { enum: WithdrawalStatus },
  })
  status: WithdrawalStatus;

  /**
   * 提现金额（元）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '提现金额（元）',
    apiOptions: { type: 'number' },
  })
  amount: string;

  /**
   * 提现原因/备注
   */
  @Expose()
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    comment: '提现原因/备注',
    optional: true,
  })
  reason?: string;

  /**
   * 第三方提现单号
   */
  @Expose()
  @ColumnWithApi({ length: 100, nullable: true, comment: '第三方提现单号', optional: true })
  thirdPartyWithdrawalNo?: string;

  /**
   * 提现完成时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    optional: true,
    comment: '提现完成时间',
  })
  withdrawnAt?: Date;

  /**
   * 提现回调数据（JSON）
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    optional: true,
    comment: '提现回调数据（JSON）',
  })
  callbackData?: Record<string, any>;

  /**
   * 提现失败原因
   */
  @Expose()
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    optional: true,
    comment: '提现失败原因',
  })
  failureReason?: string;

  // ====================================== Relations ===========================================

  /**
   * 支付关系（多对一）
   */
  @ApiHideProperty()
  @ManyToOne(() => PaymentEntity, payment => payment.withdrawalRecords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_id' })
  payment?: PaymentEntity;

  /**
   * 账单支付记录关系（多对一）
   */
  @ApiHideProperty()
  @ManyToOne(() => PaymentRecordEntity, paymentRecord => paymentRecord.withdrawalRecords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_record_id' })
  paymentRecord?: PaymentRecordEntity;

  /**
   * 用户关系（多对一）
   */
  @ApiHideProperty()
  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  // ====================================== Virtual Fields ===========================================

  /**
   * 提现状态标签
   */
  get statusLabel(): string {
    return this.status ? WithdrawalStatusLabelMap[this.status] : '';
  }
}
