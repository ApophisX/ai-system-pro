/**
 * 信用事件订阅器
 *
 * 订阅业务领域事件，写入 credit_event 表，触发评分重算
 * 事件不可变，仅追加
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreditEvents } from '../events/credit.events';
import { CreditEventService } from '../services/credit-event.service';
import { CreditScoringService } from '../services/credit-scoring.service';
import type {
  OrderCompletedPayload,
  OrderOverduePayload,
  DepositDeductedPayload,
  DisputeOpenedPayload,
  DisputeResolvedPayload,
  FraudConfirmedPayload,
  ManualAdjustmentPayload,
} from '../events/credit-event.payload';

@Injectable()
export class CreditEventSubscriber {
  private readonly logger = new Logger(CreditEventSubscriber.name);

  constructor(
    private readonly creditEventService: CreditEventService,
    private readonly creditScoringService: CreditScoringService,
  ) {}

  @OnEvent(CreditEvents.ORDER_COMPLETED)
  async handleOrderCompleted(payload: OrderCompletedPayload): Promise<void> {
    try {
      const event = await this.creditEventService.recordOrderCompleted(payload);
      if (event) {
        this.creditScoringService.triggerRecalculate(payload.userId, payload.actorRole);
        this.logger.log(`信用事件已记录: ORDER_COMPLETED, orderId=${payload.orderId}, userId=${payload.userId}`);
      }
    } catch (err) {
      this.logger.error(
        `记录 ORDER_COMPLETED 失败: orderId=${payload.orderId}`,
        err instanceof Error ? err.stack : err,
      );
    }
  }

  @OnEvent(CreditEvents.ORDER_OVERDUE)
  async handleOrderOverdue(payload: OrderOverduePayload): Promise<void> {
    try {
      const event = await this.creditEventService.recordOrderOverdue(payload);
      if (event) {
        this.creditScoringService.triggerRecalculate(payload.userId, payload.actorRole);
        this.logger.log(`信用事件已记录: ORDER_OVERDUE, orderId=${payload.orderId}, userId=${payload.userId}`);
      }
    } catch (err) {
      this.logger.error(`记录 ORDER_OVERDUE 失败: orderId=${payload.orderId}`, err instanceof Error ? err.stack : err);
    }
  }

  @OnEvent(CreditEvents.DEPOSIT_DEDUCTED)
  async handleDepositDeducted(payload: DepositDeductedPayload): Promise<void> {
    try {
      const event = await this.creditEventService.recordDepositDeducted(payload);
      if (event) {
        this.creditScoringService.triggerRecalculate(payload.userId, payload.actorRole);
        this.logger.log(`信用事件已记录: DEPOSIT_DEDUCTED, orderId=${payload.orderId}, userId=${payload.userId}`);
      }
    } catch (err) {
      this.logger.error(
        `记录 DEPOSIT_DEDUCTED 失败: orderId=${payload.orderId}`,
        err instanceof Error ? err.stack : err,
      );
    }
  }

  @OnEvent(CreditEvents.DISPUTE_OPENED)
  async handleDisputeOpened(payload: DisputeOpenedPayload): Promise<void> {
    try {
      const event = await this.creditEventService.recordDisputeOpened(payload);
      if (event) {
        this.creditScoringService.triggerRecalculate(payload.userId, payload.actorRole);
        this.logger.log(`信用事件已记录: DISPUTE_OPENED, orderId=${payload.orderId}, userId=${payload.userId}`);
      }
    } catch (err) {
      this.logger.error(`记录 DISPUTE_OPENED 失败: orderId=${payload.orderId}`, err instanceof Error ? err.stack : err);
    }
  }

  @OnEvent(CreditEvents.DISPUTE_RESOLVED)
  async handleDisputeResolved(payload: DisputeResolvedPayload): Promise<void> {
    try {
      await this.creditEventService.recordDisputeResolved(payload);
      this.creditScoringService.triggerRecalculate(payload.winnerUserId, payload.winnerActorRole);
      this.creditScoringService.triggerRecalculate(payload.loserUserId, payload.loserActorRole);
      this.logger.log(`信用事件已记录: DISPUTE_RESOLVED, orderId=${payload.orderId}`);
    } catch (err) {
      this.logger.error(
        `记录 DISPUTE_RESOLVED 失败: orderId=${payload.orderId}`,
        err instanceof Error ? err.stack : err,
      );
    }
  }

  @OnEvent(CreditEvents.FRAUD_CONFIRMED)
  async handleFraudConfirmed(payload: FraudConfirmedPayload): Promise<void> {
    try {
      await this.creditEventService.recordFraudConfirmed(payload);
      this.creditScoringService.triggerRecalculate(payload.userId, payload.actorRole);
      this.logger.log(`信用事件已记录: FRAUD_CONFIRMED, userId=${payload.userId}`);
    } catch (err) {
      this.logger.error(`记录 FRAUD_CONFIRMED 失败: userId=${payload.userId}`, err instanceof Error ? err.stack : err);
    }
  }

  @OnEvent(CreditEvents.MANUAL_ADJUSTMENT)
  async handleManualAdjustment(payload: ManualAdjustmentPayload): Promise<void> {
    try {
      await this.creditEventService.recordManualAdjustment(payload);
      this.creditScoringService.triggerRecalculate(payload.userId, payload.actorRole);
      this.logger.log(`信用事件已记录: MANUAL_ADJUSTMENT, userId=${payload.userId}, eventType=${payload.eventType}`);
    } catch (err) {
      this.logger.error(
        `记录 MANUAL_ADJUSTMENT 失败: userId=${payload.userId}`,
        err instanceof Error ? err.stack : err,
      );
    }
  }
}
