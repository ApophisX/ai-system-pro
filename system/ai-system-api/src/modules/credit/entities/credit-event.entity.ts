import { Entity, Index, Column } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { CreditEventType, CreditActorRole } from '../enums';

/**
 * 信用事件实体
 *
 * 不可变设计（Append Only），行为转换为标准信用事件
 * 供评分引擎重放计算
 */
@Entity('credit_event')
@Index('IDX_credit_event_user_role', ['userId', 'actorRole'])
@Index('IDX_credit_event_order', ['relatedOrderId'])
@Index('IDX_credit_event_created', ['createdAt'])
@Index('IDX_credit_event_user_type', ['userId', 'eventType'])
export class CreditEventEntity extends BaseEntity {
  @Expose()
  @ColumnWithApi({ type: 'uuid', comment: '用户 ID' })
  userId: string;

  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 20,
    comment: '行为主体角色：lessor 出租方 / lessee 承租方',
    apiOptions: { enum: CreditActorRole },
  })
  actorRole: CreditActorRole;

  @Expose()
  @ColumnWithApi({ type: 'uuid', nullable: true, comment: '关联订单 ID', optional: true })
  relatedOrderId?: string;

  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    comment: '事件类型',
    apiOptions: {
      enum: CreditEventType,
      description:
        '事件类型，order_completed：订单正常完成（正面）, dispute_won：争议胜诉（仲裁结果利于己方，正面）, order_overdue：逾期（含分期逾期、租赁逾期，负面）, order_default：恶意违约（未付清、恶意取消等，负面）, dispute_opened：进入争议（负面）, dispute_lost：争议败诉（平台仲裁裁定不利，负面）, deposit_deducted：押金被扣除（负面）, fraud_confirmed：欺诈确认（人工标记，负面）, manual_reward：人工奖励（需权限+审计）, manual_penalty：人工处罚（需权限+审计）',
    },
  })
  eventType: CreditEventType;

  /**
   * 影响分（扣分时为负，加分时为正）
   */
  @Expose()
  @ColumnWithApi({ type: 'int', comment: '影响分', default: 0 })
  impactScore: number;

  /**
   * 风险权重（用于衰减计算，0-1）
   */
  @Expose()
  @ColumnWithApi({ type: 'decimal', precision: 5, scale: 4, default: 1, comment: '风险权重' })
  riskWeight: number;

  @Expose()
  @ColumnWithApi({ length: 20, default: 'v1', comment: '模型版本' })
  modelVersion: string;

  /**
   * 操作类型：system 系统 / manual 人工
   */
  @Expose()
  @ColumnWithApi({ length: 20, default: 'system', comment: '操作类型' })
  operatorType: string;

  /**
   * 扩展元数据（如逾期天数、扣款金额等）
   */
  @Expose()
  @ColumnWithApi({ type: 'json', nullable: true, comment: '扩展元数据', optional: true })
  metadata?: Record<string, unknown>;
}
