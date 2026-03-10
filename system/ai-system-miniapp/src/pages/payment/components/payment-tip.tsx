import { View, Text } from '@tarojs/components';
import type { PaymentType } from '../constants';

const TIP_CONFIG: Record<
  PaymentType,
  { icon: string; bgClass: string; iconClass: string; textClass: string; content: string }
> = {
  order: {
    icon: 'ℹ️',
    bgClass: 'bg-blue-50 border-blue-200',
    iconClass: 'text-blue-500',
    textClass: 'text-blue-700',
    content: '请确认订单信息后完成支付，支付成功后系统将自动处理订单',
  },
  deposit: {
    icon: 'ℹ️',
    bgClass: 'bg-blue-50 border-blue-200',
    iconClass: 'text-blue-500',
    textClass: 'text-blue-700',
    content: '请确认押金信息后完成支付，押金将在订单结束后退还',
  },
  installment: {
    icon: 'ℹ️',
    bgClass: 'bg-purple-50 border-purple-200',
    iconClass: 'text-purple-500',
    textClass: 'text-purple-700',
    content: '请确认分期信息后完成支付，支付成功后系统将自动处理本期账单',
  },
  'overdue-fee': {
    icon: '⚠️',
    bgClass: 'bg-red-50 border-red-200',
    iconClass: 'text-red-500',
    textClass: 'text-red-700',
    content:
      '请尽快支付超期使用费用，继续超期将产生更多费用。请及时归还资产以停止计费',
  },
  renewal: {
    icon: 'ℹ️',
    bgClass: 'bg-purple-50 border-purple-200',
    iconClass: 'text-purple-500',
    textClass: 'text-purple-700',
    content:
      '请确认续租信息后完成支付，支付成功后租期将自动延长。续租支付单有过期时间，请及时完成支付',
  },
};

export function PaymentTip({ paymentType }: { paymentType: PaymentType }) {
  const config = TIP_CONFIG[paymentType];

  return (
    <View className={`border rounded-xl p-4 mb-6 ${config.bgClass}`}>
      <View className="flex items-start">
        <Text className={`text-lg mr-2 ${config.iconClass}`}>{config.icon}</Text>
        <Text className={`text-sm leading-relaxed flex-1 ${config.textClass}`}>
          {config.content}
        </Text>
      </View>
    </View>
  );
}
