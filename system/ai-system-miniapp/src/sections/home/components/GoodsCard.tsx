/**
 * 商品卡片
 */

import Taro from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import { RENTAL_TYPE_UNIT_LABELS } from './types';
import type { AssetItem, RentalType } from './types';
import { paths, webPaths } from '@/route/paths';
import { formatDistance } from '@/utils/formatter';

interface GoodsCardProps {
  item: AssetItem;
  onFavoriteChange?: (itemId: string) => void;
}

export function GoodsCard({ item, onFavoriteChange }: GoodsCardProps) {
  const handleClick = () => {
    // Taro.navigateTo({ url: PATHS.goodsDetail(item.id) });
    Taro.navigateTo({
      url: paths.webview(webPaths.goodsDetail(item.id)),
    });
  };

  const handleFavorite = (e: any) => {
    e.stopPropagation?.();
    onFavoriteChange?.(item.id);
  };

  const firstRentalPlan = item.rentalPlans?.[0];

  const imgUrl = item.coverImage || item.images?.[0] || '';
  const price = firstRentalPlan?.price ?? 0;
  const rentalTypeLabel = firstRentalPlan?.rentalType ? RENTAL_TYPE_UNIT_LABELS[firstRentalPlan.rentalType] : '天';
  const location = [item.contact?.city, item.contact?.district].filter(Boolean).join('');

  return (
    <View className="bg-white rounded-xl overflow-hidden shadow-sm mb-2" hoverClass="opacity-95" onClick={handleClick}>
      <View className="relative aspect-[3/4] bg-gray-100">
        <Image src={imgUrl} mode="aspectFill" className="w-full h-full block" lazyLoad showMenuByLongpress={false} />
        {/* <View
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: item.isFavorite ? '#ef4444' : 'rgba(255,255,255,0.9)',
          }}
          hoverClass="opacity-80"
          onClick={handleFavorite}
        >
          <Text className="text-sm">{item.isFavorite ? '❤️' : '🤍'}</Text>
        </View> */}
        {item.deposit <= 0 && !item.isMallProduct && (
          <View className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-500 flex flex-col items-center justify-center">
            <Text className="text-white text-xs">免押金</Text>
          </View>
        )}
      </View>
      <View className="p-3">
        <Text className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{item.name}</Text>
        {item.customTags && item.customTags.length > 0 && (
          <View className="flex flex-row flex-wrap gap-1 mb-2">
            {item.customTags.slice(0, 3).map((tag, i) => (
              <View key={i} className="px-1.5 py-0.5 rounded bg-gray-100">
                <Text className="text-xs text-gray-600">{tag}</Text>
              </View>
            ))}
          </View>
        )}
        <View className="flex flex-row items-center gap-1 mb-2">
          <Text className="text-amber-500 text-xs">★</Text>
          <Text className="text-gray-600 text-xs font-medium">{item.rating}</Text>
          <Text className="text-gray-400 text-xs">({item.viewCount})</Text>
          <View className="flex-1" />
          {location && item.distance && item.distance > 0 && (
            <>
              <Text className="text-gray-400 text-xs">📍</Text>
              <Text className="text-gray-400 text-xs truncate max-w-16">{formatDistance(item.distance)}</Text>
            </>
          )}
        </View>
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-baseline gap-1">
            <Text className="text-red-500 font-bold text-base">¥{price}</Text>
            <Text className="text-gray-400 text-xs">{item.isMallProduct ? '' : `/${rentalTypeLabel}`}</Text>
          </View>
          {item.owner?.avatar && (
            <Image
              src={item.owner.avatar}
              className="w-7 h-7 rounded-full border-2"
              style={{ borderColor: item.owner.isVerified ? '#3b82f6' : '#e5e7eb' }}
              mode="aspectFill"
            />
          )}
        </View>
      </View>
    </View>
  );
}
