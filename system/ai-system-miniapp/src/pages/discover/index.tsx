/**
 * Taro 小程序首页 - 纯 UI 展示，使用模拟数据
 * 使用 TailwindCSS 实现样式
 * 瀑布流模式使用 VirtualWaterfall 实现虚拟渲染
 */

import { View, Text, ScrollView } from '@tarojs/components';
import { SearchHeader, CategoryGrid, GoodsWaterfall } from '@/sections/home/components';
import { useGetAssets } from '@/actions/assets';
import { usePullDownRefresh } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import './index.less';
import { useAppContext } from '@/hooks/use-app';

export default function Index() {
  const { currentLocation } = useAppContext();
  const {
    allData: assets,
    hasMore,
    dataLoading,
    dataValidating,
    reload,
    loadMore,
  } = useGetAssets({
    provinceCode: currentLocation?.provinceCode,
    cityCode: currentLocation?.cityCode,
    latitude: currentLocation?.latitude,
    longitude: currentLocation?.longitude,
  });

  usePullDownRefresh(async () => {
    await reload();
    Taro.stopPullDownRefresh();
  });

  const renderTop = (
    <>
      <CategoryGrid />
      <View className="px-4 mt-2 mb-2">
        <Text className="text-base font-bold text-gray-900">热门推荐</Text>
      </View>
    </>
  );

  return (
    <View className="min-h-screen bg-gray-50 flex flex-col" style={{ height: '100vh' }}>
      <SearchHeader />
      <ScrollView scrollY enhanced showScrollbar={false} scrollWithAnimation={false} className="bg-gray-50">
        <GoodsWaterfall
          list={assets}
          loading={dataLoading}
          validating={dataValidating}
          hasMore={hasMore}
          onFavoriteChange={() => {}}
          layout="waterfall"
          onScrollToLower={loadMore}
          renderTop={renderTop}
        />
      </ScrollView>
    </View>
  );
}
