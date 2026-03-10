/**
 * 功能列表项与功能组
 */

import MyIcon from '@/components/my-icon';
import { View, Text } from '@tarojs/components';

export interface FunctionItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  badge?: string | number;
  onClick: () => void;
  color?: string;
}

export function Badge({ children, badge }: { children: React.ReactNode; badge: string | number }) {
  if (badge === 0 || badge === undefined || badge === null || badge === '') {
    return <View className="relative">{children}</View>;
  }

  let badgeText = badge;
  if (typeof badge === 'number') {
    badgeText = badge > 99 ? '99+' : badge.toString();
  }

  return (
    <View className="relative">
      {children}
      <View
        className="absolute top-[-16px] right-[-32px] px-2 py-0.5 rounded-full min-w-[20px] items-center justify-center text-xs font-bold text-white"
        style={{ backgroundColor: 'red', zIndex: 100 }}
      >
        {badge}
      </View>
    </View>
  );
}

export function FunctionItem({ icon, title, subtitle, badge, onClick, color = '#6366f1' }: FunctionItemProps) {
  return (
    <View
      className="flex flex-row items-center py-4 pl-4 rounded-xl mb-1 active:bg-gray-50"
      hoverClass="bg-gray-50"
      onClick={onClick}
    >
      <View
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <Text className="text-lg">{icon}</Text>
      </View>
      <View className="flex-1 ml-3 min-w-0 flex flex-col">
        <Text className="text-gray-900 font-medium">{title}</Text>
        {subtitle && <Text className="text-gray-500 text-sm mt-0.5">{subtitle}</Text>}
      </View>
      {badge !== undefined && badge !== null && (
        <View
          className="px-2 py-0.5 rounded-full min-w-[20px] items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Text className="text-xs font-bold" style={{ color }}>
            {badge}
          </Text>
        </View>
      )}
      <MyIcon name="IconArrowForward" size={24} color="#6366f1" />
      {/* <Text className="text-gray-400 ml-1">›</Text> */}
    </View>
  );
}

export function FunctionGridItem(props: FunctionItemProps) {
  const { icon, title, subtitle, badge, onClick, color = '#6366f1' } = props;
  return (
    <View
      className="flex flex-col items-center justify-center p-4 bg-white active:bg-gray-50 hover:bg-gray-50"
      hoverClass="opacity-80"
      hoverStayTime={100}
      onClick={onClick}
    >
      <Badge badge={badge || 0}>
        <Text className="text-2xl mb-2">{icon}</Text>
      </Badge>
      <Text className="text-xs font-semibold text-gray-500">{title}</Text>
    </View>
  );
}

export interface FunctionGroupProps {
  title: string;
  items: Array<Omit<FunctionItemProps, 'color'> & { color?: string }>;
}

export function FunctionGroup({ title, items }: FunctionGroupProps) {
  return (
    <View className="mb-4 rounded-2xl overflow-hidden bg-white shadow-sm">
      <View className="px-4 py-3 bg-gray-50">
        <Text className="text-sm font-bold text-gray-600">{title}</Text>
      </View>
      {/* <View className="px-2 py-1">
        {items.map(item => (
          <FunctionItem key={item.title} {...item} color={item.color || '#6366f1'} />
        ))}
      </View> */}
      <View className="grid grid-cols-4 gap-2">
        {items.map(item => (
          <FunctionGridItem key={item.title} {...item} color={item.color || '#6366f1'} />
        ))}
      </View>
    </View>
  );
}
