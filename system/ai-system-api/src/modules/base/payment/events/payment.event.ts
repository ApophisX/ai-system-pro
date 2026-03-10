/**
 * 支付事件定义
 *
 * 用于支付模块与其他模块（如订单模块）之间的解耦通信
 * 通过事件驱动的方式，避免模块间的循环依赖
 *
 * 使用示例：
 * 1. 发射事件（支付服务）:
 *    this.eventEmitter.emit(PaymentEvents.COMPLETED, new PaymentCompletedEvent(...));
 *
 * 2. 订阅事件（订单服务）:
 *    @OnEvent(PaymentEvents.COMPLETED)
 *    async handlePaymentCompleted(event: PaymentCompletedEvent) { ... }
 */

/**
 * 支付事件名称常量
 *
 * 使用常量而非字符串，确保事件名称一致性，避免拼写错误
 */
export const PaymentEvents = {
  /** 支付完成事件 */
  COMPLETED: 'payment.completed',
  /** 支付失败事件 */
  FAILED: 'payment.failed',
  /** 支付押金完成事件 */
  PAY_DEPOSIT_COMPLETED: 'payment.pay.deposit.completed',
  /** 支付押金失败事件 */
  PAY_DEPOSIT_FAILED: 'payment.pay.deposit.failed',
  /** 冻结押金成功事件 */
  FROZEN_DEPOSIT_COMPLETED: 'payment.frozen.deposit.completed',
  /** 冻结押金失败事件 */
  FROZEN_DEPOSIT_FAILED: 'payment.frozen.deposit.failed',
  /** 退款完成事件 */
  REFUND_COMPLETED: 'payment.refund.completed',
  /** 退款失败事件 */
  REFUND_FAILED: 'payment.refund.failed',
  /** 押金退款完成事件 */
  DEPOSIT_REFUND_COMPLETED: 'payment.deposit.refund.completed',
  /** 押金退款失败事件 */
  DEPOSIT_REFUND_FAILED: 'payment.deposit.refund.failed',
  /** 超时使用费支付完成事件 */
  PAY_OVERDUE_FEE_COMPLETED: 'payment.pay.overdue_fee.completed',
} as const;

/** 支付事件名称类型 */
export type PaymentEventType = (typeof PaymentEvents)[keyof typeof PaymentEvents];

/**
 * 支付事件基类
 *
 * 包含所有支付事件的公共字段
 */
export abstract class BasePaymentEvent {
  /** 事件创建时间 */
  public readonly timestamp: Date;

  constructor(
    /** 支付单号（平台内部） */
    public readonly paymentNo: string | null,
    /** 关联订单号 */
    public readonly orderNo: string | null,
    /** 第三方支付流水号 */
    public readonly thirdPartyPaymentNo: string,
  ) {
    this.timestamp = new Date();
  }
}

/**
 * 支付完成事件
 *
 * 当支付成功完成时发射此事件
 * 订阅者可以据此更新订单状态、发送通知等
 */
export class PaymentCompletedEvent extends BasePaymentEvent {
  /** 事件类型标识 */
  public readonly eventType = PaymentEvents.COMPLETED;

  constructor(
    paymentNo: string,
    orderNo: string | null,
    thirdPartyPaymentNo: string,
    /** 支付金额 */
    public readonly amount: number,
    /** 支付记录 ID */
    public readonly paymentRecordId: string,
    /** 支付完成时间 */
    public readonly paidAt: Date,
    /** 原始回调数据（用于审计和问题排查） */
    public readonly callbackData?: Record<string, any>,
    /** 支付类型（用于续租等场景分支处理） */
    public readonly paymentType?: string,
  ) {
    super(paymentNo, orderNo, thirdPartyPaymentNo);
  }
}

/**
 * 支付失败事件
 *
 * 当支付失败时发射此事件
 * 订阅者可以据此更新订单状态、发送失败通知等
 */
export class PaymentFailedEvent extends BasePaymentEvent {
  /** 事件类型标识 */
  public readonly eventType = PaymentEvents.FAILED;

  constructor(
    paymentNo: string,
    orderNo: string | null,
    thirdPartyPaymentNo: string,
    /** 支付记录 ID */
    public readonly paymentRecordId: string,
    /** 失败原因 */
    public readonly failureReason?: string,
    /** 原始回调数据 */
    public readonly callbackData?: Record<string, any>,
  ) {
    super(paymentNo, orderNo, thirdPartyPaymentNo);
  }
}

/**
 * 支付押金完成事件
 */
export class PayDepositCompletedEvent extends BasePaymentEvent {
  /** 事件类型标识 */
  public readonly eventType = PaymentEvents.PAY_DEPOSIT_COMPLETED;

  constructor(
    // orderNo: string | null,
    thirdPartyPaymentNo: string,
    /** 押金单号 */
    public readonly depositNo: string,
    /** 支付金额 */
    public readonly amount: number,
    /** 支付完成时间 */
    public readonly paidAt: Date,
    /** 原始回调数据 */
    public readonly callbackData?: Record<string, any>,
  ) {
    super(null, null, thirdPartyPaymentNo);
  }
}

/**
 * 支付押金失败事件
 */
export class PayDepositFailedEvent extends BasePaymentEvent {
  /** 事件类型标识 */
  public readonly eventType = PaymentEvents.PAY_DEPOSIT_FAILED;

  constructor(
    // orderNo: string | null,
    thirdPartyPaymentNo: string,
    /** 押金单号 */
    public readonly depositNo: string,
    /** 失败原因 */
    public readonly failureReason?: string,
    /** 原始回调数据 */
    public readonly callbackData?: Record<string, any>,
  ) {
    super(null, null, thirdPartyPaymentNo);
  }
}

/**
 * 超时使用费支付完成事件
 */
export class PayOverdueFeeCompletedEvent extends BasePaymentEvent {
  /** 事件类型标识 */
  public readonly eventType = PaymentEvents.PAY_OVERDUE_FEE_COMPLETED;

  constructor(
    /** 支付记录单号 */
    public readonly recordNo: string,
    /** 订单 ID */
    public readonly orderId: string,
    /** 订单号 */
    orderNo: string | null,
    thirdPartyPaymentNo: string,
    /** 支付金额（元） */
    public readonly amount: number,
    /** 支付完成时间 */
    public readonly paidAt: Date,
    /** 原始回调数据 */
    public readonly callbackData?: Record<string, any>,
  ) {
    super(null, orderNo, thirdPartyPaymentNo);
  }
}

/**
 * 退款完成事件
 */
export class RefundCompletedEvent extends BasePaymentEvent {
  /** 事件类型标识 */
  public readonly eventType = PaymentEvents.REFUND_COMPLETED;

  constructor(
    paymentNo: string,
    orderNo: string | null,
    thirdPartyPaymentNo: string,
    /** 退款单号 */
    public readonly refundNo: string,
    /** 第三方退款流水号 */
    public readonly thirdPartyRefundNo: string,
    /** 退款金额（分） */
    public readonly amount: number,
    /** 退款完成时间 */
    public readonly refundedAt: Date,
    /** 原始回调数据 */
    public readonly callbackData?: Record<string, any>,
  ) {
    super(paymentNo, orderNo, thirdPartyPaymentNo);
  }
}

/**
 * 退款失败事件
 */
export class RefundFailedEvent extends BasePaymentEvent {
  /** 事件类型标识 */
  public readonly eventType = PaymentEvents.REFUND_FAILED;

  constructor(
    paymentNo: string,
    orderNo: string | null,
    thirdPartyPaymentNo: string,
    /** 退款单号 */
    public readonly refundNo: string,
    /** 失败原因 */
    public readonly failureReason?: string,
    /** 原始回调数据 */
    public readonly callbackData?: Record<string, any>,
  ) {
    super(paymentNo, orderNo, thirdPartyPaymentNo);
  }
}

/**
 * 押金退款完成事件
 */
export class DepositRefundCompletedEvent extends BasePaymentEvent {
  /** 事件类型标识 */
  public readonly eventType = PaymentEvents.DEPOSIT_REFUND_COMPLETED;

  constructor(
    orderNo: string | null,
    thirdPartyPaymentNo: string,
    /** 押金单号 */
    public readonly depositNo: string,
    /** 退款单号 */
    public readonly refundNo: string,
    /** 第三方退款流水号 */
    public readonly thirdPartyRefundNo: string,
    /** 退款金额（元） */
    public readonly amount: number,
    /** 退款完成时间 */
    public readonly refundedAt: Date,
    /** 原始回调数据 */
    public readonly callbackData?: Record<string, any>,
  ) {
    super(null, orderNo, thirdPartyPaymentNo);
  }
}

/**
 * 押金退款失败事件
 */
export class DepositRefundFailedEvent extends BasePaymentEvent {
  /** 事件类型标识 */
  public readonly eventType = PaymentEvents.DEPOSIT_REFUND_FAILED;

  constructor(
    orderNo: string | null,
    thirdPartyPaymentNo: string,
    /** 押金单号 */
    public readonly depositNo: string,
    /** 退款单号 */
    public readonly refundNo: string,
    /** 失败原因 */
    public readonly failureReason?: string,
    /** 原始回调数据 */
    public readonly callbackData?: Record<string, any>,
  ) {
    super(null, orderNo, thirdPartyPaymentNo);
  }
}

/**
 * 支付事件联合类型
 *
 * 用于类型安全的事件处理
 */
export type PaymentEvent =
  | PaymentCompletedEvent
  | PaymentFailedEvent
  | RefundCompletedEvent
  | RefundFailedEvent
  | DepositRefundCompletedEvent
  | DepositRefundFailedEvent
  | PayOverdueFeeCompletedEvent;
