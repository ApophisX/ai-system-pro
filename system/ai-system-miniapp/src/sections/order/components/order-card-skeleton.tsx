/**
 * 订单卡片骨架屏
 */

import { View } from '@tarojs/components';

export function OrderCardSkeleton() {
  return (
    <View className="p-4 bg-white rounded-2xl mb-3">
      <View className="flex flex-row items-center justify-between mb-4">
        <View className="h-5 bg-gray-200 rounded w-28" />
        <View className="h-5 bg-gray-200 rounded w-16" />
      </View>

      <View className="flex flex-row gap-3 mb-4">
        <View className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0" />
        <View className="flex-1">
          <View className="h-4 bg-gray-200 rounded w-4/5 mb-2" />
          <View className="h-3 bg-gray-200 rounded w-3/5 mb-1" />
          <View className="h-3 bg-gray-200 rounded w-2/5" />
        </View>
      </View>

      <View className="flex flex-row justify-end mb-4">
        <View className="h-6 bg-gray-200 rounded w-24" />
      </View>

      <View className="border-t border-dashed border-gray-200 my-4" />

      <View className="flex flex-row justify-end gap-2">
        <View className="h-8 bg-gray-200 rounded-full w-20" />
        <View className="h-8 bg-gray-200 rounded-full w-20" />
      </View>
    </View>
  );
}
