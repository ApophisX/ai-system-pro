/**
 * 商品列表（支持固定高度 / 瀑布流布局）
 * 瀑布流使用 Taro VirtualWaterfall 实现虚拟渲染，提升长列表性能
 */

import React, { memo, useMemo } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Button } from '@tarojs/components';
import { VirtualWaterfall, WaterFlow } from '@tarojs/components-advanced';
import { GoodsCard } from './GoodsCard';
import { SkeletonCard } from './SkeletonCard';
import { ListEmpty } from './ListEmpty';
import { paths, webPaths } from '@/route/paths';

type AssetItem = MyApi.OutputAssetListItemDto;
/** 布局模式：fixed 固定高度网格 | waterfall 虚拟瀑布流 */
export type GoodsListLayout = 'fixed' | 'waterfall';

interface GoodsWaterfallProps {
  list: AssetItem[];
  loading: boolean;
  validating: boolean;
  hasMore: boolean;
  onFavoriteChange: (itemId: string) => void;
  /** 布局模式，默认 fixed */
  layout?: GoodsListLayout;
  /** 瀑布流模式下滚动到底部时加载更多 */
  onScrollToLower?: () => void;
  /** 瀑布流模式下顶部区域（如 SearchHeader、CategoryGrid） */
  renderTop?: React.ReactNode;
  communityId?: string;
}

const WaterfallItem = memo(({ id, index, data }: { id: string; index: number; data: AssetItem[] }) => {
  const item = data[index];
  return (
    <View id={id} className="px-1" style={{ paddingBottom: 1 }}>
      <GoodsCard item={item} />
    </View>
  );
});

WaterfallItem.displayName = 'WaterfallItem';

function renderSkeletonFixed() {
  return (
    <View className="grid grid-cols-2 gap-3">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <SkeletonCard key={i} index={i} />
      ))}
    </View>
  );
}

function renderSkeletonWaterfall() {
  return (
    <View className="flex flex-row gap-3">
      <View className="flex-1">
        {[0, 2, 4].map(i => (
          <SkeletonCard key={i} index={i} />
        ))}
      </View>
      <View className="flex-1">
        {[1, 3, 5].map(i => (
          <SkeletonCard key={i} index={i} />
        ))}
      </View>
    </View>
  );
}

function renderListFixed(list: AssetItem[], onFavoriteChange: (itemId: string) => void, validating: boolean) {
  return (
    <View className="grid grid-cols-2 gap-3">
      {list.map(item => (
        <GoodsCard key={item.id} item={item} onFavoriteChange={onFavoriteChange} />
      ))}
      {validating && [0, 1, 2, 3].map(i => <SkeletonCard key={`skeleton-${i}`} index={i} />)}
    </View>
  );
}

/** 瀑布流单项预估高度（图片 4:3 + 内容区），用于虚拟列表计算 */
const ESTIMATED_ITEM_HEIGHT = 280;

export function GoodsWaterfall(props: GoodsWaterfallProps) {
  const {
    list,
    loading,
    validating,
    hasMore,
    onFavoriteChange,
    layout = 'fixed',
    onScrollToLower,
    renderTop,
    communityId,
  } = props;

  const renderTopMemo = useMemo(() => {
    return renderTop ? (props: { id: string }) => <View id={props.id}>{renderTop}</View> : undefined;
  }, [renderTop]);

  if (loading && list.length === 0) {
    return (
      <View className="px-4 pb-4">{layout === 'waterfall' ? renderSkeletonWaterfall() : renderSkeletonFixed()}</View>
    );
  }

  if (list.length === 0) {
    return (
      <View>
        {renderTopMemo?.({ id: 'top' })}
        <ListEmpty
          title="暂无商品"
          description="暂无商品信息，换个分类看看吧~"
          action={
            <Button
              onClick={() => {
                Taro.navigateTo({
                  url: communityId
                    ? paths.webview(`${webPaths.publish}?communityId=${communityId}`)
                    : paths.webview(webPaths.publish),
                });
              }}
              className="w-full py-2 px-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 active:bg-emerald-700 transition-all font-bold text-base border-none"
            >
              <Text className="text-white font-medium text-base">发布商品</Text>
            </Button>
          }
        />
      </View>
    );
  }

  if (layout === 'waterfall') {
    return (
      <VirtualWaterfall
        column={2}
        height="100%"
        width="100%"
        item={WaterfallItem}
        itemData={list}
        unlimitedSize
        itemCount={list.length}
        itemSize={ESTIMATED_ITEM_HEIGHT}
        overscanDistance={100}
        lowerThreshold={150}
        onScrollToLower={hasMore ? onScrollToLower : undefined}
        renderTop={renderTopMemo}
        renderBottom={
          list.length >= 10 && hasMore
            ? (props: { id: string }) => (
                <View id={props.id} className="flex items-center justify-center py-4">
                  <Text className="text-gray-400 text-sm">{validating ? '加载中...' : '上拉加载更多'}</Text>
                </View>
              )
            : (props: { id: string }) => <View id={props.id} className="h-4" />
        }
      />
    );
  }

  return (
    <View className="bg-gray-50">
      {renderListFixed(list, onFavoriteChange, validating)}
      {list.length >= 10 && hasMore && (
        <View className="flex items-center justify-center py-4">
          <Text className="text-gray-400 text-sm">{validating ? '加载中...' : '上拉加载更多'}</Text>
        </View>
      )}
    </View>
  );
}
