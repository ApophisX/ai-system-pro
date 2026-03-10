/**
 * 消息中心 - 常量、Mock 数据、工具函数
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// ----------------------------------------------------------------------
// 路径常量
// ----------------------------------------------------------------------

export const MESSAGE_PATHS = {
  my: {
    orderDetail: (id: string) => `/my/orders/${id}`,
  },
  lessor: {
    order: {
      detail: (id: string) => `/lessor/order/detail/${id}`,
    },
  },
};

// ----------------------------------------------------------------------
// 工具函数
// ----------------------------------------------------------------------

export function fToNow(input: string): string {
  if (!input) return '';
  const date = dayjs(input);
  if (!date.isValid()) return '';
  if (dayjs().diff(date, 'day') > 3) {
    return date.format('MM-DD HH:mm');
  }
  return date.toNow(true) + '前';
}

// ----------------------------------------------------------------------
// Tab 配置
// ----------------------------------------------------------------------

export const MESSAGE_TABS = [
  { value: 'all', label: '全部', countKey: 'total' as const },
  { value: 'SYSTEM', label: '通知', countKey: 'system' as const },
  { value: 'ORDER', label: '订单', countKey: 'order' as const },
];

export const ICON_MAP: Record<string, string> = {
  SYSTEM: '🔔',
  ORDER: '📋',
  USER: '👤',
  VERIFICATION: '🛡️',
  PAYMENT: '💰',
  ASSET: '📦',
  REVIEW: '⭐',
};

// ----------------------------------------------------------------------
// MOCK 数据（符合 MyApi 接口定义）
// ----------------------------------------------------------------------

export const MOCK_UNREAD_COUNT: MyApi.OutputUnreadCountByTypeDto = {
  system: 2,
  order: 3,
};

export const MOCK_MESSAGES: MyApi.OutputMessageDto[] = [
  {
    createdAt: '2025-02-22T10:30:00.000Z',
    updatedAt: '2025-02-22T10:30:00.000Z',
    id: 'msg-001',
    userId: 'u-mock-001',
    type: 'ORDER',
    title: '订单待支付提醒',
    content: '您有一个订单待支付，请尽快完成支付以免影响使用。订单号：ORD202502220001',
    status: 'UNREAD',
    relatedId: 'order-001',
    relatedType: 'ORDER',
    extra: { orderId: 'order-001', lessorId: 'lessor-001', lesseeId: 'u-mock-001' },
    readAt: undefined,
    isUnread: true,
    isRead: false,
  },
  {
    createdAt: '2025-02-22T09:15:00.000Z',
    updatedAt: '2025-02-22T09:15:00.000Z',
    id: 'msg-002',
    userId: 'u-mock-001',
    type: 'SYSTEM',
    title: '系统通知',
    content: '寻物租赁平台将于今晚 22:00-24:00 进行系统维护，期间可能无法正常使用，请提前安排。',
    status: 'UNREAD',
    relatedId: undefined,
    relatedType: undefined,
    extra: undefined,
    readAt: undefined,
    isUnread: true,
    isRead: false,
  },
  {
    createdAt: '2025-02-21T16:20:00.000Z',
    updatedAt: '2025-02-21T16:20:00.000Z',
    id: 'msg-003',
    userId: 'u-mock-001',
    type: 'ORDER',
    title: '订单已发货',
    content: '您的订单已发货，请留意收货。订单号：ORD202502210002',
    status: 'READ',
    relatedId: 'order-002',
    relatedType: 'ORDER',
    extra: { orderId: 'order-002', lessorId: 'lessor-001', lesseeId: 'u-mock-001' },
    readAt: { readAt: '2025-02-21T17:00:00.000Z' },
    isUnread: false,
    isRead: true,
  },
  {
    createdAt: '2025-02-21T14:00:00.000Z',
    updatedAt: '2025-02-21T14:00:00.000Z',
    id: 'msg-004',
    userId: 'u-mock-001',
    type: 'PAYMENT',
    title: '支付成功',
    content: '您的订单支付已成功，金额 ¥299.00。',
    status: 'READ',
    relatedId: 'payment-001',
    relatedType: 'PAYMENT',
    extra: { orderId: 'order-002', lessorId: 'lessor-001', lesseeId: 'u-mock-001' },
    readAt: { readAt: '2025-02-21T14:05:00.000Z' },
    isUnread: false,
    isRead: true,
  },
  {
    createdAt: '2025-02-20T11:00:00.000Z',
    updatedAt: '2025-02-20T11:00:00.000Z',
    id: 'msg-005',
    userId: 'u-mock-001',
    type: 'VERIFICATION',
    title: '实名认证通过',
    content: '恭喜您，实名认证已通过，现在可以享受更多平台权益。',
    status: 'READ',
    relatedId: undefined,
    relatedType: undefined,
    extra: undefined,
    readAt: { readAt: '2025-02-20T12:00:00.000Z' },
    isUnread: false,
    isRead: true,
  },
];
