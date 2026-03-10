import { Entity, Index } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { AccountFlowType, BalanceType, AccountFlowRelatedType } from '../enums';

/**
 * 账务流水实体
 *
 * 所有金额变动必须记录流水
 * 用于审计和对账
 */
@Entity('account_flows')
@Index('IDX_account_flow_merchant_created', ['merchantId', 'createdAt'])
@Index('IDX_account_flow_idempotency', ['idempotencyKey'], { unique: true })
export class AccountFlowEntity extends BaseEntity {
  /**
   * 流水号（唯一）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    unique: true,
    comment: '流水号（唯一）',
  })
  flowNo: string;

  /**
   * 商家 ID
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '商家 ID',
  })
  @Index()
  merchantId: string;

  /**
   * 变动金额（正数入账，负数出账）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    comment: '变动金额（正数入账，负数出账）',
    apiOptions: { type: 'number' },
  })
  amount: string;

  /**
   * 流水类型
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    comment: '流水类型',
    apiOptions: { enum: AccountFlowType },
  })
  type: AccountFlowType;

  /**
   * 影响的余额类型
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 20,
    comment: '影响的余额类型',
    apiOptions: { enum: BalanceType },
  })
  balanceType: BalanceType;

  /**
   * 变动前余额
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    comment: '变动前余额',
    apiOptions: { type: 'number' },
  })
  balanceBefore: string;

  /**
   * 变动后余额
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    comment: '变动后余额',
    apiOptions: { type: 'number' },
  })
  balanceAfter: string;

  /**
   * 关联业务类型
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 20,
    comment: '关联业务类型',
    apiOptions: { enum: AccountFlowRelatedType },
  })
  relatedType: AccountFlowRelatedType;

  /**
   * 关联业务 ID
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '关联业务 ID',
  })
  relatedId: string;

  /**
   * 幂等键（防重复记账）
   */
  @Expose()
  @ColumnWithApi({
    length: 64,
    comment: '幂等键',
  })
  idempotencyKey: string;
}
