import { debounce } from 'es-toolkit';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { Box, Stack, MenuItem, TextField, Typography, InputAdornment } from '@mui/material';

import API from 'src/services/API';
import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Searchbar } from 'src/components/custom';
import { LoadMore } from 'src/components/custom/load-more';
import { EmptyContent } from 'src/components/empty-content';
import { HorizontalStack } from 'src/components/custom/layout';

import { DepositAuditCard } from '../deposit-audit-card';
import { DepositAuditCardSkeleton } from '../deposit-audit-card-skeleton';
import {
  DepositAuditRejectDialog,
  DepositAuditApproveDialog,
} from '../deposit-audit-review-dialog';

// ----------------------------------------------------------------------

const PAGE_SIZE = 12;

type DeductionStatus = MyApi.OutputDepositDeductionDto['status'];

const STATUS_OPTIONS: { value: DeductionStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'pending_audit', label: '待审核' },
  { value: 'platform_approved', label: '平台已通过' },
  { value: 'platform_rejected', label: '平台已拒绝' },
  { value: 'executed', label: '已执行' },
  { value: 'cancelled', label: '已取消' },
];

export function DepositAuditView() {
  const queryClient = useQueryClient();
  const { open: openDialog } = useDialogs();

  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<DeductionStatus | 'all'>('pending_audit');

  const invalidateList = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-deposit-deductions'] });
  }, [queryClient]);

  const {
    data,
    isPending: initialLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['admin-deposit-deductions', keyword, status],
    queryFn: async ({ pageParam }) => {
      const res = await API.AdminDepositDeduction.AdminDepositDeductionControllerGetListV1({
        page: pageParam,
        pageSize: PAGE_SIZE,
        keyword: keyword || undefined,
        status: status === 'all' ? undefined : status,
      });
      return res.data;
    },
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
    return data.pages.flatMap((page) => page.data ?? []) as MyApi.OutputDepositDeductionDto[];
  }, [data?.pages]);

  const handleApprove = useCallback(
    (item: MyApi.OutputDepositDeductionDto) => {
      openDialog(DepositAuditApproveDialog, {
        item,
        onSuccess: () => {
          invalidateList();
        },
      });
    },
    [openDialog, invalidateList]
  );

  const handleReject = useCallback(
    (item: MyApi.OutputDepositDeductionDto) => {
      openDialog(DepositAuditRejectDialog, {
        item,
        onSuccess: () => {
          invalidateList();
        },
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
            <Iconify icon="solar:file-check-bold-duotone" width={22} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              押金审核
            </Typography>
          </HorizontalStack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Searchbar defaultValue={keyword} onChange={(value) => setKeyword(value)} showBorder />

            <TextField
              select
              size="small"
              value={status}
              onChange={(e) => setStatus((e.target.value as DeductionStatus) || '')}
              sx={{ minWidth: { sm: 140 } }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>

        {/* 卡片列表：一行一条 */}
        {initialLoading ? (
          <Stack spacing={2}>
            {[...Array(4)].map((_, i) => (
              <DepositAuditCardSkeleton key={i} />
            ))}
          </Stack>
        ) : list.length > 0 ? (
          <>
            <Stack spacing={2}>
              {list.map((item) => (
                <DepositAuditCard
                  key={item.id}
                  item={item}
                  onApprove={handleApprove}
                  onReject={handleReject}
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
            title="暂无扣款记录"
            description={
              status === 'pending_audit'
                ? '当前没有待审核的押金扣款申请'
                : '暂无符合筛选条件的扣款记录'
            }
          />
        )}
      </Stack>
    </DashboardContent>
  );
}
