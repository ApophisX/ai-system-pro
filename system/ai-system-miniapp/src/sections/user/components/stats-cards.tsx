/**
 * 统计卡片组件
 */

import Taro, { useDidShow } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { paths, webPaths } from '@/route/paths';

export interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  onClick?: () => void;
  valuePrefix?: string;
}

export function StatCard({ icon, title, value, subtitle, color, onClick, valuePrefix }: StatCardProps) {
  return (
    <View
      className="flex-1 min-w-[45%] p-4 rounded-2xl bg-white shadow-sm border border-gray-100 mb-3"
      style={{ borderTopWidth: 4, borderTopColor: color }}
      hoverClass="opacity-95"
      onClick={onClick}
    >
      <View className="flex flex-row justify-between items-start mb-2">
        <View
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)` }}
        >
          <Text className="text-xl">{icon}</Text>
        </View>
        {subtitle && (
          <View
            className="px-2 py-0.5 rounded text-xs font-bold uppercase"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {subtitle}
          </View>
        )}
      </View>
      <View className="flex flex-row items-baseline gap-1">
        {valuePrefix && <Text className="text-gray-800 font-extrabold text-xs">{valuePrefix}</Text>}
        <Text className="text-gray-900 font-extrabold text-xl tracking-tight">{value}</Text>
      </View>
      <Text className="text-gray-500 text-sm font-medium mt-0.5">{title}</Text>
    </View>
  );
}

const DEFAULT_LESSOR_STATS: MyApi.OutputLessorStatisticsDto = {
  publishedAssetCount: 0,
  totalAssetCount: 0,
  inProgressOrderCount: 0,
  pendingOrderCount: 0,
  totalIncome: 0,
};

export function LessorStatsCards({ stats = DEFAULT_LESSOR_STATS }: { stats?: MyApi.OutputLessorStatisticsDto }) {
  useDidShow(() => {});

  const cards: StatCardProps[] = [
    {
      icon: '📦',
      title: '已发布资产',
      value: stats.publishedAssetCount,
      subtitle: 'Assets',
      color: '#3b82f6',
      onClick: () => {
        Taro.navigateTo({ url: `${paths.webview(webPaths.lessorAssets)}?tab=online` });
      },
    },
    {
      icon: '🛒',
      title: '进行中订单',
      value: stats.inProgressOrderCount,
      subtitle: 'Active',
      color: '#10b981',
      onClick: () => {
        Taro.navigateTo({ url: `${paths.webview(webPaths.lessorOrder)}?status=in_use` });
      },
    },
    {
      icon: '📈',
      title: '累计收入',
      value: `${stats.totalIncome}`,
      valuePrefix: '¥',
      subtitle: 'Income',
      color: '#f59e0b',
      onClick: () => {
        Taro.navigateTo({ url: paths.webview(webPaths.lessorIncome) });
      },
    },
    {
      icon: '📋',
      title: '待处理订单',
      value: stats.pendingOrderCount,
      subtitle: 'Pending',
      color: '#8b5cf6',
      onClick: () => {
        Taro.navigateTo({ url: paths.webview(webPaths.lessorOrderManagement) });
      },
    },
  ];

  return (
    <View className="px-4 mb-4">
      <View className="text-base font-bold text-gray-900 mb-2 px-1">数据看板</View>
      <View className="flex flex-row flex-wrap gap-x-3">
        {cards.map(card => (
          <StatCard key={card.title} {...card} />
        ))}
      </View>
    </View>
  );
}

export function LesseeStatsCards({ stats }: { stats: MyApi.OutputLesseeStatisticsDto }) {
  const cards: StatCardProps[] = [
    {
      icon: '🛒',
      title: '我的订单',
      value: stats.orderCount,
      subtitle: 'Orders',
      color: '#8b5cf6',
      onClick: () => {
        Taro.navigateTo({ url: paths.order.list });
      },
    },
    {
      icon: '💳',
      title: '待支付',
      value: stats.pendingPaymentOrderCount,
      subtitle: 'To Pay',
      color: '#ef4444',
      onClick: () => {
        Taro.navigateTo({ url: `${paths.order.list}?status=created` });
      },
    },
    {
      icon: '💰',
      title: '押金总额',
      value: `¥${stats.totalDepositAmount}`,
      subtitle: 'Deposit',
      color: '#06b6d4',
      onClick: () => {
        Taro.navigateTo({ url: paths.webview(webPaths.myDeposit) });
      },
    },
    {
      icon: '❤️',
      title: '收藏资产',
      value: stats.favoriteAssetCount,
      subtitle: 'Favorites',
      color: '#e2aa53',
      onClick: () => {
        Taro.navigateTo({ url: paths.webview(webPaths.myFavorites) });
      },
    },
  ];

  return (
    <View className="px-4 mb-4">
      <View className="text-base font-bold text-gray-900 mb-2 px-1">数据看板</View>
      <View className="flex flex-row flex-wrap gap-x-3">
        {cards.map(card => (
          <StatCard key={card.title} {...card} />
        ))}
      </View>
    </View>
  );
}
