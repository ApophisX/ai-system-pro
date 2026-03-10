import type { AdminRentalReviewListItem } from '../types';

import { useDialogs } from '@toolpad/core/useDialogs';
import { useMemo, useState, useCallback } from 'react';
import { useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import { Box, Stack, MenuItem, TextField, Typography } from '@mui/material';

import API from 'src/services/API';
import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Searchbar } from 'src/components/custom';
import { LoadMore } from 'src/components/custom/load-more';
import { EmptyContent } from 'src/components/empty-content';
import { HorizontalStack } from 'src/components/custom/layout';

import { AdminReviewCard } from '../admin-review-card';
import { AdminReviewCardSkeleton } from '../admin-review-card-skeleton';
import {
  AdminReviewHideDialog,
  AdminReviewRejectDialog,
  AdminReviewApproveDialog,
} from '../admin-review-audit-dialog';

// ----------------------------------------------------------------------

const PAGE_SIZE = 12;

type StatusFilter = AdminRentalReviewListItem['status'] | 'all';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'hidden', label: '已隐藏' },
];

export function AdminReviewListView() {
  const queryClient = useQueryClient();
  const { open: openDialog } = useDialogs();

  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<StatusFilter>('pending');

  const invalidateList = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-rental-reviews'] });
  }, [queryClient]);

  const {
    data,
    isPending: initialLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['admin-rental-reviews', keyword, status],
    queryFn: async ({ pageParam }) => {
      const res = await API.AdminRentalReview.AdminRentalReviewControllerGetListV1({
        page: pageParam,
        pageSize: PAGE_SIZE,
        keyword: keyword || undefined,
        status: status === 'all' ? undefined : status,
      });
      return res.data;
    },
    gcTime: 0,
    staleTime: 0,
    retry: false,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (!meta?.total) return undefined;
      const currentPage = meta.page ?? 0;
      const pageSize = meta.pageSize ?? PAGE_SIZE;
      const loadedCount = (currentPage + 1) * pageSize;
      return loadedCount < meta.total ? currentPage + 1 : undefined;
    },
  });

  const list = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data ?? []) as AdminRentalReviewListItem[];
  }, [data?.pages]);

  const handleApprove = useCallback(
    (item: AdminRentalReviewListItem) => {
      openDialog(AdminReviewApproveDialog, {
        item,
        onSuccess: invalidateList,
      });
    },
    [openDialog, invalidateList]
  );

  const handleReject = useCallback(
    (item: AdminRentalReviewListItem) => {
      openDialog(AdminReviewRejectDialog, {
        item,
        onSuccess: invalidateList,
      });
    },
    [openDialog, invalidateList]
  );

  const handleHide = useCallback(
    (item: AdminRentalReviewListItem) => {
      openDialog(AdminReviewHideDialog, {
        item,
        onSuccess: invalidateList,
      });
    },
    [openDialog, invalidateList]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={3} flex={1}>
        {/* 标题与筛选 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <HorizontalStack spacing={1.5}>
            <Iconify icon="solar:chat-round-dots-bold" width={22} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              评论管理
            </Typography>
          </HorizontalStack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Searchbar onChange={(value) => setKeyword(value)} showBorder />
            <TextField
              select
              size="small"
              value={status}
              onChange={(e) => setStatus((e.target.value as StatusFilter) || 'all')}
              sx={{ minWidth: { sm: 140 } }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>

        {/* 卡片列表 */}
        {initialLoading ? (
          <Stack spacing={2}>
            {[...Array(4)].map((_, i) => (
              <AdminReviewCardSkeleton key={i} />
            ))}
          </Stack>
        ) : list.length > 0 ? (
          <>
            <Stack spacing={2}>
              {list.map((item, index) => (
                <AdminReviewCard
                  key={item.id}
                  item={item}
                  index={index}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onHide={handleHide}
                />
              ))}
            </Stack>
            <LoadMore
              hasMore={!!hasNextPage}
              loading={isFetchingNextPage}
              onLoadMore={() => fetchNextPage()}
              disabled={initialLoading}
              show={list.length >= PAGE_SIZE}
            />
          </>
        ) : (
          <EmptyContent
            imgUrl={`${CONFIG.assetsDir}/assets/icons/empty/ic-content.svg`}
            title="暂无评论"
            description={status === 'pending' ? '当前没有待审核的评论' : '暂无符合筛选条件的评论'}
          />
        )}
      </Stack>
    </DashboardContent>
  );
}
