import { View, Text } from '@tarojs/components';

export function ErrorMessage({ message }: { message: string }) {
  return (
    <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 animate-fade-in flex items-center">
      <View className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
        <Text className="text-red-500 text-xs">⚠</Text>
      </View>
      <View className="text-red-600 text-sm flex-1 leading-relaxed">{message}</View>
    </View>
  );
}
