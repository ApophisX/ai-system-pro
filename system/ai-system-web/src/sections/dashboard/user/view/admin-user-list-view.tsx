import { debounce } from 'es-toolkit';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';

import { Box, Grid, Stack, MenuItem, TextField, Typography, InputAdornment } from '@mui/material';

import API from 'src/services/API';
import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Searchbar } from 'src/components/custom';
import { LoadMore } from 'src/components/custom/load-more';
import { EmptyContent } from 'src/components/empty-content';
import { HorizontalStack } from 'src/components/custom/layout';

import { AdminUserCard } from '../admin-user-card';
import { AdminUserCardSkeleton } from '../admin-user-card-skeleton';
import { AdminUserDetailDialog } from '../admin-user-detail-dialog';

// ----------------------------------------------------------------------

const PAGE_SIZE = 12;
const KEYWORD_DEBOUNCE_MS = 400;

const STATUS_OPTIONS: {
  value: 'all' | MyApi.OutputAdminUserListItemDto['status'];
  label: string;
}[] = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: '正常' },
  { value: 'frozen', label: '冻结' },
  { value: 'banned', label: '封禁' },
];

const USER_TYPE_OPTIONS: {
  value: 'all' | MyApi.OutputAdminUserListItemDto['userType'];
  label: string;
}[] = [
  { value: 'all', label: '全部类型' },
  { value: 'personal', label: '个人' },
  { value: 'enterprise', label: '企业' },
];

export function AdminUserListView() {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<'all' | MyApi.OutputAdminUserListItemDto['status']>('all');
  const [userType, setUserType] = useState<'all' | MyApi.OutputAdminUserListItemDto['userType']>(
    'all'
  );
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    userId: string | null;
  }>({ open: false, userId: null });

  const {
    data,
    isPending: initialLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['admin-users', keyword, status, userType],
    queryFn: async ({ pageParam }) => {
      const res = await API.AdminUser.AdminUserControllerGetAdminUserListV1({
        page: pageParam,
        pageSize: PAGE_SIZE,
        keyword: keyword || undefined,
        status: status === 'all' ? undefined : status,
        userType: userType === 'all' ? undefined : userType,
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
    return data.pages.flatMap((page) => page.data ?? []) as MyApi.OutputAdminUserListItemDto[];
  }, [data?.pages]);

  const handleCardClick = useCallback((item: MyApi.OutputAdminUserListItemDto) => {
    setDetailDialog({ open: true, userId: item.id });
  }, []);

  const handleDetailClose = useCallback(() => {
    setDetailDialog({ open: false, userId: null });
  }, []);

  const handleDetailSuccess = useCallback(() => {
    // 列表会通过 queryClient.invalidateQueries 自动刷新
  }, []);

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
            <Iconify icon="solar:users-group-rounded-bold-duotone" width={22} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              用户管理
            </Typography>
          </HorizontalStack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Searchbar defaultValue={keyword} onChange={setKeyword} showBorder />
            <TextField
              select
              size="small"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as 'all' | MyApi.OutputAdminUserListItemDto['status'])
              }
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
              value={userType}
              onChange={(e) =>
                setUserType(e.target.value as 'all' | MyApi.OutputAdminUserListItemDto['userType'])
              }
              sx={{ minWidth: { sm: 120 } }}
            >
              {USER_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>

        {/* 卡片列表 */}
        {initialLoading ? (
          <Grid container spacing={2}>
            {[...Array(6)].map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <AdminUserCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : list.length > 0 ? (
          <>
            <Grid container spacing={2}>
              {list.map((item, index) => (
                <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <AdminUserCard item={item} index={index} onClick={handleCardClick} />
                </Grid>
              ))}
            </Grid>
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
            title="暂无用户"
            description="暂无符合筛选条件的用户"
          />
        )}
      </Stack>

      <AdminUserDetailDialog
        open={detailDialog.open}
        userId={detailDialog.userId}
        onClose={handleDetailClose}
        onSuccess={handleDetailSuccess}
      />
    </DashboardContent>
  );
}
