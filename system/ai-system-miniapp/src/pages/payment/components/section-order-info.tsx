import { PriceText } from '@/components/price-text';
import { View, Text } from '@tarojs/components';

export function SectionOrderInfo({ orderInfo }: { orderInfo?: MyApi.OutputRentalOrderDto | null }) {
  if (!orderInfo) {
    return null;
  }
  return (
    <>
      <View className="flex items-center justify-between mb-4 relative z-10">
        <View className="flex items-center">
          <View className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-teal-100">
            <Text className="text-lg">💰</Text>
          </View>
          <Text className="text-gray-500 text-sm">{orderInfo.isProductPurchase ? '商品金额' : '租金金额'}</Text>
        </View>
        <PriceText price={orderInfo.firstPaymentAmount} />
      </View>
      {orderInfo.orderNo && (
        <View className="pt-4 border-t border-gray-100 relative z-10">
          <View className="flex items-center justify-between">
            <Text className="text-gray-500 text-sm">订单编号</Text>
            <Text className="text-gray-800 text-sm font-mono">{orderInfo.orderNo}</Text>
          </View>
        </View>
      )}
      <View className="pt-3 mt-3 border-t border-gray-100 relative z-10">
        <View className="flex items-center justify-between">
          <Text className="text-gray-500 text-sm">支付状态</Text>
          <View
            className={`px-3 py-1 rounded-full ${
              orderInfo.payStatus === 'completed'
                ? 'bg-green-100 text-green-600'
                : orderInfo.status === 'created'
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Text className="text-xs font-medium">{orderInfo.statusLabel}</Text>
          </View>
        </View>
      </View>
    </>
  );
}
