import { Entity, Index, Column } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { CreditActorRole, CreditLevel } from '../enums';

/**
 * 信用评分历史实体
 *
 * 可追溯、可审计，每次评分计算记录
 */
@Entity('credit_score_history')
@Index('IDX_credit_score_history_user', ['userId'])
@Index('IDX_credit_score_history_calculated', ['calculatedAt'])
export class CreditScoreHistoryEntity extends BaseEntity {
  @Expose()
  @ColumnWithApi({ type: 'uuid', comment: '用户 ID' })
  userId: string;

  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 20,
    default: CreditActorRole.LESSEE,
    comment: '角色',
    apiOptions: { enum: CreditActorRole },
  })
  actorRole: CreditActorRole;

  @Expose()
  @ColumnWithApi({ type: 'int', comment: '综合信用分' })
  creditScore: number;

  @Expose()
  @ColumnWithApi({ type: 'int', comment: '行为分' })
  behaviorScore: number;

  @Expose()
  @ColumnWithApi({ type: 'int', comment: '风险分' })
  riskScore: number;

  @Expose()
  @ColumnWithApi({ type: 'int', comment: '资产稳定分' })
  stabilityScore: number;

  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 10,
    comment: '信用等级',
    apiOptions: { enum: CreditLevel },
  })
  creditLevel: CreditLevel;

  @Expose()
  @ColumnWithApi({ length: 20, comment: '模型版本' })
  modelVersion: string;

  @Expose()
  @ColumnWithApi({ type: 'timestamp', comment: '计算时间' })
  calculatedAt: Date;
}
