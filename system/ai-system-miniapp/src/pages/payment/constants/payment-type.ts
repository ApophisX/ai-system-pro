export const PAYMENT_TYPES = ['order', 'deposit', 'installment', 'overdue-fee', 'renewal'] as const;

export type PaymentType = (typeof PAYMENT_TYPES)[number];

export type PaymentTypeConfig = {
  title: string;
  icon: string;
  color: string;
  bgGradient: string;
};

// 支付类型配置
export const PAYMENT_TYPE_CONFIG: Record<PaymentType, PaymentTypeConfig> = {
  order: {
    title: '订单支付',
    icon: '💳',
    color: 'from-teal-600 to-teal-500',
    bgGradient: 'from-teal-50 to-white',
  },
  deposit: {
    title: '押金支付',
    icon: '🔒',
    color: 'from-blue-600 to-blue-500',
    bgGradient: 'from-blue-50 to-white',
  },
  installment: {
    title: '账单支付',
    icon: '📅',
    color: 'from-purple-600 to-purple-500',
    bgGradient: 'from-purple-50 to-white',
  },
  'overdue-fee': {
    title: '超时费用支付',
    icon: '💰',
    color: 'from-red-600 to-red-500',
    bgGradient: 'from-red-50 to-white',
  },
  renewal: {
    title: '续租费用支付',
    icon: '⏰',
    color: 'from-purple-600 to-purple-500',
    bgGradient: 'from-purple-50 to-white',
  },
};
