/**
 * 订单空状态组件
 */

import { View, Text } from '@tarojs/components';

export function OrderEmptyState() {
  return (
    <View className="py-20 flex flex-col items-center justify-center">
      <Text className="text-6xl mb-6">📋</Text>
      <Text className="text-gray-600 font-semibold text-base mb-2">暂无订单</Text>
      <Text className="text-gray-400 text-sm">您还没有相关的租赁订单记录</Text>
    </View>
  );
}
