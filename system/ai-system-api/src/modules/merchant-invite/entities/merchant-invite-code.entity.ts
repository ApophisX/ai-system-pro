import { Entity, Index } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';

/**
 * 商户邀请码实体
 *
 * 员工专属邀请码，商户注册时使用可建立邀请关系
 */
@Entity('merchant_invite_code')
@Index('uk_merchant_invite_code', ['code'], { unique: true })
@Index('IDX_merchant_invite_code_employee', ['employeeId'])
export class MerchantInviteCodeEntity extends BaseEntity {
  /**
   * 归属员工 ID
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    comment: '归属员工 ID',
  })
  employeeId: string;

  /**
   * 邀请码（唯一）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 32,
    comment: '邀请码（唯一）',
  })
  code: string;

  /**
   * 过期时间（空则永不过期）
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '过期时间（空则永不过期）',
    optional: true,
  })
  expireAt?: Date;
}
