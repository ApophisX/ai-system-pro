import { PriceText } from '@/components/price-text';
import { View, Text } from '@tarojs/components';
import { PaymentStatusBadge } from './payment-status-badge';

export function SectionInstallmentInfo({
  orderInfo,
  paymentInfo,
}: {
  orderInfo?: MyApi.OutputRentalOrderDto | null;
  paymentInfo?: MyApi.OutputPaymentDto | null;
}) {
  if (!orderInfo || !paymentInfo) {
    return null;
  }
  return (
    <>
      <View className="flex items-center justify-between mb-4 relative z-10">
        <View className="flex items-center">
          <View className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
            <Text className="text-lg">📅</Text>
          </View>
          <Text className="text-gray-500 text-sm">本期金额</Text>
        </View>
        <PriceText price={paymentInfo.totalPayableAmount} />
      </View>
      {orderInfo.isInstallment && (
        <>
          <View className="pt-4 border-t border-gray-100 relative z-10">
            <View className="flex items-center justify-between mb-3">
              <Text className="text-gray-500 text-sm">总期数</Text>
              <Text className="text-gray-800 text-sm font-semibold">{orderInfo.rentalPeriod || '-'} 期</Text>
            </View>
            <View className="flex items-center justify-between mb-3">
              <Text className="text-gray-500 text-sm">当前期数</Text>
              <Text className="text-purple-600 text-sm font-semibold">第 {paymentInfo.periodIndex ?? '-'} 期</Text>
            </View>
            <View className="flex items-center justify-between">
              <Text className="text-gray-500 text-sm">已完成期数</Text>
              <Text className="text-gray-800 text-sm">{orderInfo.completedPeriodCount || 0} 期</Text>
            </View>
          </View>
          <View className="pt-3 mt-3 border-t border-gray-100 relative z-10">
            <View className="flex items-center justify-between mb-3">
              <Text className="text-gray-500 text-sm">已支付金额</Text>
              <PriceText color="text-green-600" price={orderInfo.paidAmount || 0} />
            </View>
            <View className="flex items-center justify-between">
              <Text className="text-gray-500 text-sm">未支付金额</Text>
              <PriceText color="text-orange-600 font-semibold" price={orderInfo.unpaidAmount || 0} />
            </View>
          </View>
        </>
      )}
      {orderInfo.orderNo && (
        <View className="pt-3 mt-3 border-t border-gray-100 relative z-10">
          <View className="flex items-center justify-between">
            <Text className="text-gray-500 text-sm">订单编号</Text>
            <Text className="text-gray-800 text-sm font-mono">{orderInfo.orderNo}</Text>
          </View>
        </View>
      )}
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
          <PaymentStatusBadge
            status={paymentInfo.status}
            statusLabel={paymentInfo.statusLabel || orderInfo.statusLabel}
          />
        </View>
      </View>
    </>
  );
}
