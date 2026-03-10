import { debounce } from 'es-toolkit';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';

import { Box, Grid, Stack, MenuItem, TextField, Typography, InputAdornment } from '@mui/material';

import API from 'src/services/API';
import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { MyConfirmDialog } from 'src/components/custom';
import { LoadMore } from 'src/components/custom/load-more';
import { EmptyContent } from 'src/components/empty-content';
import { HorizontalStack } from 'src/components/custom/layout';

import { EnterpriseRejectDialog } from '../enterprise-reject-dialog';
import { EnterpriseApplicationCard } from '../enterprise-application-card';
import { EnterpriseApplicationCardSkeleton } from '../enterprise-application-card-skeleton';

// ----------------------------------------------------------------------

const PAGE_SIZE = 12;
const KEYWORD_DEBOUNCE_MS = 400;

const STATUS_OPTIONS: {
  value: 'all' | MyApi.OutputEnterpriseApplicationListItemDto['enterpriseVerificationStatus'];
  label: string;
}[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'verified', label: '已通过' },
  { value: 'rejected', label: '已拒绝' },
];

export function EnterpriseManagementView() {
  const queryClient = useQueryClient();
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const isComposingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<
    'all' | MyApi.OutputEnterpriseApplicationListItemDto['enterpriseVerificationStatus']
  >('all');
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    userId: string;
    companyName?: string;
  }>({
    open: false,
    userId: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  const { open: confirm } = useDialogs();

  const debouncedSetKeyword = useMemo(
    () => debounce((value: string) => setKeyword(value), KEYWORD_DEBOUNCE_MS),
    []
  );

  // 关键字防抖：输入框即时更新，请求延迟 KEYWORD_DEBOUNCE_MS 后触发
  useEffect(
    () => () => {
      debouncedSetKeyword.cancel();
    },
    [debouncedSetKeyword]
  );

  const {
    data,
    isPending: initialLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['admin-enterprise-applications', keyword, status],
    queryFn: async ({ pageParam }) => {
      const res = await API.AdminUser.AdminUserControllerGetEnterpriseApplicationListV1({
        page: pageParam,
        pageSize: PAGE_SIZE,
        keyword: keyword || undefined,
        enterpriseVerificationStatus: status === 'all' ? undefined : status,
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
    return data.pages.flatMap(
      (page) => page.data ?? []
    ) as MyApi.OutputEnterpriseApplicationListItemDto[];
  }, [data?.pages]);

  const handleApprove = useCallback(
    async (userId: string) => {
      confirm(MyConfirmDialog, {
        title: '企业认证通过',
        content: '确认要通过该企业的认证申请吗？操作通过后，该企业将获得企业认证标识。',
        iconColor: 'warning.main',
        okButtonProps: {
          color: 'success',
        },
        onOk: async () => {
          setActionLoading(true);
          try {
            await API.AdminUser.AdminUserControllerApproveEnterpriseVerificationV1({ userId });
            queryClient.invalidateQueries({ queryKey: ['admin-enterprise-applications'] });
          } finally {
            setActionLoading(false);
          }
        },
      });
    },
    [queryClient, confirm]
  );

  const handleRejectOpen = useCallback((userId: string, companyName?: string) => {
    setRejectDialog({ open: true, userId, companyName });
  }, []);

  const handleRejectClose = useCallback(() => {
    setRejectDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const handleRejectSubmit = useCallback(
    async (reason: string) => {
      const userId = rejectDialog.userId;
      setActionLoading(true);
      try {
        await API.AdminUser.AdminUserControllerRejectEnterpriseVerificationV1(
          { userId },
          { reason: reason || undefined }
        );
        toast.success('已拒绝企业认证');
        queryClient.invalidateQueries({ queryKey: ['admin-enterprise-applications'] });
        handleRejectClose();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '操作失败，请重试');
      } finally {
        setActionLoading(false);
      }
    },
    [queryClient, rejectDialog.userId, handleRejectClose]
  );

  const handleRevertToPending = useCallback(
    async (userId: string) => {
      confirm(MyConfirmDialog, {
        title: '恢复待审核',
        content:
          '确认要将该企业认证恢复为待审核状态吗？恢复后，该企业将失去企业认证标识，需要重新审核。',
        iconColor: 'warning.main',
        okButtonProps: {
          color: 'warning',
        },
        onOk: async () => {
          setActionLoading(true);
          try {
            await API.AdminUser.AdminUserControllerRevertEnterpriseVerificationToPendingV1({
              userId,
            });
            toast.success('已恢复为待审核');
            queryClient.invalidateQueries({ queryKey: ['admin-enterprise-applications'] });
          } finally {
            setActionLoading(false);
          }
        },
      });
    },
    [queryClient, confirm]
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
            <Iconify icon="solar:users-group-rounded-bold-duotone" width={22} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              企业认证管理
            </Typography>
          </HorizontalStack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <TextField
              inputRef={inputRef}
              placeholder="搜索企业/法人/手机/邮箱"
              value={keywordInput}
              onCompositionStart={() => {
                isComposingRef.current = true;
              }}
              onCompositionEnd={(e: any) => {
                const value = inputRef.current?.value || '';
                debouncedSetKeyword(value.trim());
                setTimeout(() => {
                  isComposingRef.current = false;
                }, 150);
              }}
              onChange={(e) => {
                const value = e.target.value;
                setKeywordInput(value);
                if (!isComposingRef.current) {
                  debouncedSetKeyword(value);
                }
              }}
              size="small"
              sx={{ minWidth: { sm: 260 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" width={20} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              select
              size="small"
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as
                    | 'all'
                    | MyApi.OutputEnterpriseApplicationListItemDto['enterpriseVerificationStatus']
                )
              }
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
          <Grid container spacing={2}>
            {[...Array(6)].map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <EnterpriseApplicationCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : list.length > 0 ? (
          <>
            <Grid container spacing={2}>
              {list.map((item) => (
                <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <EnterpriseApplicationCard
                    item={item}
                    onApprove={handleApprove}
                    onReject={handleRejectOpen}
                    onRevertToPending={handleRevertToPending}
                    loading={actionLoading}
                  />
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
            title="暂无申请"
            description={
              status === 'pending' ? '当前没有待审核的企业认证申请' : '暂无符合条件的企业认证记录'
            }
          />
        )}
      </Stack>

      <EnterpriseRejectDialog
        open={rejectDialog.open}
        onClose={handleRejectClose}
        onSubmit={handleRejectSubmit}
        loading={actionLoading}
        enterpriseName={rejectDialog.companyName}
      />
    </DashboardContent>
  );
}
