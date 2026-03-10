/**
 * 社区页 - 展示我加入的社区列表（支持分页）
 * 支持下拉刷新、上拉加载更多
 * 空状态：未加入任何社区时展示加入引导 UI
 * 点击社区跳转到 community/assets 页面
 */

import { View, Text, ScrollView, Image } from '@tarojs/components';
import { useGetMyJoinedCommunities } from '@/actions/community';
import { paths, webPaths } from '@/route/paths';
import Taro, { useDidShow, useLoad } from '@tarojs/taro';
import { useCallback, useState } from 'react';
import { usePullDownRefresh } from '@tarojs/taro';
import './index.less';
import { SearchBar } from '@/components/search-bar';

/** 未加入社区的空状态 UI */
type JoinCommunityEmptyProps = {
  onJoin: () => void;
};
function JoinCommunityEmpty({ onJoin }: JoinCommunityEmptyProps) {
  return (
    <View className="flex flex-col items-center justify-center py-24 px-8">
      <View className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <Text className="text-5xl">👋</Text>
      </View>
      <Text className="text-lg font-semibold text-gray-900 mb-2">你还未加入任何社区</Text>
      <Text className="text-gray-500 text-sm text-center mb-8">加入后可浏览、发布社区内的优质商品</Text>
      <View className="flex items-center gap-4">
        <View className="px-10 py-3 rounded-full bg-emerald-500" hoverClass="opacity-90" onClick={onJoin}>
          <Text className="text-white font-medium">去加入社区</Text>
        </View>
      </View>
    </View>
  );
}

/** 没有搜索到社区的空状态 UI */
function NoSearchCommunityEmpty() {
  return (
    <View className="flex flex-col items-center justify-center py-24 px-8">
      <Text className="text-lg font-semibold text-gray-900 mb-2">没有搜索到社区</Text>
      <Text className="text-gray-500 text-sm text-center mb-8">试试其他关键词</Text>
    </View>
  );
}

/** 社区列表项 */
function CommunityListItem({ item, onClick }: { item: MyApi.OutputCommunityListItemDto; onClick: () => void }) {
  const isPrivate = item.type === 'private';
  const hasStats = item.memberCount != null || item.assetCount != null;
  return (
    <View
      className="community-list-item flex items-center gap-4 px-4 py-4 bg-white rounded-2xl mb-3 active:opacity-95"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      hoverClass="opacity-95"
      onClick={onClick}
    >
      <View className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center shrink-0 overflow-hidden">
        {item.coverImage ? (
          <Image src={item.coverImage} className="w-full h-full" mode="aspectFill" />
        ) : (
          <Text className="text-3xl">🏘️</Text>
        )}
      </View>
      <View className="flex-1 min-w-0">
        <View className="flex items-center gap-2 flex-wrap">
          <Text className="text-base font-semibold text-gray-900 truncate">{item.name}</Text>
          {isPrivate && (
            <View className="shrink-0 px-2 py-0.5 rounded-full bg-amber-100">
              <Text className="text-xs text-amber-700 font-medium">私密</Text>
            </View>
          )}
        </View>
        {item.description && (
          <Text className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{item.description}</Text>
        )}
        {hasStats && (
          <View className="flex items-center gap-3 mt-2">
            {item.memberCount != null && <Text className="text-xs text-gray-400">{item.memberCount} 人</Text>}
            {item.assetCount != null && <Text className="text-xs text-gray-400">{item.assetCount} 件商品</Text>}
          </View>
        )}
      </View>
      <View className="flex items-center gap-1 shrink-0 py-2 px-3 rounded-lg bg-emerald-50">
        <Text className="text-emerald-600 text-sm font-medium">进入</Text>
        <Text className="text-emerald-500 text-xs">›</Text>
      </View>
    </View>
  );
}

export default function CommunityIndex() {
  const [keyword, setKeyword] = useState('');
  const handleSearch = useCallback((k: string) => {
    setKeyword(k);
  }, []);

  const {
    allData: communities,
    hasMore,
    dataLoading,
    dataValidating,
    dataEmpty,
    reload,
    loadMore,
  } = useGetMyJoinedCommunities({
    keyword,
  });

  const handleDiscover = useCallback(() => {
    // Taro.navigateTo({ url: paths.community.search });
    Taro.navigateTo({ url: paths.webview(webPaths.community.search) });
  }, []);

  const handleJoinCommunity = useCallback(() => {
    // Taro.navigateTo({ url: paths.community.search });
    handleDiscover();
  }, [handleDiscover]);

  const handleCommunityClick = useCallback((id: string) => {
    Taro.navigateTo({ url: paths.community.assets(id) });
  }, []);

  usePullDownRefresh(async () => {
    await reload();
    Taro.stopPullDownRefresh();
  });

  const searchBar = (
    <SearchBar
      onSearch={handleSearch}
      defaultValue={keyword}
      extra={
        <View className="px-4 py-2 rounded-full bg-emerald-500" hoverClass="opacity-90" onClick={handleDiscover}>
          <Text className="text-white font-medium text-sm">发现社区</Text>
        </View>
      }
    />
  );

  // 未加入任何社区：展示加入引导
  if (!dataLoading && !dataValidating && dataEmpty && !keyword) {
    return (
      <View className="min-h-screen bg-gray-50 flex flex-col" style={{ height: '100vh' }}>
        <ScrollView scrollY enhanced showScrollbar={false} className="flex-1 bg-gray-50">
          <JoinCommunityEmpty onJoin={handleJoinCommunity} />
        </ScrollView>
      </View>
    );
  }
  // 没有搜索到社区：展示空状态
  if (!dataLoading && !dataValidating && dataEmpty && keyword) {
    return (
      <View className="min-h-screen bg-gray-50 flex flex-col" style={{ height: '100vh' }}>
        {/* 搜索社区 */}
        {searchBar}
        <ScrollView scrollY enhanced showScrollbar={false} className="flex-1 bg-gray-50">
          <NoSearchCommunityEmpty />
        </ScrollView>
      </View>
    );
  }

  // 已加入社区：展示社区列表（支持分页）
  return (
    <View className="min-h-screen bg-gray-50 flex flex-col" style={{ height: '100vh' }}>
      {/* 搜索社区 */}
      {searchBar}
      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className="flex-1"
        onScrollToLower={loadMore}
        lowerThreshold={150}
      >
        <View className="px-4 py-4">
          {communities.map(item => (
            <CommunityListItem key={item.id} item={item} onClick={() => handleCommunityClick(item.id)} />
          ))}
          {dataLoading && communities.length === 0 && (
            <View className="py-12 text-center">
              <Text className="text-gray-500 text-sm">加载中...</Text>
            </View>
          )}
          {dataValidating && communities.length > 0 && (
            <View className="py-4 text-center">
              <Text className="text-gray-500 text-sm">加载更多...</Text>
            </View>
          )}
          {!hasMore && communities.length > 0 && (
            <View className="py-4 text-center">
              <Text className="text-gray-400 text-xs">没有更多了</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
