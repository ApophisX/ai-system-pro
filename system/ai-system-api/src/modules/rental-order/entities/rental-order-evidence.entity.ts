import { Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import { RentalOrderEntity } from './rental-order.entity';
import {
  EvidenceSubmitterType,
  EvidenceAuditStatus,
  EvidenceSubmitterTypeLabel,
  EvidenceAuditStatusLabel,
  EvidenceType,
  EvidenceTypeLabel,
  RentalOrderUsageStatus,
} from '../enums';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { IsNotEmpty, IsOptional, IsEnum, IsArray, IsString, MaxLength, IsUrl, ArrayMinSize } from 'class-validator';
import { TransformDateString } from '@/common/decorators';

/**
 * 租赁订单凭证实体
 *
 * 用于存储承租方和出租方在订单变化后提交的凭证
 * 方便后期争议提供证据
 */
@Entity('rental_order_evidence')
@Index('IDX_rental_order_evidence_submitter', ['submitterId', 'auditStatus'])
@Index('IDX_rental_order_evidence_order_submitter', ['rentalOrderId', 'submitterId'])
export class RentalOrderEvidenceEntity extends BaseEntity {
  /**
   * 租赁订单 ID
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '租赁订单 ID',
    length: 50,
    nullable: false,
  })
  @IsNotEmpty()
  @Index()
  rentalOrderId: string;

  /**
   *  租赁订单编号
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    comment: '租赁订单编号',
    nullable: true,
  })
  @IsOptional()
  rentalOrderNo: string;

  /**
   * 提交者 ID（承租方或出租方的用户 ID）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '提交者 ID（承租方或出租方的用户 ID）',
    length: 50,
    nullable: true,
  })
  @IsNotEmpty()
  @Index()
  submitterId: string;

  /**
   * 提交者类型：lessor（出租方）/ lessee（承租方）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    default: EvidenceSubmitterType.LESSEE,
    comment: '提交者类型：lessor（出租方）/ lessee（承租方）',
    apiOptions: {
      enum: EvidenceSubmitterType,
    },
  })
  @IsEnum(EvidenceSubmitterType)
  @IsNotEmpty()
  submitterType: EvidenceSubmitterType;

  /**
   * 凭证 URL 列表（支持多个凭证）
   */
  @Expose()
  @ColumnWithApi({
    type: 'simple-array',
    comment: '凭证 URL 列表（支持多个凭证）',
    nullable: true,
  })
  @IsArray()
  @ArrayMinSize(1, { message: '至少需要上传一个凭证' })
  evidenceUrls?: string[];

  /**
   * 凭证描述
   */
  @Expose()
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    comment: '凭证描述',
    optional: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: '凭证描述不能超过1000个字符' })
  description?: string;

  /**
   * 凭证类型
   */
  @Expose()
  @ColumnWithApi({
    type: 'enum',
    enum: EvidenceType,
    nullable: true,
    comment:
      '凭证类型：asset_delivery：资产交付凭证（出租方交付给承租方）, asset_receipt_confirm：确认收货凭证（承租方确认收到资产，PENDING_RECEIPT -> RECEIVED, useageStatus -> IN_USE）, asset_usage：资产使用/占用凭证（证明某时点仍在使用中）, asset_return：资产归还凭证（承租方提交归还申请）, asset_return_confirm：确认归还凭证（出租方确认收到归还，RETURNED_PENDING -> RETURNED）, asset_return_reject：拒绝归还凭证（出租方拒绝归还申请，RETURNED_PENDING -> DISPUTE）, asset_inspection：资产验收凭证（交付或归还时的验收检测，记录资产状态）, asset_damage：资产损坏凭证, asset_repair：资产维修/处理凭证（维修、检测、处理结果）, asset_loss：资产丢失凭证, deposit_deduction：押金扣除凭证, deposit_refund：押金退还凭证（押金退款相关）, order_cancel：订单取消凭证, order_cancel_reject：拒绝取消订单凭证（出租方拒绝取消订单，DISPUTE -> CANCEL_PENDING）, order_cancel_approve：同意取消订单凭证（出租方同意取消订单，CANCEL_PENDING -> CANCELED）, order_refund：订单退款凭证（订单退款相关）, order_complete：订单完成凭证（出租方结束订单时的凭证）, dispute：争议凭证（沟通记录、申诉材料等）, platform_decision：平台裁决/系统确认凭证（自动确认、仲裁结果）, other：其他凭证',
    optional: true,
    apiOptions: {
      enum: EvidenceType,
    },
  })
  @IsOptional()
  @IsEnum(EvidenceType)
  evidenceType?: EvidenceType;

  /**
   * 关联的订单状态（可选，用于标识是在哪个状态变化时提交的）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '关联的订单状态（可选，用于标识是在哪个状态变化时提交的）',
    optional: true,
    apiOptions: {
      enum: RentalOrderUsageStatus,
    },
  })
  @IsOptional()
  @IsEnum(RentalOrderUsageStatus)
  relatedOrderStatus?: RentalOrderUsageStatus;

  /**
   * 审核状态：pending（待审核）/ approved（已通过）/ rejected（已拒绝）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    default: EvidenceAuditStatus.PENDING,
    comment: '审核状态：pending（待审核）/ approved（已通过）/ rejected（已拒绝）',
    apiOptions: {
      enum: EvidenceAuditStatus,
    },
  })
  @IsEnum(EvidenceAuditStatus)
  @IsNotEmpty()
  auditStatus: EvidenceAuditStatus;

  /**
   * 审核意见（审核拒绝时填写）
   */
  @Expose()
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    comment: '审核意见（审核拒绝时填写）',
    optional: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '审核意见不能超过500个字符' })
  auditRemark?: string;

  /**
   * 审核时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '审核时间',
    optional: true,
  })
  @IsOptional()
  @TransformDateString()
  auditedAt?: Date;

  /**
   * 审核人 ID
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    nullable: true,
    comment: '审核人 ID',
    optional: true,
    length: 50,
  })
  @IsOptional()
  auditorId?: string;

  /** ************************************* 关联关系 Start ************************************* */

  /**
   * 租赁订单关系（多对一）
   */
  @ManyToOne(() => RentalOrderEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rental_order_id' })
  rentalOrder: RentalOrderEntity;

  /**
   * 提交者关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submitter_id' })
  submitter: UserEntity;

  /**
   * 审核人关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'auditor_id' })
  auditor?: UserEntity;

  /** ************************************* 虚拟字段 Start ************************************* */

  /**
   * 提交者类型标签
   */
  get submitterTypeLabel(): string {
    return EvidenceSubmitterTypeLabel[this.submitterType];
  }

  /**
   * 审核状态标签
   */
  get auditStatusLabel(): string {
    return EvidenceAuditStatusLabel[this.auditStatus];
  }

  /**
   * 是否已审核
   */
  get isAudited(): boolean {
    return this.auditStatus !== EvidenceAuditStatus.PENDING;
  }

  /**
   * 是否审核通过
   */
  get isApproved(): boolean {
    return this.auditStatus === EvidenceAuditStatus.APPROVED;
  }

  /**
   * 是否审核拒绝
   */
  get isRejected(): boolean {
    return this.auditStatus === EvidenceAuditStatus.REJECTED;
  }

  /**
   * 凭证类型标签
   */
  get evidenceTypeLabel(): string | undefined {
    return this.evidenceType ? EvidenceTypeLabel[this.evidenceType] : undefined;
  }

  /** ************************************* Virtual Fields End ************************************* */
}
