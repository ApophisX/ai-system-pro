import { AnimatePresence } from 'framer-motion';
import React, { useState, useCallback } from 'react';

import Masonry from '@mui/lab/Masonry';
import { Box, styled, Container, useMediaQuery } from '@mui/material';

import { useGetAssets } from 'src/actions/assets';
import { useGetCurrentArea } from 'src/layouts/global/hooks/use-area';

import { LoadMore } from 'src/components/custom/load-more';
import { ListEmptyContent } from 'src/components/empty-content';

import { GoodsCard } from './goods-card';
import { SkeletonCard } from './goods-skeleton';

// ----------------------------------------------------------------------

interface GoodsWaterfallProps {
  category: string;
  sortBy: MyApi.AppAssetControllerGetAssetListV1Params['sortBy'];
  keyword?: string;
  /** 出租方 ID，按出租方筛选（承租方查看出租方店铺场景） */
  lessorId?: string;
  slot?: {
    emptyContent?: React.ReactNode;
  };
}

export function GoodsWaterfall({ category, sortBy, keyword, lessorId, slot }: GoodsWaterfallProps) {
  const [page, setPage] = useState(0);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const { currentArea } = useGetCurrentArea();

  const {
    hasMore,
    allData: assets,
    dataLoading,
    dataValidating,
    mutate,
  } = useGetAssets({
    page,
    categoryCode: category === 'all' ? undefined : category,
    provinceCode: currentArea.province?.value,
    cityCode: currentArea.city?.value,
    districtCode: currentArea.district?.value,
    sortBy,
    keyword,
    lessorId,
  });

  const handleFavoriteChange = useCallback(
    (result: boolean) => {
      if (result) {
        mutate();
      }
    },
    [mutate]
  );

  // 初始加载状态
  if (dataLoading) {
    return (
      <GoodsContainer maxWidth="lg" isMobile={isMobile}>
        <Masonry columns={{ xs: 2, md: 3, lg: 4 }} spacing={2}>
          <AnimatePresence mode="popLayout">
            {Array.from({ length: 10 }).map((_, index) => (
              <SkeletonCard key={index} index={index} />
            ))}
          </AnimatePresence>
        </Masonry>
      </GoodsContainer>
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
    <Container maxWidth="lg" sx={{ px: '0 !important' }}>
      <GoodsContainer maxWidth="lg" isMobile={isMobile}>
        {/* 瀑布流布局 */}
        <Masonry columns={{ xs: 2, md: 3, lg: 4 }} spacing={2}>
          <AnimatePresence mode="popLayout">
            {assets.map((item, index) => (
              <GoodsCard
                key={item.id}
                item={item}
                index={index}
                onFavoriteChange={handleFavoriteChange}
              />
            ))}
            {dataValidating && page > 0 && (
              <>
                {[...Array.from({ length: 6 })].map((_, index) => (
                  <SkeletonCard key={index} index={index} />
                ))}
              </>
            )}
          </AnimatePresence>
        </Masonry>

        {/* 加载更多触发器 */}
        <LoadMore
          hasMore={hasMore}
          loading={dataValidating}
          onLoadMore={() => setPage((prev) => prev + 1)}
          disabled={dataLoading}
          show={assets.length > 0 && assets.length >= 10}
        />
      </GoodsContainer>
    </Container>
  );
}

const GoodsContainer = styled(Box, {
  shouldForwardProp: (prop: string) => !['theme', 'isMobile'].includes(prop),
})<{ isMobile: boolean }>(({ theme, isMobile }) => ({
  paddingTop: theme.spacing(2),
  ...(isMobile
    ? {
        // paddingInline: theme.spacing(1),
        marginLeft: theme.spacing(0),
        overflow: 'hidden',
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(0),
      }
    : {
        paddingInline: 16,
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(1),
        margin: '0 auto',
      }),
}));
