/**
 * 消息类型 Tab 组件
 */

import { View, Text } from '@tarojs/components';
import { MESSAGE_TABS } from './constants';

export interface MessageTypeTabProps {
  value: string;
  onTabChange: (v: string) => void;
  statusCount: MyApi.OutputUnreadCountByTypeDto;
  totalCount: number;
}

export function MessageTypeTab({ value, onTabChange, statusCount, totalCount }: MessageTypeTabProps) {
  return (
    <View className="flex flex-row bg-white border-b border-gray-100 sticky top-0 z-10">
      {MESSAGE_TABS.map(tab => {
        const count = tab.countKey === 'total' ? totalCount : (statusCount[tab.countKey] ?? 0);
        const isActive = value === tab.value;
        return (
          <View
            key={tab.value}
            className={`flex-1 py-3 flex flex-col items-center justify-center ${
              isActive ? 'border-b-2 border-blue-500' : ''
            }`}
            hoverClass="opacity-80"
            onClick={() => onTabChange(tab.value)}
          >
            <View className="flex flex-row items-center gap-1">
              <Text className={`text-sm font-medium ${isActive ? 'text-blue-500' : 'text-gray-600'}`}>{tab.label}</Text>
              {count > 0 && (
                <View className="min-w-[40px] h-[40px] rounded-full bg-red-500 flex items-center justify-center px-1">
                  <Text className="text-white text-xs font-bold">{count > 99 ? '99+' : count}</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
