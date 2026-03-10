import type { ReviewScoreRange, RentalReviewListItem } from '../types';

import { Star } from 'lucide-react';
import { useMemo, useState, useCallback } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

import { Box, Stack, alpha, Skeleton, Typography } from '@mui/material';

import { useSearchParams } from 'src/routes/hooks';

import API from 'src/services/API';
import { CONFIG } from 'src/global-config';

import { LoadMore } from 'src/components/custom/load-more';
import { MobileLayout } from 'src/components/custom/layout';
import { EmptyContent } from 'src/components/empty-content';

import { SectionTitle } from '../styled';
import { ReviewCard, ReviewSummaryCard, ReviewListFilters } from '../components';

// ----------------------------------------------------------------------

const PAGE_SIZE = 10;

export function RentalReviewListView() {
  const searchParams = useSearchParams();
  const assetId = searchParams.get('assetId') ?? '';

  const [scoreRange, setScoreRange] = useState<ReviewScoreRange>('all');

  // 评价汇总
  const { data: summary } = useQuery({
    queryKey: ['rental-review-summary', assetId],
    queryFn: () => API.AppRentalReview.AppRentalReviewControllerGetSummaryV1({ assetId }),
    select: (res) => res.data.data,
    enabled: !!assetId,
  });

  // 评价列表（分页 - 使用 useInfiniteQuery 实现上拉加载）
  const {
    data,
    isPending: initialLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['rental-review-list', assetId, scoreRange],
    queryFn: async ({ pageParam }) => {
      const res = await API.AppRentalReview.AppRentalReviewControllerGetListV1({
        assetId,
        status: 'approved',
        scoreRange: scoreRange === 'all' ? undefined : scoreRange,
        page: pageParam,
        pageSize: PAGE_SIZE,
      });
      return res.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (!meta?.total) return undefined;
      const currentPage = meta.page ?? 0;
      const pageSize = meta.pageSize ?? PAGE_SIZE;
      const loadedCount = (currentPage + 1) * pageSize;
      return loadedCount < meta.total ? currentPage + 1 : undefined;
    },
    enabled: !!assetId,
  });

  const allReviews = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data ?? []) as RentalReviewListItem[];
  }, [data?.pages]);

  const handleScoreRangeChange = useCallback((value: ReviewScoreRange) => {
    setScoreRange(value);
  }, []);

  if (!assetId) {
    return (
      <MobileLayout appTitle="全部评价" sx={{ pt: { xs: 13, sm: 14, md: 15 } }}>
        <EmptyContent
          imgUrl={`${CONFIG.assetsDir}/assets/icons/empty/ic-content.svg`}
          title="缺少商品信息"
          description="请从商品详情页进入查看评价"
          sx={{ py: 8 }}
        />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout appTitle="全部评价">
      <Stack>
        {/* 标题区 */}
        <Stack direction="row" alignItems="center" sx={{ mb: 2.5 }}>
          <SectionTitle>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.15),
                color: 'warning.main',
              }}
            >
              <Star size={20} fill="currentColor" />
            </Box>
            <Typography component="span" variant="h6" sx={{ fontWeight: 800 }}>
              用户评价
            </Typography>
          </SectionTitle>
        </Stack>

        {!summary ? (
          <Skeleton variant="rounded" height={140} sx={{ mb: 2.5, borderRadius: 3 }} />
        ) : (
          <Box sx={{ mb: 2.5 }}>
            <ReviewSummaryCard
              reviewCount={summary.reviewCount}
              avgScore={summary.avgScore}
              scoreDistribution={summary.scoreDistribution ?? {}}
            />
          </Box>
        )}

        {summary && summary.reviewCount > 0 && (
          <>
            <ReviewListFilters value={scoreRange} onChange={handleScoreRangeChange} />
            <Stack spacing={2.5} sx={{ mt: 2.5 }}>
              {initialLoading ? (
                [...Array(4)].map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: 3 }} />
                ))
              ) : allReviews.length > 0 ? (
                <>
                  {allReviews.map((r, i) => (
                    <ReviewCard key={r.id} review={r} index={i} />
                  ))}
                  <LoadMore
                    hasMore={!!hasNextPage}
                    loading={isFetchingNextPage}
                    onLoadMore={() => fetchNextPage()}
                    show={allReviews.length >= PAGE_SIZE}
                  />
                </>
              ) : (
                <EmptyContent
                  imgUrl={`${CONFIG.assetsDir}/assets/icons/empty/ic-content.svg`}
                  title="暂无该筛选条件下的评价"
                  description="试试其他筛选条件"
                  sx={{ py: 4 }}
                />
              )}
            </Stack>
          </>
        )}

        {summary && summary.reviewCount === 0 && !initialLoading && (
          <EmptyContent
            imgUrl={`${CONFIG.assetsDir}/assets/icons/empty/ic-content.svg`}
            title="暂无评价"
            description="成为第一个发表评价的用户吧"
            sx={{ py: 6 }}
          />
        )}
      </Stack>
    </MobileLayout>
  );
}
