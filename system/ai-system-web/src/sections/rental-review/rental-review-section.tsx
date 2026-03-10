import type { ReviewScoreRange } from './types';

import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback } from 'react';
import { Star, ShieldCheck, MessageCircle } from 'lucide-react';

import { Box, Stack, alpha, Button, Skeleton, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import API from 'src/services/API';
import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

import { SectionTitle } from './styled';
import { ReviewCard, ReviewSummaryCard, ReviewListFilters } from './components';

// ----------------------------------------------------------------------

const PAGE_SIZE = 5;

type Props = {
  assetId: string;
  onWriteReview?: () => void;
};

export function RentalReviewSection({ assetId, onWriteReview }: Props) {
  const [scoreRange, setScoreRange] = useState<ReviewScoreRange>('all');
  const [page] = useState(0);

  // 评价汇总
  const { data: summary } = useQuery({
    queryKey: ['rental-review-summary', assetId],
    queryFn: () => API.AppRentalReview.AppRentalReviewControllerGetSummaryV1({ assetId }),
    select: (res) => res.data.data,
  });

  // 评价列表（分页）
  const { data: reviewsRes, isPending: initialLoading } = useQuery({
    queryKey: ['rental-review-list', assetId, scoreRange, page],
    queryFn: () =>
      API.AppRentalReview.AppRentalReviewControllerGetListV1({
        assetId,
        status: 'approved',
        scoreRange: scoreRange === 'all' ? undefined : scoreRange,
        page,
        pageSize: PAGE_SIZE,
      }),
    select: (res) => ({
      data: res.data.data ?? [],
      meta: res.data.meta,
    }),
    placeholderData: (prev) => prev,
  });

  const allReviews = useMemo(() => reviewsRes?.data ?? [], [reviewsRes?.data]);

  const handleScoreRangeChange = useCallback((value: ReviewScoreRange) => {
    setScoreRange(value);
  }, []);

  return (
    <Container maxWidth="lg">
      {/* 标题区 - 增强信任感 */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1.5}
        sx={{ mb: 2.5 }}
      >
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
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography component="span" variant="h6" sx={{ fontWeight: 800 }}>
              用户评价
            </Typography>
            {summary && summary.reviewCount > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.25,
                  py: 0.25,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                  color: 'success.dark',
                }}
              >
                <ShieldCheck size={14} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  真实用户反馈
                </Typography>
              </Box>
            )}
          </Stack>
        </SectionTitle>
        {onWriteReview && (
          <Box
            component="button"
            onClick={onWriteReview}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.75,
              border: 'none',
              borderRadius: 2,
              cursor: 'pointer',
              color: 'primary.main',
              fontSize: '0.875rem',
              fontWeight: 700,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              transition: 'all 0.25s ease',
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.18),
              },
            }}
          >
            <MessageCircle size={18} />
            写评价
          </Box>
        )}
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
              [...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: 3 }} />
              ))
            ) : allReviews.length > 0 ? (
              <>
                {allReviews.map((r, i) => (
                  <ReviewCard key={r.id} review={r} index={i} />
                ))}

                {allReviews.length >= 3 && (
                  // 查看更多
                  <Button
                    component={Link}
                    to={paths.rental.review.withAsset(assetId)}
                    variant="text"
                    color="primary"
                    sx={{ width: 120, margin: '0 auto' }}
                  >
                    查看更多
                    <Iconify icon="eva:arrow-ios-forward-fill" />
                  </Button>
                )}
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
    </Container>
  );
}
