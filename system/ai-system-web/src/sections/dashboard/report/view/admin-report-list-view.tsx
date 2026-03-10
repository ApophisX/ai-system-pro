import type { AdminReportListItem } from '../types';

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

import { AdminReportCard } from '../admin-report-card';
import { AdminReportCardSkeleton } from '../admin-report-card-skeleton';
import { AdminReportHandleDialog } from '../admin-report-handle-dialog';
import { REPORT_STATUS_OPTIONS, REPORT_REASON_OPTIONS } from '../constants';

// ----------------------------------------------------------------------

const PAGE_SIZE = 12;

type StatusFilter = AdminReportListItem['status'] | 'all';

export function AdminReportListView() {
  const queryClient = useQueryClient();
  const { open: openDialog } = useDialogs();

  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<StatusFilter>(0);
  const [reason, setReason] = useState<string>('all');

  const invalidateList = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
  }, [queryClient]);

  const {
    data,
    isPending: initialLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['admin-reports', keyword, status, reason],
    queryFn: async ({ pageParam }) => {
      const res = await API.AdminReport.AdminReportControllerGetListV1({
        page: pageParam,
        pageSize: PAGE_SIZE,
        keyword: keyword || undefined,
        status: status === 'all' ? undefined : status,
        reason: reason === 'all' ? undefined : reason,
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
    return data.pages.flatMap((page) => page.data ?? []) as AdminReportListItem[];
  }, [data?.pages]);

  const handleApprove = useCallback(
    (item: AdminReportListItem) => {
      openDialog(AdminReportHandleDialog, {
        item,
        action: 'approve',
        onSuccess: invalidateList,
      });
    },
    [openDialog, invalidateList]
  );

  const handleReject = useCallback(
    (item: AdminReportListItem) => {
      openDialog(AdminReportHandleDialog, {
        item,
        action: 'reject',
        onSuccess: invalidateList,
      });
    },
    [openDialog, invalidateList]
  );

  const handleMarkMalicious = useCallback(
    (item: AdminReportListItem) => {
      openDialog(AdminReportHandleDialog, {
        item,
        action: 'mark_malicious',
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
            <Iconify icon="solar:flag-bold" width={22} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              举报管理
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
              onChange={(e) => {
                const v = e.target.value;
                setStatus(v === 'all' ? 'all' : (Number(v) as AdminReportListItem['status']));
              }}
              sx={{ minWidth: { sm: 120 } }}
            >
              {REPORT_STATUS_OPTIONS.map((opt) => (
                <MenuItem key={String(opt.value)} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              value={reason}
              onChange={(e) => setReason(e.target.value || 'all')}
              sx={{ minWidth: { sm: 160 } }}
            >
              <MenuItem value="all">全部原因</MenuItem>
              {REPORT_REASON_OPTIONS.map((opt) => (
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
              <AdminReportCardSkeleton key={i} />
            ))}
          </Stack>
        ) : list.length > 0 ? (
          <>
            <Stack spacing={2}>
              {list.map((item, index) => (
                <AdminReportCard
                  key={item.id}
                  item={item}
                  index={index}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onMarkMalicious={handleMarkMalicious}
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
            title="暂无举报"
            description={status === 0 ? '当前没有待处理的举报' : '暂无符合筛选条件的举报'}
          />
        )}
      </Stack>
    </DashboardContent>
  );
}
