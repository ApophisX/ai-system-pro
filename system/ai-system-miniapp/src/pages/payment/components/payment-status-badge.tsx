import { View, Text } from '@tarojs/components';

type PaymentStatus =
  | 'generating'
  | 'pending'
  | 'due'
  | 'paid'
  | 'overdue'
  | 'canceled'
  | 'closed'
  | 'expired'
  | 'partial_paid'
  | 'completed';

export function PaymentStatusBadge({ status, statusLabel }: { status?: PaymentStatus | null; statusLabel?: string }) {
  const className =
    status === 'completed' || status === 'paid'
      ? 'bg-green-100 text-green-600'
      : status === 'pending' || status === 'due' || status === 'generating'
        ? 'bg-orange-100 text-orange-600'
        : status === 'overdue' || status === 'expired'
          ? 'bg-red-100 text-red-600'
          : status === 'canceled' || status === 'closed'
            ? 'bg-gray-100 text-gray-600'
            : 'bg-gray-100 text-gray-600';

  return (
    <View className={`px-3 py-1 rounded-full ${className}`}>
      <Text className="text-xs font-medium">{statusLabel || '未知'}</Text>
    </View>
  );
}
