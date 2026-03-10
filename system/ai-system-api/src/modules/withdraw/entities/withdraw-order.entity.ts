import { Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { WithdrawOrderStatus, WithdrawChannel } from '../enums';
import { UserEntity } from '@/modules/base/user/entities/user.entity';

/**
 * 提现订单实体
 *
 * 商家申请提现的完整流程记录
 */
@Entity('withdraw_orders')
@Index('IDX_withdraw_order_merchant_status', ['merchantId', 'status'])
@Index('IDX_withdraw_order_withdraw_no', ['withdrawNo'], { unique: true })
@Index('IDX_withdraw_order_idempotency', ['idempotencyKey'], { unique: true })
export class WithdrawOrderEntity extends BaseEntity {
  /**
   * 提现单号（唯一）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    unique: true,
    comment: '提现单号（唯一）',
  })
  withdrawNo: string;

  /**
   * 商家 ID（lessor_id）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '商家 ID',
  })
  @Index()
  merchantId: string;

  /**
   * 提现金额（元）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    comment: '提现金额（元）',
    apiOptions: { type: 'number' },
  })
  amount: string;

  /**
   * 提现手续费（元，可选）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '提现手续费（元）',
    apiOptions: { type: 'number' },
  })
  fee: string;

  /**
   * 实际到账金额（元）= amount - fee
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    comment: '实际到账金额（元）',
    apiOptions: { type: 'number' },
  })
  actualAmount: string;

  /**
   * 提现状态
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 30,
    default: WithdrawOrderStatus.PENDING,
    comment: '提现状态',
    apiOptions: { enum: WithdrawOrderStatus },
  })
  status: WithdrawOrderStatus;

  /**
   * 提现方式（微信/支付宝/银行卡）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 20,
    default: WithdrawChannel.WECHAT,
    comment: '提现方式',
    apiOptions: { enum: WithdrawChannel },
  })
  withdrawChannel: WithdrawChannel;

  /**
   * 提现目标账户（微信 OpenID / 支付宝账号 / 银行卡号）
   */
  @Expose()
  @ColumnWithApi({
    length: 128,
    comment: '提现目标账户',
  })
  targetAccount: string;

  /**
   * 开户行地址（银行卡提现时使用，预留）
   */
  @Expose()
  @ColumnWithApi({
    length: 200,
    nullable: true,
    optional: true,
    comment: '开户行地址',
  })
  bankBranchAddress?: string;

  /**
   * 幂等键（打款时使用，防重复打款）
   */
  @Expose()
  @ColumnWithApi({
    length: 64,
    unique: true,
    comment: '幂等键',
  })
  idempotencyKey: string;

  /**
   * 申请时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    comment: '申请时间',
  })
  requestedAt: Date;

  /**
   * 审核时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    optional: true,
    comment: '审核时间',
  })
  reviewedAt?: Date;

  /**
   * 打款处理时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    optional: true,
    comment: '打款处理时间',
  })
  processedAt?: Date;

  /**
   * 完成时间（打款成功/失败时间）
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    optional: true,
    comment: '完成时间',
  })
  completedAt?: Date;

  /**
   * 失败原因
   */
  @Expose()
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    optional: true,
    comment: '失败原因',
  })
  failedReason?: string;

  /**
   * 拒绝原因（审核拒绝时）
   */
  @Expose()
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    optional: true,
    comment: '拒绝原因',
  })
  rejectReason?: string;

  /**
   * 第三方打款单号
   */
  @Expose()
  @ColumnWithApi({
    length: 100,
    nullable: true,
    optional: true,
    comment: '第三方打款单号',
  })
  thirdPartyWithdrawNo?: string;

  // ====================================== Relations ===========================================

  @ApiHideProperty()
  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'merchant_id' })
  merchant?: UserEntity;
}
