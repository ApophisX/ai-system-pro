import { PriceText } from '@/components/price-text';
import { View, Text } from '@tarojs/components';

export function SectionOverdueFeeInfo({ orderInfo }: { orderInfo?: MyApi.OutputRentalOrderDto | null }) {
  if (!orderInfo) {
    return null;
  }
  return (
    <>
      <View className="flex items-center justify-between mb-4 relative z-10">
        <View className="flex items-center">
          <View className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
            <Text className="text-lg">⏰</Text>
          </View>
          <Text className="text-gray-500 text-sm">超时使用费用</Text>
        </View>
        <PriceText price={orderInfo.overdueUseAmount || 0} />
      </View>

      <View className="pt-4 border-t border-gray-100 relative z-10">
        <View className="flex items-center justify-between mb-3">
          <Text className="text-gray-500 text-sm">超时使用时长</Text>
          <Text className="text-red-600 text-sm font-semibold">{orderInfo.overdueUseTimeLabel}</Text>
        </View>
        <View className="flex items-center justify-between mb-3">
          <Text className="text-gray-500 text-sm">计时费用标准</Text>
          <Text className="text-gray-800 text-sm">
            {orderInfo.rentalPlanJson?.overdueFee
              ? `${orderInfo.rentalPlanJson.overdueFee} 元/${orderInfo.rentalPlanJson.overdueFeeUnitLabel || '天'}`
              : '-'}
          </Text>
        </View>
        <View className="flex items-center justify-between">
          <Text className="text-gray-500 text-sm">已支付超时费用</Text>
          <View className="text-green-600">
            <PriceText color="text-green-600" price={orderInfo.overdueFeePaidAmount || 0} />
          </View>
        </View>
      </View>

      {orderInfo.totalPaymentOverdueAmount > 0 && (
        <View className="pt-3 mt-3 border-t border-gray-100 relative z-10">
          <View className="flex items-center justify-between mb-2">
            <Text className="text-gray-500 text-sm">账单逾期费用</Text>
            <View className="text-orange-600">
              <PriceText price={orderInfo.totalPaymentOverdueAmount} />
            </View>
          </View>
          <View className="bg-orange-50 rounded-lg p-3 mt-2">
            <Text className="text-orange-700 text-xs leading-relaxed">
              包含逾期违约金和逾期罚金，请尽快支付以避免产生更多费用
            </Text>
          </View>
        </View>
      )}

      {orderInfo.orderNo && (
        <View className="pt-3 mt-3 border-t border-gray-100 relative z-10">
          <View className="flex items-center justify-between mb-3">
            <Text className="text-gray-500 text-sm">订单编号</Text>
            <Text className="text-gray-800 text-sm font-mono">{orderInfo.orderNo}</Text>
          </View>
        </View>
      )}

      <View className="pt-3 mt-3 border-t border-gray-100 relative z-10">
        <View className="flex items-center justify-between">
          <Text className="text-gray-500 text-sm">订单状态</Text>
          <View className="px-3 py-1 rounded-full bg-red-100">
            <Text className="text-xs font-medium text-red-600">{orderInfo.overdueStatusLabel || '超时使用'}</Text>
          </View>
        </View>
      </View>
    </>
  );
}
