/**
 * 订单卡片组件
 */

import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';

const ORDER_DETAIL_PATH = (id: string) => `/my/orders/${id}`;

function getStatusLabel(order: MyApi.OutputRentalOrderDto): string {
  if (order.overdueStatus === 'overdue_use') return '超时使用';
  if (order.overdueStatus === 'overdue') return '订单逾期';
  if (order.payStatus === 'timeout') return '支付超时';
  return order.statusLabel || order.status;
}

function getStatusColor(order: MyApi.OutputRentalOrderDto): string {
  if (order.overdueStatus === 'overdue_use' || order.overdueStatus === 'overdue') return 'bg-red-100 text-red-600';
  if (order.payStatus === 'timeout') return 'bg-gray-100 text-gray-600';
  if (['completed', 'canceled', 'closed'].includes(order.status)) return 'bg-gray-100 text-gray-600';
  return 'bg-amber-100 text-amber-700';
}

export function OrderCard({ order, onMutate }: { order: MyApi.OutputRentalOrderDto; onMutate?: () => void }) {
  const contactName =
    order.assetSnapshot?.contactName ||
    order.lessor?.profile?.realName ||
    (order.lessor as { username?: string })?.username ||
    '出租方';

  const coverImage = order.assetSnapshot?.coverImage || (order.assetSnapshot?.images?.[0] as string) || '';

  const isRenewalOrder = order.isRenewal ?? false;

  const handleClick = () => {
    Taro.navigateTo({ url: ORDER_DETAIL_PATH(order.id) }).catch(() => {});
    onMutate?.();
  };

  const statusLabel = getStatusLabel(order);
  const statusColor = getStatusColor(order);

  return (
    <View
      className="p-4 bg-white rounded-2xl mb-3 shadow-sm active:opacity-95"
      hoverClass="opacity-95"
      onClick={handleClick}
    >
      {/* 头部：联系人和状态 */}
      <View className="flex flex-row items-start justify-between mb-3">
        <View className="flex flex-row items-center flex-1 min-w-0">
          <Image
            src={order.lessor?.avatar || ''}
            className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0"
            mode="aspectFill"
          />
          <View className="ml-3 flex-1 min-w-0 flex flex-col">
            <Text className="text-gray-900 font-medium truncate">{contactName}</Text>
            <Text className="text-gray-400 text-xs mt-0.5">{order.orderNo}</Text>
          </View>
        </View>
        <View className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>{statusLabel}</View>
      </View>

      <View className="border-t border-dashed border-gray-200 my-3" />

      {/* 内容：资产信息 */}
      <View className="flex flex-row gap-3 mb-3">
        <Image src={coverImage} className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0" mode="aspectFill" />
        <View className="flex-1 min-w-0">
          <Text className="text-gray-900 font-semibold text-sm line-clamp-2">{order.assetSnapshot?.name}</Text>
          <View className="flex flex-col">
            <Text className="text-gray-500 text-xs mt-1">租赁方案：{order.rentalPlanSnapshot?.name}</Text>
            <Text className="text-gray-400 text-xs mt-0.5">下单时间：{order.createdAt?.slice?.(0, 10)}</Text>
          </View>
        </View>
      </View>

      {/* 底部：标签和金额 */}
      <View className="flex flex-row items-end justify-between flex-wrap gap-2">
        <View className="flex flex-row flex-wrap gap-1">
          {isRenewalOrder && (
            <View className="px-2 py-0.5 rounded bg-amber-100">
              <Text className="text-amber-700 text-xs">续租订单</Text>
            </View>
          )}
          {order.rentalPlanSnapshot?.isInstallment && (
            <View className="px-2 py-0.5 rounded bg-blue-100">
              <Text className="text-blue-600 text-xs">分期订单</Text>
            </View>
          )}
          {order.rentalPlanSnapshot?.isInstallment ? (
            <View className="px-2 py-0.5 rounded bg-blue-100">
              <Text className="text-blue-600 text-xs">{order.rentalPlanSnapshot?.rentalPeriod}期</Text>
            </View>
          ) : (
            <View className="px-2 py-0.5 rounded bg-blue-100">
              <Text className="text-blue-600 text-xs">
                {order.duration}
                {order.durationUnitLabel}
              </Text>
            </View>
          )}
          {order.overdueStatus === 'overdue_use' && (
            <View className="px-2 py-0.5 rounded bg-red-100">
              <Text className="text-red-600 text-xs">{order.overdueStatusLabel}</Text>
            </View>
          )}
        </View>
        <Text className="text-red-500 font-bold">¥{order.orderAmount}</Text>
      </View>
    </View>
  );
}
