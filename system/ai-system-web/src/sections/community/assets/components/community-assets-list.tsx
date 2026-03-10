import type { AssetSortBy } from 'src/sections/rental/rental-goods/goods-filter';

import React, { useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import { Container, Stack } from '@mui/material';

import API from 'src/services/API';

import { LoadMore } from 'src/components/custom/load-more';
import { ListEmptyContent } from 'src/components/empty-content';

import { CommunityAssetListCard } from './community-asset-list-card';
import { CommunityAssetListSkeleton } from './community-asset-list-skeleton';

// ----------------------------------------------------------------------

const PAGE_SIZE = 10;

/** 将 GoodsFilter 的 sortBy 映射为社区资产 API 的 sort/order */
function mapSortToCommunityApi(sortBy: AssetSortBy): {
  sort: MyApi.AppCommunityAssetControllerGetCommunityAssetsV1Params['sortBy'];
  order: 'asc' | 'desc';
} {
  switch (sortBy) {
    case 'newest':
      return { sort: 'createdAt', order: 'desc' };
    case 'recommend':
      return { sort: 'rentalCount', order: 'desc' };
    case 'price':
      return { sort: 'price', order: 'asc' };
    case 'nearby':
      return { sort: 'nearby', order: 'asc' };
    default:
      return { sort: 'createdAt', order: 'desc' };
  }
}

// ----------------------------------------------------------------------

interface CommunityAssetsListProps {
  category: string;
  sortBy: AssetSortBy;
  communityId: string;
  keyword?: string;
  slot?: {
    emptyContent?: React.ReactNode;
  };
}

export function CommunityAssetsList({
  category,
  sortBy,
  communityId,
  keyword,
  slot,
}: CommunityAssetsListProps) {
  const queryClient = useQueryClient();
  const { sort, order } = mapSortToCommunityApi(sortBy);

  const {
    data,
    isPending: dataLoading,
    isFetchingNextPage: dataValidating,
    hasNextPage: hasMore,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['community-assets', communityId, category, sortBy, keyword],
    queryFn: async ({ pageParam }) => {
      const res = await API.AppCommunityAsset.AppCommunityAssetControllerGetCommunityAssetsV1({
        id: communityId,
        page: pageParam,
        pageSize: PAGE_SIZE,
        categoryCode: category === 'all' ? undefined : category,
        sortBy: sort,
        order,
        keyword: keyword || undefined,
      });
      return res.data;
    },
    gcTime: 0,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (!meta?.total) return undefined;
      const currentPage = meta.page ?? 0;
      const pageSize = meta.pageSize ?? PAGE_SIZE;
      const loadedCount = (currentPage + 1) * pageSize;
      return loadedCount < meta.total ? currentPage + 1 : undefined;
    },
    enabled: !!communityId,
  });

  const assets = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data ?? []) as MyApi.OutputAssetListItemDto[];
  }, [data?.pages]);

  const handleFavoriteChange = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['community-assets', communityId] });
  }, [queryClient, communityId]);

  const handleLoadMore = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  // 初始加载状态
  if (dataLoading) {
    return (
      <Container maxWidth="lg" sx={{ px: 2, py: 2 }}>
        <Stack spacing={2}>
          {Array.from({ length: 6 }).map((_, index) => (
            <CommunityAssetListSkeleton key={index} index={index} />
          ))}
        </Stack>
      </Container>
    );
  }

  // 空状态
  if (assets.length === 0) {
    return slot?.emptyContent ? (
      slot.emptyContent
    ) : (
      <ListEmptyContent title="暂无商品" description="换个分类看看吧~" />
    );
  }

  return (
    <Container maxWidth="lg" sx={{ px: 2, py: 2 }}>
      <Stack spacing={2}>
        {assets.map((item, index) => (
          <CommunityAssetListCard
            key={item.id}
            item={item}
            index={index}
            onFavoriteChange={handleFavoriteChange}
          />
        ))}

        {/* 加载更多时的骨架 */}
        {dataValidating && assets.length > 0 && (
          <>
            {Array.from({ length: 2 }).map((_, index) => (
              <CommunityAssetListSkeleton key={`loading-${index}`} index={index} />
            ))}
          </>
        )}
      </Stack>

      {/* 加载更多触发器 */}
      <LoadMore
        hasMore={!!hasMore}
        loading={dataValidating}
        onLoadMore={handleLoadMore}
        disabled={dataLoading}
        show={assets.length > 0 && assets.length >= PAGE_SIZE}
      />
    </Container>
  );
}
