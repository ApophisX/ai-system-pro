/**
 * 骨架卡片
 */

import { View } from '@tarojs/components';

interface SkeletonCardProps {
  index: number;
}

export function SkeletonCard({ index }: SkeletonCardProps) {
  const imgH = index % 2 === 0 ? 160 : 140;
  return (
    <View className="bg-white rounded-xl overflow-hidden shadow-sm mb-3">
      <View className="bg-gray-200" style={{ height: imgH }} />
      <View className="p-3">
        <View className="h-4 bg-gray-200 rounded w-4/5 mb-2" />
        <View className="h-4 bg-gray-200 rounded w-3/5 mb-3" />
        <View className="flex flex-row justify-between">
          <View className="h-5 bg-gray-200 rounded w-16" />
          <View className="h-5 w-5 rounded-full bg-gray-200" />
        </View>
      </View>
    </View>
  );
}
