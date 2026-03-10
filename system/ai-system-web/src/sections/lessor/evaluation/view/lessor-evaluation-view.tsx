'use client';

import type { RentalReviewListItem } from 'src/sections/rental-review/types';

import { AnimatePresence } from 'framer-motion';
import { useDialogs } from '@toolpad/core/useDialogs';
import { StarOff, MessageSquare } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { Tab, Box, Tabs, Stack, Paper, Button, Skeleton, Typography } from '@mui/material';

import API from 'src/services/API';

import { LoadMore } from 'src/components/custom/load-more';
import { MobileLayout } from 'src/components/custom/layout';

import { ReviewCard } from 'src/sections/rental-review/components';
import { ReviewReplyDialog } from 'src/sections/rental-review/components/review-reply-dialog';

// ----------------------------------------------------------------------

const TABS = [{ value: 'received', label: '收到的评价' }];

const ASSETS_PAGE_SIZE = 10;
const REVIEWS_PER_ASSET = 10;

export default function LessorEvaluationView() {
  const dialogs = useDialogs();
  const [reviews, setReviews] = useState<RentalReviewListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [assetsPage, setAssetsPage] = useState(0);
  const [loadedAssetIds, setLoadedAssetIds] = useState<Set<string>>(new Set());

  const fetchReviews = useCallback(
    async (isFirst: boolean) => {
      if (loading) return;
      setLoading(true);
      if (isFirst) {
        setIsInitialLoading(true);
        setReviews([]);
        setLoadedAssetIds(new Set());
        setAssetsPage(0);
      }

      try {
        const pageToFetch = isFirst ? 0 : assetsPage;
        const assetsRes = await API.AppAsset.AppAssetControllerGetMyAssetsV1({
          auditStatus: 'approved',
          status: 'available',
          page: pageToFetch,
          pageSize: ASSETS_PAGE_SIZE,
        });
        const assets = assetsRes.data.data ?? [];
        const meta = assetsRes.data.meta;
        const totalAssets = meta?.total ?? 0;

        if (assets.length === 0 && isFirst) {
          setReviews([]);
          setHasMore(false);
          setLoading(false);
          setIsInitialLoading(false);
          return;
        }

        const assetIds = assets.map((a: { id: string }) => a.id);
        const assetMap = new Map(
          assets.map((a: { id: string; name?: string; coverImage?: string }) => [a.id, a])
        );

        const reviewPromises = assetIds.map((assetId: string) =>
          API.AppRentalReview.AppRentalReviewControllerGetListV1({
            assetId,
            status: 'approved',
            page: 0,
            pageSize: REVIEWS_PER_ASSET,
          })
        );

        const reviewResults = await Promise.all(reviewPromises);
        const newReviews: RentalReviewListItem[] = [];

        reviewResults.forEach((res, idx) => {
          const list = (res.data.data ?? []) as RentalReviewListItem[];
          const asset = assets[idx];
          list.forEach((r) => {
            newReviews.push({
              ...r,
              asset: asset
                ? { id: asset.id, name: asset.name, coverImage: asset.coverImage }
                : undefined,
            } as RentalReviewListItem);
          });
        });

        newReviews.sort(
          (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        );

        if (isFirst) {
          setReviews(newReviews);
        } else {
          setReviews((prev) => {
            const merged = [...prev];
            const existingIds = new Set(prev.map((r) => r.id));
            newReviews.forEach((r) => {
              if (!existingIds.has(r.id)) {
                existingIds.add(r.id);
                merged.push(r);
              }
            });
            merged.sort(
              (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
            );
            return merged;
          });
        }

        setLoadedAssetIds((prev) => {
          const next = new Set(prev);
          assetIds.forEach((id: string) => next.add(id));
          return next;
        });

        const nextAssetsPage = pageToFetch + 1;
        setAssetsPage(nextAssetsPage);
        setHasMore(nextAssetsPage * ASSETS_PAGE_SIZE < totalAssets);
      } finally {
        setLoading(false);
        setIsInitialLoading(false);
      }
    },
    [loading, assetsPage]
  );

  useEffect(() => {
    fetchReviews(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    fetchReviews(false);
  };

  const handleReply = (reviewId: string) => {
    dialogs.open(ReviewReplyDialog, {
      reviewId,
      onSuccess: () => {
        setReviews((prev) =>
          prev.map((r) => {
            if (r.id === reviewId) {
              return { ...r, replyContent: '已回复', replyAt: new Date().toISOString() };
            }
            return r;
          })
        );
      },
    });
  };

  const renderSkeletons = (
    <Stack spacing={2}>
      {[...Array(3)].map((_, index) => (
        <Skeleton key={index} variant="rounded" height={180} />
      ))}
    </Stack>
  );

  const renderList = (
    <Stack spacing={2}>
      {reviews.map((review, index) => (
        <Box key={review.id}>
          <ReviewCard review={review} index={index} showAsset />
          {!review.replyContent && (
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
              <Button
                size="small"
                startIcon={<MessageSquare size={16} />}
                variant="outlined"
                onClick={() => handleReply(review.id)}
              >
                回复
              </Button>
            </Stack>
          )}
        </Box>
      ))}
      <LoadMore
        hasMore={hasMore}
        loading={loading}
        onLoadMore={handleLoadMore}
        disabled={isInitialLoading}
      />
    </Stack>
  );

  return (
    <MobileLayout
      appTitle="评价管理"
      // appBarProps={{
      //   extra: (
      //     <Paper sx={{ zIndex: 1, position: 'sticky', top: 56, borderRadius: 0 }}>
      //       <Tabs
      //         value="received"
      //         variant="fullWidth"
      //         sx={{
      //           '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
      //         }}
      //       >
      //         {TABS.map((tab) => (
      //           <Tab key={tab.value} value={tab.value} label={tab.label} />
      //         ))}
      //       </Tabs>
      //     </Paper>
      //   ),
      // }}
    >
      <>
        {isInitialLoading ? (
          renderSkeletons
        ) : (
          <AnimatePresence mode="wait">
            {reviews.length > 0 ? (
              renderList
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ py: 10, textAlign: 'center' }}
              >
                <StarOff
                  size={64}
                  style={{ marginBottom: 16 }}
                  color="var(--mui-palette-text-disabled)"
                />
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                  暂无评价
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.disabled', mt: 1 }}>
                  当您的资产收到评价时，将显示在这里
                </Typography>
              </Stack>
            )}
          </AnimatePresence>
        )}
      </>
    </MobileLayout>
  );
}
