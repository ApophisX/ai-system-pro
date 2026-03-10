import { useGetAssets } from '@/actions/assets';
import { GoodsSearchHeader } from '@/sections/goods/components';
import { AssetSortBy, GoodsFilter } from '@/sections/goods/components/GoodsFilter';
import { GoodsWaterfall } from '@/sections/home/components';
import { View } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { usePullDownRefresh } from '@tarojs/taro';
import { useCallback, useState } from 'react';
import './index.less';
import { useAppContext } from '@/hooks/use-app';

export default function Index() {
  const router = useRouter();
  const { category = 'all' } = router.params;
  const { currentLocation } = useAppContext();

  const [keyword, setKeyword] = useState('');
  const [categoryCode, setCategoryCode] = useState(category);
  const [sortBy, setSortBy] = useState<AssetSortBy>('recommend');
  const {
    allData: assets,
    clearCache,
    hasMore,
    dataLoading,
    dataValidating,
    reload,
    loadMore,
  } = useGetAssets({
    keyword,
    categoryCode: categoryCode === 'all' ? undefined : categoryCode,
    sortBy,
    provinceCode: currentLocation?.provinceCode,
    cityCode: currentLocation?.cityCode,
    latitude: currentLocation?.latitude,
    longitude: currentLocation?.longitude,
  });

  const handleFavoriteChange = useCallback(
    (itemId: string) => {
      reload();
    },
    [reload],
  );

  const handleSearch = useCallback(
    (k: string) => {
      clearCache();
      setKeyword(k);
    },
    [clearCache],
  );

  usePullDownRefresh(async () => {
    await reload();
    Taro.stopPullDownRefresh();
  });

  return (
    <View className="min-h-screen bg-gray-50 flex flex-col" style={{ height: '100vh' }}>
      <GoodsSearchHeader defaultValue={keyword} onSearch={handleSearch} />
      <GoodsFilter
        activeCategory={categoryCode}
        onCategoryChange={setCategoryCode}
        onSortChange={setSortBy}
        sortBy={sortBy}
      />
      <GoodsWaterfall
        list={assets}
        loading={dataLoading}
        validating={dataValidating}
        hasMore={hasMore}
        onFavoriteChange={handleFavoriteChange}
        layout="waterfall"
        onScrollToLower={loadMore}
      />
    </View>
  );
}
