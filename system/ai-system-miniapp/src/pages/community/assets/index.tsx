/**
 * 社区商品列表页 - 展示社区内的租赁/二手商品
 * 顶部：社区名称 + 搜索栏
 * 内容：商品瀑布流列表，支持分页
 */

import { View, ScrollView, Button, Text } from '@tarojs/components';
import { useGetCommunityAssets, useGetCommunityDetail } from '@/actions/community';
import { GoodsWaterfall } from '@/sections/home/components';
import { GoodsSearchHeader } from '@/sections/goods/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useRouter } from '@tarojs/taro';
import { useCallback, useEffect, useState } from 'react';
import { usePullDownRefresh } from '@tarojs/taro';
import './index.less';
import { AssetSortBy, GoodsFilter } from '@/sections/goods/components/GoodsFilter';
import { paths, webPaths } from '@/route/paths';

export default function CommunityAssetsPage() {
  const router = useRouter();
  const communityId = router.params.communityId || '';

  console.log(router.params.communityId);

  const [keyword, setKeyword] = useState('');
  const [categoryCode, setCategoryCode] = useState('all');
  const [sortBy, setSortBy] = useState<AssetSortBy>('recommend');

  const { data: community } = useGetCommunityDetail(communityId);
  const {
    allData: assets,
    hasMore,
    dataLoading,
    dataValidating,
    reload,
    clearCache,
    loadMore,
  } = useGetCommunityAssets(communityId, {
    keyword,
    categoryCode: categoryCode === 'all' ? undefined : categoryCode,
    sort: sortBy as MyApi.AppCommunityAssetControllerGetCommunityAssetsV1Params['sort'],
  });

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

  useLoad(() => {
    Taro.setNavigationBarTitle({ title: '社区商品' });
  });

  useEffect(() => {
    if (community?.name) {
      Taro.setNavigationBarTitle({ title: community.name });
    }
  }, [community?.name]);

  if (!communityId) {
    return null;
  }

  return (
    <View className="min-h-screen bg-gray-50 flex flex-col" style={{ height: '100vh' }}>
      <GoodsSearchHeader
        showAddress={false}
        defaultValue={keyword}
        onSearch={handleSearch}
        rightExtra={
          <View>
            <Button
              className="py-2 text-sm bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 active:bg-emerald-700 transition-all font-bold text-base border-none"
              onClick={() => {
                Taro.navigateTo({
                  url: communityId
                    ? paths.webview(`${webPaths.publish}?communityId=${communityId}`)
                    : paths.webview(webPaths.publish),
                });
              }}
            >
              发布商品
            </Button>
          </View>
        }
      />
      <GoodsFilter
        activeCategory={categoryCode}
        onCategoryChange={setCategoryCode}
        onSortChange={setSortBy}
        sortBy={sortBy as AssetSortBy}
      />
      <ScrollView scrollY enhanced showScrollbar={false} scrollWithAnimation={false} className="bg-gray-50">
        <View className="px-4 pb-4 pt-2">
          <GoodsWaterfall
            list={assets}
            communityId={communityId}
            loading={dataLoading}
            validating={dataValidating}
            hasMore={hasMore}
            onFavoriteChange={() => {}}
            layout="waterfall"
            onScrollToLower={loadMore}
          />
        </View>
      </ScrollView>
    </View>
  );
}
