/**
 * 空状态
 */

import { View, Text } from '@tarojs/components';

interface ListEmptyProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function ListEmpty({ title, description, action }: ListEmptyProps) {
  return (
    <View className="flex flex-col items-center justify-center py-20">
      <Text className="text-4xl mb-4">📦</Text>
      <Text className="text-gray-500 font-medium">{title}</Text>
      {description && <Text className="text-gray-400 text-sm mt-1">{description}</Text>}
      {action && <View className="mt-4">{action}</View>}
    </View>
  );
}
