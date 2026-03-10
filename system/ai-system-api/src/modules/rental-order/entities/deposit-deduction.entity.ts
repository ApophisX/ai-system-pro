import { Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Expose, Type } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { DepositEntity } from './deposit.entity';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { ApiHideProperty } from '@nestjs/swagger';
import { DepositDeductionStatus, DepositDeductionStatusLabelMap } from '../enums';
import { UserEntity } from '@/modules/base/user/entities/user.entity';

/**
 * 押金扣款记录实体
 *
 * 一笔押金可以有多笔扣款记录
 * 用于记录每次扣款的详细信息
 */
@Entity('deposit_deductions')
@Index('IDX_deposit_deduction_deposit_status', ['depositId', 'status'])
@Index('IDX_deposit_deduction_order_status', ['orderId', 'status'])
export class DepositDeductionEntity extends BaseEntity {
  /**
   * 扣款单号（唯一，业务标识）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    unique: true,
    comment: '扣款单号（唯一，业务标识）',
  })
  deductionNo: string;

  /**
   * 押金 ID
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    comment: '押金 ID',
  })
  @Index()
  depositId: string;

  /**
   * 押金单号（冗余字段）
   */
  @Expose()
  @ColumnWithApi({ length: 50, comment: '押金单号' })
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
   * 订单号（冗余字段）
   */
  @Expose()
  @ColumnWithApi({ length: 50, comment: '订单号' })
  orderNo: string;

  /**
   * 扣款金额（元）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '扣款金额（元）',
  })
  amount: number;

  /**
   * 扣款原因
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 200,
    comment: '扣款原因',
  })
  reason: string;

  /**
   * 扣款说明
   */
  @Expose()
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    comment: '扣款说明',
    optional: true,
  })
  description?: string;

  /**
   * 扣款状态（申请状态）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    default: DepositDeductionStatus.PENDING_USER_CONFIRM,
    comment:
      '扣款状态：pending_user_confirm（待用户确认）/ pending_audit（待审核）/ user_approved（用户同意）/ user_rejected（用户拒绝）/ platform_approved（平台已审核）/ platform_rejected（平台已拒绝）/ executed（已执行）/ cancelled（已取消）',
    apiOptions: {
      enum: DepositDeductionStatus,
    },
  })
  status: DepositDeductionStatus;

  /**
   * 申请提交时间（出租方提交扣款申请的时间）
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    comment: '申请提交时间（出租方提交扣款申请的时间）',
  })
  appliedAt: Date;

  /**
   * 扣款时间（实际执行扣款的时间，仅在已执行状态时有值）
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '扣款时间（实际执行扣款的时间）',
    optional: true,
  })
  deductedAt?: Date;

  /**
   * 申请超时时间（申请提交后72小时，用于判断是否超时未响应）
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '申请超时时间（申请提交后72小时，用户未处理，则自动标记为平台待审核）',
    optional: true,
  })
  timeoutAt?: Date;

  /**
   * 操作人 ID（系统操作或管理员操作）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    nullable: true,
    comment: '操作人 ID',
    optional: true,
  })
  operatorId?: string;

  /**
   * 操作人名称
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    nullable: true,
    comment: '操作人名称',
    optional: true,
  })
  operatorName?: string;

  /**
   * 关联证据（JSON，存储扣款相关的证据，如照片、视频、文件等）
   * 格式：{ images: string[], videos: string[], files: string[] }
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '关联证据（JSON，存储扣款相关的证据，如照片、视频、文件等）',
    optional: true,
  })
  evidence?: {
    urls?: string[];
    description?: string;
  };

  /**
   * 承租方 ID
   */
  @Expose()
  @ColumnWithApi({ type: 'uuid', length: 50, comment: '承租方 ID', nullable: true })
  lesseeId: string;

  /**
   * 申请提交人 ID（出租方）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    comment: '申请提交人 ID（出租方）',
    nullable: true,
  })
  lessorId: string;

  /**
   * 申请提交人名称（出租方）
   */
  @Expose()
  @ColumnWithApi({
    length: 100,
    nullable: true,
    comment: '申请提交人名称（出租方）',
    optional: true,
  })
  lessorName?: string;

  /**
   * 取消原因
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: '取消原因（出租方取消扣款申请的原因）',
    optional: true,
  })
  cancelReason?: string;

  /**
   * 取消时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '取消时间',
    optional: true,
  })
  cancelAt?: Date;

  // ====================================== 承租方响应相关字段 ===========================================

  /**
   * 承租方响应时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '承租方响应时间',
    optional: true,
  })
  userRespondedAt?: Date;

  /**
   * 承租方响应类型（approved/rejected）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '承租方响应类型（approved/rejected）',
    optional: true,
    apiOptions: {
      enum: ['approved', 'rejected'],
    },
  })
  userResponseType?: 'approved' | 'rejected';

  /**
   * 承租方响应说明（同意或拒绝的说明）
   */
  @Expose()
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    comment: '承租方响应说明（同意或拒绝的说明）',
    optional: true,
  })
  userResponseDescription?: string;

  /**
   * 承租方响应凭证（JSON，存储拒绝时的凭证，如照片、视频、文件等）
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '承租方响应凭证（JSON，存储拒绝时的凭证）',
    optional: true,
  })
  userResponseEvidence?: {
    urls?: string[];
    description?: string;
  };

  // ====================================== 平台审核相关字段 ===========================================

  /**
   * 平台审核时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '平台审核时间',
    optional: true,
  })
  platformAuditedAt?: Date;

  /**
   * 平台审核人 ID
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    nullable: true,
    comment: '平台审核人 ID',
    optional: true,
  })
  platformAuditorId?: string;

  /**
   * 平台审核人名称
   */
  @Expose()
  @ColumnWithApi({
    length: 100,
    nullable: true,
    comment: '平台审核人名称',
    optional: true,
  })
  platformAuditorName?: string;

  /**
   * 平台审核说明
   */
  @Expose()
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    comment: '平台审核说明',
    optional: true,
  })
  platformAuditDescription?: string;

  // ====================================== Relations ===========================================

  /**
   * 押金关系（多对一）
   */
  @ApiHideProperty()
  @ManyToOne(() => DepositEntity, deposit => deposit.deductions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'deposit_id' })
  deposit?: DepositEntity;

  @ApiHideProperty()
  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lessor_id' })
  lessor: UserEntity;

  @ApiHideProperty()
  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lessee_id' })
  lessee: UserEntity;

  // ====================================== Virtual Fields ===========================================

  /**
   * 状态标签
   */
  get statusLabel(): string {
    return DepositDeductionStatusLabelMap[this.status];
  }

  /**
   * 是否已执行
   */
  get isExecuted(): boolean {
    return this.status === DepositDeductionStatus.EXECUTED;
  }

  /**
   * 是否可执行（平台已审核通过）
   */
  get canExecute(): boolean {
    return this.status === DepositDeductionStatus.PLATFORM_APPROVED;
  }

  /**
   * 是否已终止（已拒绝或已取消）
   */
  get isTerminated(): boolean {
    return [DepositDeductionStatus.PLATFORM_REJECTED, DepositDeductionStatus.CANCELLED].includes(this.status);
  }

  /**
   * 是否超时未响应（超过72小时未响应）
   */
  get isTimeout(): boolean {
    if (!this.timeoutAt) {
      return false;
    }
    return (
      new Date() > this.timeoutAt &&
      (this.status === DepositDeductionStatus.PENDING_USER_CONFIRM ||
        this.status === DepositDeductionStatus.PENDING_AUDIT)
    );
  }
}
