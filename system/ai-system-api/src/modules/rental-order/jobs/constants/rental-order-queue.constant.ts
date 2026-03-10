/**
 * 租赁订单队列常量
 *
 * 定义订单相关的队列名称
 */

/**
 * 订单超时未支付队列
 */
export const RENTAL_ORDER_PAYMENT_TIMEOUT_QUEUE = 'rental-order-payment-timeout';

/**
 * 订单分期逾期队列
 */
export const RENTAL_ORDER_INSTALLMENT_OVERDUE_QUEUE = 'rental-order-installment-overdue';

/**
 * 订单支付逾期队列（租期到期未归还）
 */
export const RENTAL_ORDER_RENTAL_OVERDUE_QUEUE = 'rental-order-rental-overdue';

/**
 * 押金扣款超时队列（扣款申请超时未响应，触发平台审核）
 */
export const RENTAL_ORDER_DEPOSIT_DEDUCTION_TIMEOUT_QUEUE = 'rental-order-deposit-deduction-timeout';

/**
 * 取消确认超时队列（承租方申请取消，出租方24小时未操作，自动退款）
 */
export const RENTAL_ORDER_CANCEL_CONFIRM_TIMEOUT_QUEUE = 'rental-order-cancel-confirm-timeout';

/**
 * 归还确认超时队列（承租方提交归还，出租方24小时未操作，自动确认归还）
 */
export const RENTAL_ORDER_RETURN_CONFIRM_TIMEOUT_QUEUE = 'rental-order-return-confirm-timeout';
