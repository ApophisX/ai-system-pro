/**
 * 消息列表空状态
 */

import { View, Text } from '@tarojs/components';

export function MessageListEmpty() {
  return (
    <View className="flex flex-col items-center justify-center py-24">
      <Text className="text-5xl mb-4">💬</Text>
      <Text className="text-gray-500 font-medium">暂无消息</Text>
    </View>
  );
}
