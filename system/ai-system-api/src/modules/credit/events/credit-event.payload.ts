import { CreditEventType, CreditActorRole } from '../enums';

/** 信用事件载荷基类 */
export interface BaseCreditEventPayload {
  userId: string;
  actorRole: CreditActorRole;
  relatedOrderId?: string;
  operatorType?: 'system' | 'manual';
}

/** 订单完成事件 */
export interface OrderCompletedPayload extends BaseCreditEventPayload {
  orderId: string;
}

/** 订单逾期事件 */
export interface OrderOverduePayload extends BaseCreditEventPayload {
  orderId: string;
  /** 逾期天数 */
  overdueDays?: number;
  /** 是否严重逾期（>7天或分期连续2期+） */
  isSevere?: boolean;
  /** 分期连续逾期期数 */
  consecutiveOverduePeriods?: number;
}

/** 押金扣除事件 */
export interface DepositDeductedPayload extends BaseCreditEventPayload {
  orderId: string;
  deductionId: string;
  amount?: number;
}

/** 争议开启事件 */
export interface DisputeOpenedPayload extends BaseCreditEventPayload {
  orderId: string;
  /** 争议发起方：lessor 出租方拒绝归还/拒绝取消 / lessee 承租方 */
  initiatorRole?: CreditActorRole;
}

/** 争议裁决事件 */
export interface DisputeResolvedPayload extends BaseCreditEventPayload {
  orderId: string;
  /** 胜诉方 userId */
  winnerUserId: string;
  /** 败诉方 userId */
  loserUserId: string;
  /** 胜诉方角色 */
  winnerActorRole: CreditActorRole;
  /** 败诉方角色 */
  loserActorRole: CreditActorRole;
}

/** 欺诈确认事件 */
export interface FraudConfirmedPayload extends BaseCreditEventPayload {
  orderId?: string;
  reason?: string;
}

/** 人工调整事件 */
export interface ManualAdjustmentPayload extends BaseCreditEventPayload {
  eventType: CreditEventType;
  impactScore: number;
  reason?: string;
}
