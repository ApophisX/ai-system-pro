import { Entity, Index, Column } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { MerchantInviteRewardType, MerchantInviteRewardStatus } from '../enums';

/**
 * 商户邀请奖励实体
 *
 * 记录分润等奖励，同一 orderId 仅创建一条 REBATE 记录（幂等）
 */
@Entity('merchant_invite_reward')
@Index('IDX_merchant_invite_reward_employee', ['employeeId'])
@Index('IDX_merchant_invite_reward_merchant', ['merchantId'])
@Index('IDX_merchant_invite_reward_type_status', ['type', 'status'])
@Index('IDX_merchant_invite_reward_order', ['relatedOrderId'])
export class MerchantInviteRewardEntity extends BaseEntity {
  /**
   * 员工 ID
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    comment: '员工 ID',
  })
  employeeId: string;

  /**
   * 商户 ID
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    comment: '商户 ID',
  })
  merchantId: string;

  /**
   * 奖励类型
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 20,
    comment: '奖励类型',
    apiOptions: { enum: MerchantInviteRewardType },
  })
  type: MerchantInviteRewardType;

  /**
   * 奖励金额（元）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '奖励金额（元）',
  })
  amount: string;

  /**
   * 奖励状态
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 20,
    default: MerchantInviteRewardStatus.PENDING,
    comment: '奖励状态',
    apiOptions: { enum: MerchantInviteRewardStatus },
  })
  status: MerchantInviteRewardStatus;

  /**
   * 关联订单 ID（REBATE 时必填，用于幂等）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    nullable: true,
    comment: '关联订单 ID',
    optional: true,
  })
  relatedOrderId?: string;

  /**
   * 实际发放时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '实际发放时间',
    optional: true,
  })
  releasedAt?: Date;
}
