import { PriceText } from '@/components/price-text';
import { View, Text } from '@tarojs/components';
import { PaymentStatusBadge } from './payment-status-badge';

export function SectionRenewalInfo({
  paymentInfo,
  orderInfo,
}: {
  paymentInfo?: MyApi.OutputPaymentDto | null;
  orderInfo?: MyApi.OutputRentalOrderDto | null;
}) {
  if (!orderInfo || !paymentInfo) {
    return null;
  }
  return (
    <>
      <View className="flex items-center justify-between mb-4 relative z-10">
        <View className="flex items-center">
          <View className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
            <Text className="text-lg">⏰</Text>
          </View>
          <Text className="text-gray-500 text-sm">续租金额</Text>
        </View>
        <PriceText price={paymentInfo.totalPayableAmount} />
      </View>

      {paymentInfo.renewalInfo && (
        <View className="pt-4 border-t border-gray-100 relative z-10">
          <View className="flex items-center justify-between mb-3">
            <Text className="text-gray-500 text-sm">续租时长</Text>
            <Text className="text-purple-600 text-sm font-semibold">
              {paymentInfo.renewalInfo.duration} {orderInfo?.durationUnitLabel}
            </Text>
          </View>
        </View>
      )}

      <View className="pt-3 mt-3 border-t border-gray-100 relative z-10">
        <View className="flex items-center justify-between">
          <Text className="text-gray-500 text-sm">订单编号</Text>
          <Text className="text-gray-800 text-sm font-mono">{paymentInfo.orderNo || orderInfo?.orderNo || '-'}</Text>
        </View>
      </View>

      {paymentInfo.paymentNo && (
        <View className="pt-3 mt-3 border-t border-gray-100 relative z-10">
          <View className="flex items-center justify-between">
            <Text className="text-gray-500 text-sm">支付单号</Text>
            <Text className="text-gray-800 text-sm font-mono">{paymentInfo.paymentNo}</Text>
          </View>
        </View>
      )}

      <View className="pt-3 mt-3 border-t border-gray-100 relative z-10">
        <View className="flex items-center justify-between">
          <Text className="text-gray-500 text-sm">支付状态</Text>
          <PaymentStatusBadge status={paymentInfo.status} statusLabel={paymentInfo.statusLabel} />
        </View>
      </View>
    </>
  );
}
