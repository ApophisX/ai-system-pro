import { View, Text } from '@tarojs/components';

export function ErrorPlaceholder() {
  return (
    <View className="bg-white rounded-2xl p-8 mb-4 shadow-lg border border-gray-100">
      <View className="text-center">
        <Text className="text-gray-400 text-sm">订单信息加载失败</Text>
      </View>
    </View>
  );
}
