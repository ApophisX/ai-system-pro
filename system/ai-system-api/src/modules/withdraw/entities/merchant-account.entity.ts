import { Entity, Index } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';

/**
 * 商家账户实体
 *
 * merchant_id = lessor_id
 * 总余额 = 冻结余额 + 可提现余额
 * 使用 version 乐观锁防并发超提
 */
@Entity('merchant_accounts')
@Index('IDX_merchant_account_merchant_id', ['merchantId'], { unique: true })
export class MerchantAccountEntity extends BaseEntity {
  /**
   * 商家 ID（即 lessor_id）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '商家 ID（出租方 ID）',
  })
  merchantId: string;

  /**
   * 总余额（元）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '总余额（元）',
    apiOptions: { type: 'number' },
  })
  totalBalance: string;

  /**
   * 冻结余额（订单未结算 + 提现待打款）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '冻结余额（元）',
    apiOptions: { type: 'number' },
  })
  frozenBalance: string;

  /**
   * 可提现余额（元）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '可提现余额（元）',
    apiOptions: { type: 'number' },
  })
  availableBalance: string;
}
