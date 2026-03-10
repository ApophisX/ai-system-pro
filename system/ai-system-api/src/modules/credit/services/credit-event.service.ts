import { Injectable, Logger } from '@nestjs/common';
import { CreditEventRepository } from '../repositories/credit-event.repository';
import { CreditEventEntity } from '../entities';
import { CreditEventType, CreditActorRole } from '../enums';
import { CREDIT_IMPACT } from '../constants/credit-impact.constant';
import type {
  OrderCompletedPayload,
  OrderOverduePayload,
  DepositDeductedPayload,
  DisputeOpenedPayload,
  DisputeResolvedPayload,
  FraudConfirmedPayload,
  ManualAdjustmentPayload,
} from '../events/credit-event.payload';

const MODEL_VERSION = 'v1';

/**
 * 信用事件服务
 *
 * 事件写入、去重，供评分引擎消费
 * 所有事件不可变，仅追加
 */
@Injectable()
export class CreditEventService {
  private readonly logger = new Logger(CreditEventService.name);

  constructor(private readonly eventRepo: CreditEventRepository) {}

  /**
   * 记录订单完成（承租方正面）
   */
  async recordOrderCompleted(payload: OrderCompletedPayload): Promise<CreditEventEntity | null> {
    const exists = await this.eventRepo.existsByOrderAndType(
      payload.orderId,
      CreditEventType.ORDER_COMPLETED,
      payload.userId,
      payload.actorRole,
    );
    if (exists) {
      this.logger.debug(`ORDER_COMPLETED 已存在，跳过: orderId=${payload.orderId}, userId=${payload.userId}`);
      return null;
    }

    const entity = new CreditEventEntity();
    entity.userId = payload.userId;
    entity.actorRole = payload.actorRole;
    entity.relatedOrderId = payload.orderId;
    entity.eventType = CreditEventType.ORDER_COMPLETED;
    entity.impactScore = CREDIT_IMPACT.ORDER_COMPLETED;
    entity.riskWeight = 1;
    entity.modelVersion = MODEL_VERSION;
    entity.operatorType = payload.operatorType || 'system';

    return this.eventRepo.save(entity);
  }

  /**
   * 记录订单逾期（承租方负面）
   * 轻微逾期 ≤7 天：-10；严重逾期 >7 天或分期连续 2 期+：-30
   * 去重：同一订单同一用户只记录一次（租赁与分期统一）
   */
  async recordOrderOverdue(payload: OrderOverduePayload): Promise<CreditEventEntity | null> {
    const impactScore = payload.isSevere ? CREDIT_IMPACT.SEVERE_OVERDUE : CREDIT_IMPACT.SLIGHT_OVERDUE;

    const exists = await this.eventRepo.existsByOrderAndType(
      payload.orderId,
      CreditEventType.ORDER_OVERDUE,
      payload.userId,
      payload.actorRole,
    );
    if (exists) {
      this.logger.debug(`ORDER_OVERDUE 已存在，跳过: orderId=${payload.orderId}`);
      return null;
    }

    const entity = new CreditEventEntity();
    entity.userId = payload.userId;
    entity.actorRole = payload.actorRole;
    entity.relatedOrderId = payload.orderId;
    entity.eventType = CreditEventType.ORDER_OVERDUE;
    entity.impactScore = impactScore;
    entity.riskWeight = 1;
    entity.modelVersion = MODEL_VERSION;
    entity.operatorType = payload.operatorType || 'system';
    entity.metadata = {
      overdueDays: payload.overdueDays,
      isSevere: payload.isSevere,
      consecutiveOverduePeriods: payload.consecutiveOverduePeriods,
    };

    return this.eventRepo.save(entity);
  }

  /**
   * 记录押金扣除（承租方负面）
   */
  async recordDepositDeducted(payload: DepositDeductedPayload): Promise<CreditEventEntity | null> {
    const exists = await this.eventRepo.existsByDeductionId(payload.deductionId, payload.userId, payload.actorRole);
    if (exists) {
      this.logger.debug(`DEPOSIT_DEDUCTED 已存在，跳过: deductionId=${payload.deductionId}`);
      return null;
    }

    const entity = new CreditEventEntity();
    entity.userId = payload.userId;
    entity.actorRole = payload.actorRole;
    entity.relatedOrderId = payload.orderId;
    entity.eventType = CreditEventType.DEPOSIT_DEDUCTED;
    entity.impactScore = CREDIT_IMPACT.DEPOSIT_DEDUCTED;
    entity.riskWeight = 1;
    entity.modelVersion = MODEL_VERSION;
    entity.operatorType = payload.operatorType || 'system';
    entity.metadata = { deductionId: payload.deductionId, amount: payload.amount };

    return this.eventRepo.save(entity);
  }

  /** 记录进入争议 */
  async recordDisputeOpened(payload: DisputeOpenedPayload): Promise<CreditEventEntity | null> {
    const exists = await this.eventRepo.existsByOrderAndType(
      payload.orderId,
      CreditEventType.DISPUTE_OPENED,
      payload.userId,
      payload.actorRole,
    );
    if (exists) return null;
    const entity = new CreditEventEntity();
    entity.userId = payload.userId;
    entity.actorRole = payload.actorRole;
    entity.relatedOrderId = payload.orderId;
    entity.eventType = CreditEventType.DISPUTE_OPENED;
    entity.impactScore = CREDIT_IMPACT.DISPUTE_OPENED;
    entity.riskWeight = 1;
    entity.modelVersion = MODEL_VERSION;
    entity.operatorType = payload.operatorType || 'system';
    entity.metadata = { initiatorRole: payload.initiatorRole };
    return this.eventRepo.save(entity);
  }

  /** 记录争议裁决：胜诉方 DISPUTE_WON，败诉方 DISPUTE_LOST */
  async recordDisputeResolved(payload: DisputeResolvedPayload): Promise<void> {
    const winnerExists = await this.eventRepo.existsByOrderAndType(
      payload.orderId,
      CreditEventType.DISPUTE_WON,
      payload.winnerUserId,
      payload.winnerActorRole,
    );
    const loserExists = await this.eventRepo.existsByOrderAndType(
      payload.orderId,
      CreditEventType.DISPUTE_LOST,
      payload.loserUserId,
      payload.loserActorRole,
    );
    if (!winnerExists) {
      const e = new CreditEventEntity();
      e.userId = payload.winnerUserId;
      e.actorRole = payload.winnerActorRole;
      e.relatedOrderId = payload.orderId;
      e.eventType = CreditEventType.DISPUTE_WON;
      e.impactScore = CREDIT_IMPACT.DISPUTE_WON;
      e.riskWeight = 1;
      e.modelVersion = MODEL_VERSION;
      e.operatorType = payload.operatorType || 'system';
      await this.eventRepo.save(e);
    }
    if (!loserExists) {
      const e = new CreditEventEntity();
      e.userId = payload.loserUserId;
      e.actorRole = payload.loserActorRole;
      e.relatedOrderId = payload.orderId;
      e.eventType = CreditEventType.DISPUTE_LOST;
      e.impactScore = CREDIT_IMPACT.DISPUTE_LOST;
      e.riskWeight = 1;
      e.modelVersion = MODEL_VERSION;
      e.operatorType = payload.operatorType || 'system';
      await this.eventRepo.save(e);
    }
  }

  /** 记录欺诈确认 */
  async recordFraudConfirmed(payload: FraudConfirmedPayload): Promise<CreditEventEntity> {
    const entity = new CreditEventEntity();
    entity.userId = payload.userId;
    entity.actorRole = payload.actorRole;
    entity.relatedOrderId = payload.orderId;
    entity.eventType = CreditEventType.FRAUD_CONFIRMED;
    entity.impactScore = CREDIT_IMPACT.FRAUD;
    entity.riskWeight = 1;
    entity.modelVersion = MODEL_VERSION;
    entity.operatorType = payload.operatorType || 'manual';
    entity.metadata = { reason: payload.reason };
    return this.eventRepo.save(entity);
  }

  /** 记录人工调整 */
  async recordManualAdjustment(payload: ManualAdjustmentPayload): Promise<CreditEventEntity> {
    const entity = new CreditEventEntity();
    entity.userId = payload.userId;
    entity.actorRole = payload.actorRole;
    entity.relatedOrderId = payload.relatedOrderId;
    entity.eventType = payload.eventType;
    entity.impactScore = payload.impactScore;
    entity.riskWeight = 1;
    entity.modelVersion = MODEL_VERSION;
    entity.operatorType = payload.operatorType || 'manual';
    entity.metadata = { reason: payload.reason };
    return this.eventRepo.save(entity);
  }
}
