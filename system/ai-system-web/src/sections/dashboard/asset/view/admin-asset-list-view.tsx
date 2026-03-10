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

import { AdminAssetCard } from '../admin-asset-card';
import { AdminAssetCardSkeleton } from '../admin-asset-card-skeleton';
import { AdminAssetForceOfflineDialog } from '../admin-asset-force-offline-dialog';
import {
  AdminAssetAuditRejectDialog,
  AdminAssetAuditApproveDialog,
} from '../admin-asset-audit-dialog';

// ----------------------------------------------------------------------

const PAGE_SIZE = 12;

type AssetStatusFilter = MyApi.OutputAssetAdminListItemDto['status'] | 'all';
type AuditStatusFilter = MyApi.OutputAssetAdminListItemDto['auditStatus'] | 'all';

const STATUS_OPTIONS: { value: AssetStatusFilter; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'draft', label: '草稿' },
  { value: 'available', label: '可出租' },
  { value: 'offline', label: '已下架' },
];

const AUDIT_STATUS_OPTIONS: { value: AuditStatusFilter; label: string }[] = [
  { value: 'all', label: '全部审核' },
  { value: 'pending', label: '待审核' },
  { value: 'auditing', label: '审核中' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' },
];

export function AdminAssetListView() {
  const queryClient = useQueryClient();
  const { open: openDialog } = useDialogs();

  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<AssetStatusFilter>('all');
  const [auditStatus, setAuditStatus] = useState<AuditStatusFilter>('all');

  const invalidateList = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-assets'] });
  }, [queryClient]);

  const {
    data,
    isPending: initialLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['admin-assets', keyword, status, auditStatus],
    queryFn: async ({ pageParam }) => {
      const res = await API.AdminAsset.AdminAssetControllerGetListV1({
        page: pageParam,
        pageSize: PAGE_SIZE,
        keyword: keyword || undefined,
        status: status === 'all' ? undefined : status,
        auditStatus: auditStatus === 'all' ? undefined : auditStatus,
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
    return data.pages.flatMap((page) => page.data ?? []) as MyApi.OutputAssetAdminListItemDto[];
  }, [data?.pages]);

  const handleAuditApprove = useCallback(
    (item: MyApi.OutputAssetAdminListItemDto) => {
      openDialog(AdminAssetAuditApproveDialog, {
        item,
        onSuccess: invalidateList,
      });
    },
    [openDialog, invalidateList]
  );

  const handleAuditReject = useCallback(
    (item: MyApi.OutputAssetAdminListItemDto) => {
      openDialog(AdminAssetAuditRejectDialog, {
        item,
        onSuccess: invalidateList,
      });
    },
    [openDialog, invalidateList]
  );

  const handleForceOffline = useCallback(
    (item: MyApi.OutputAssetAdminListItemDto) => {
      openDialog(AdminAssetForceOfflineDialog, {
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
            <Iconify icon="solar:box-minimalistic-bold" width={22} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              资产管理
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
              onChange={(e) => setStatus((e.target.value as AssetStatusFilter) || 'all')}
              sx={{ minWidth: { sm: 120 } }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              value={auditStatus}
              onChange={(e) => setAuditStatus((e.target.value as AuditStatusFilter) || 'all')}
              sx={{ minWidth: { sm: 120 } }}
            >
              {AUDIT_STATUS_OPTIONS.map((opt) => (
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
              <AdminAssetCardSkeleton key={i} />
            ))}
          </Stack>
        ) : list.length > 0 ? (
          <>
            <Stack spacing={2}>
              {list.map((item, index) => (
                <AdminAssetCard
                  key={item.id}
                  item={item}
                  index={index}
                  onAuditApprove={handleAuditApprove}
                  onAuditReject={handleAuditReject}
                  onForceOffline={handleForceOffline}
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
            title="暂无资产"
            description={
              auditStatus === 'pending' || auditStatus === 'auditing'
                ? '当前没有待审核的资产'
                : '暂无符合筛选条件的资产'
            }
          />
        )}
      </Stack>
    </DashboardContent>
  );
}
