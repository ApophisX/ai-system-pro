import { Entity, Index, Column } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { MerchantInviteRelationStatus } from '../enums';

/**
 * 商户邀请关系实体
 *
 * 一商户仅能被邀请一次，状态流转：REGISTERED → VERIFIED → LISTED → FIRST_ORDER
 */
@Entity('merchant_invite_relation')
@Index('uk_merchant_invite_relation_merchant', ['merchantId'], { unique: true })
@Index('IDX_merchant_invite_relation_employee', ['employeeId'])
export class MerchantInviteRelationEntity extends BaseEntity {
  /**
   * 邀请员工 ID
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    comment: '邀请员工 ID',
  })
  employeeId: string;

  /**
   * 商户 ID（= userId，企业用户）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    comment: '商户 ID（= userId）',
  })
  merchantId: string;

  /**
   * 使用的邀请码（追溯用）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 32,
    comment: '使用的邀请码',
  })
  inviteCode: string;

  /**
   * 关系状态
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 20,
    default: MerchantInviteRelationStatus.REGISTERED,
    comment: '关系状态',
    apiOptions: { enum: MerchantInviteRelationStatus },
  })
  status: MerchantInviteRelationStatus;

  /**
   * 认证通过时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '认证通过时间',
    optional: true,
  })
  verifiedAt?: Date;

  /**
   * 上架达标时间（≥3 资产审核通过）
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '上架达标时间',
    optional: true,
  })
  listedAt?: Date;

  /**
   * 首单完成时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '首单完成时间',
    optional: true,
  })
  firstOrderAt?: Date;
}
