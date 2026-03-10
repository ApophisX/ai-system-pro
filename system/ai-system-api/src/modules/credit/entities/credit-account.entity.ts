import { Entity, Index, Unique } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { CreditActorRole, CreditLevel, CreditStatus } from '../enums';

/**
 * 信用账户实体
 *
 * 与 user 解耦，支持双角色分账户（lessor/lessee）
 * 评分由评分引擎定时/事件触发重算
 */
@Entity('credit_account')
@Unique('UQ_credit_account_user_role', ['userId', 'actorRole'])
@Index('IDX_credit_account_user', ['userId'])
@Index('IDX_credit_account_level', ['creditLevel'])
export class CreditAccountEntity extends BaseEntity {
  @Expose()
  @ColumnWithApi({ type: 'uuid', comment: '用户 ID' })
  userId: string;

  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 20,
    default: CreditActorRole.LESSEE,
    comment: '角色：lessor 出租方 / lessee 承租方',
    apiOptions: { enum: CreditActorRole },
  })
  actorRole: CreditActorRole;

  @Expose()
  @ColumnWithApi({ type: 'int', default: 600, comment: '综合信用分（300-950 有效区间）' })
  creditScore: number;

  @Expose()
  @ColumnWithApi({ type: 'int', default: 600, comment: '行为分' })
  behaviorScore: number;

  @Expose()
  @ColumnWithApi({ type: 'int', default: 600, comment: '风险分' })
  riskScore: number;

  @Expose()
  @ColumnWithApi({ type: 'int', default: 600, comment: '资产稳定分' })
  stabilityScore: number;

  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 10,
    default: CreditLevel.C,
    comment: '信用等级',
    apiOptions: {
      enum: CreditLevel,
      description: '信用等级：AAA 900-950, AA 850-899, A 800-849, B 700-799, C 600-699, D 500-599, E <500',
    },
  })
  creditLevel: CreditLevel;

  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 20,
    default: CreditStatus.NORMAL,
    comment: '信用状态：normal 正常 / frozen 冻结',
    apiOptions: { enum: CreditStatus },
  })
  creditStatus: CreditStatus;

  @Expose()
  @ColumnWithApi({ length: 20, default: 'v1', comment: '模型版本' })
  modelVersion: string;

  @Expose()
  @ColumnWithApi({ type: 'timestamp', nullable: true, comment: '最后计算时间', optional: true })
  lastCalculatedAt?: Date;
}
