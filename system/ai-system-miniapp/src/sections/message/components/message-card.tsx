/**
 * 消息卡片与骨架屏组件
 */

import { View, Text } from '@tarojs/components';
import { fToNow, ICON_MAP } from './constants';

export function MessageCardSkeleton() {
  return (
    <View className="p-4 bg-white rounded-xl mb-3 flex flex-row">
      <View className="w-11 h-11 rounded-full bg-gray-200 flex-shrink-0" />
      <View className="flex-1 ml-3">
        <View className="h-4 bg-gray-200 rounded w-3/5 mb-2" />
        <View className="h-3 bg-gray-200 rounded w-full mb-1" />
        <View className="h-3 bg-gray-200 rounded w-1/3" />
      </View>
    </View>
  );
}

export interface MessageCardProps {
  msg: MyApi.OutputMessageDto;
  onClick: () => void;
}

export function MessageCard({ msg, onClick }: MessageCardProps) {
  const icon = ICON_MAP[msg.type] ?? '📩';

  return (
    <View
      className="relative p-4 bg-white rounded-xl mb-3 flex flex-row active:bg-gray-50"
      hoverClass="bg-gray-50"
      onClick={onClick}
    >
      <View
        className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
          msg.isUnread ? 'bg-blue-100' : 'bg-gray-100'
        }`}
      >
        <Text className="text-xl">{icon}</Text>
      </View>
      <View className="flex-1 ml-3 min-w-0">
        <View className="flex flex-row justify-between items-center mb-1">
          <Text
            className={`flex-1 text-sm truncate ${
              msg.isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'
            }`}
          >
            {msg.title}
          </Text>
          <Text className="text-gray-400 text-xs flex-shrink-0 ml-2">{fToNow(msg.createdAt)}</Text>
        </View>
        <Text className="text-gray-500 text-sm line-clamp-2 break-all">{msg.content}</Text>
      </View>
      {msg.isUnread && <View className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500" />}
    </View>
  );
}
