import { PriceText } from '@/components/price-text';
import { View, Text } from '@tarojs/components';

export function SectionDepositInfo({ orderInfo }: { orderInfo?: MyApi.OutputRentalOrderDto | null }) {
  if (!orderInfo) {
    return null;
  }
  return (
    <>
      <View className="flex items-center justify-between mb-4 relative z-10">
        <View className="flex items-center">
          <View className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <Text className="text-lg">🔒</Text>
          </View>
          <Text className="text-gray-500 text-sm">押金金额</Text>
        </View>
        <PriceText price={orderInfo.depositAmount} />
      </View>
      {orderInfo.orderNo && (
        <View className="pt-3 mt-3 border-t border-gray-100 relative z-10">
          <View className="flex items-center justify-between">
            <Text className="text-gray-500 text-sm">关联订单</Text>
            <Text className="text-gray-800 text-sm font-mono">{orderInfo.orderNo}</Text>
          </View>
        </View>
      )}
    </>
  );
}
