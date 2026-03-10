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

import { CommunityAuditCard } from '../community-audit-card';
import { CommunityRejectDialog } from '../community-reject-dialog';
import { CommunityForceCloseDialog } from '../community-force-close-dialog';
import { CommunityAuditCardSkeleton } from '../community-audit-card-skeleton';

// ----------------------------------------------------------------------

const PAGE_SIZE = 12;
const KEYWORD_DEBOUNCE_MS = 400;

const STATUS_OPTIONS: {
  value: 'all' | MyApi.OutputCommunityDto['status'];
  label: string;
}[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'closed', label: '已关闭' },
];

const TYPE_OPTIONS: { value: 'all' | 'public' | 'private'; label: string }[] = [
  { value: 'all', label: '全部类型' },
  { value: 'public', label: '公开' },
  { value: 'private', label: '私密' },
];

export function CommunityManagementView() {
  const queryClient = useQueryClient();
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const isComposingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<'all' | MyApi.OutputCommunityDto['status']>('all');
  const [type, setType] = useState<'all' | 'public' | 'private'>('all');
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    id: string;
    name?: string;
  }>({ open: false, id: '', name: '' });
  const [forceCloseDialog, setForceCloseDialog] = useState<{
    open: boolean;
    id: string;
    name?: string;
  }>({ open: false, id: '', name: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const { open: confirm } = useDialogs();

  const debouncedSetKeyword = useMemo(
    () => debounce((value: string) => setKeyword(value), KEYWORD_DEBOUNCE_MS),
    []
  );

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
    queryKey: ['admin-community-list', keyword, status, type],
    queryFn: async ({ pageParam }) => {
      const res = await API.AdminCommunity.AdminCommunityControllerGetListV1({
        page: pageParam,
        pageSize: PAGE_SIZE,
        keyword: keyword || undefined,
        status: status === 'all' ? undefined : status,
        type: type === 'all' ? undefined : type,
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
    return data.pages.flatMap((page) => page.data ?? []) as MyApi.OutputCommunityDto[];
  }, [data?.pages]);

  const handleApprove = useCallback(
    async (id: string) => {
      confirm(MyConfirmDialog, {
        title: '社区审核通过',
        content: '确认要通过该社区的审核吗？通过后，社区将可被用户发现和加入。',
        iconColor: 'warning.main',
        okButtonProps: {
          color: 'success',
        },
        onOk: async () => {
          setActionLoading(true);
          try {
            await API.AdminCommunity.AdminCommunityControllerApproveV1({ id });
            toast.success('审核已通过');
            queryClient.invalidateQueries({ queryKey: ['admin-community-list'] });
          } finally {
            setActionLoading(false);
          }
        },
      });
    },
    [queryClient, confirm]
  );

  const handleRejectOpen = useCallback((id: string, name?: string) => {
    setRejectDialog({ open: true, id, name });
  }, []);

  const handleRejectClose = useCallback(() => {
    setRejectDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const handleRejectSubmit = useCallback(
    async (auditRemark: string) => {
      const { id } = rejectDialog;
      setActionLoading(true);
      try {
        await API.AdminCommunity.AdminCommunityControllerRejectV1({ id }, { auditRemark });
        toast.success('已拒绝社区审核');
        queryClient.invalidateQueries({ queryKey: ['admin-community-list'] });
        handleRejectClose();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '操作失败，请重试');
      } finally {
        setActionLoading(false);
      }
    },
    [rejectDialog, queryClient, handleRejectClose]
  );

  const handleForceCloseOpen = useCallback((id: string, name?: string) => {
    setForceCloseDialog({ open: true, id, name });
  }, []);

  const handleForceCloseClose = useCallback(() => {
    setForceCloseDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const handleForceCloseSubmit = useCallback(
    async (reason: string) => {
      const { id } = forceCloseDialog;
      setActionLoading(true);
      try {
        await API.AdminCommunity.AdminCommunityControllerForceCloseV1(
          { id },
          { reason: reason || undefined }
        );
        toast.success('社区已强制关闭');
        queryClient.invalidateQueries({ queryKey: ['admin-community-list'] });
        handleForceCloseClose();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '操作失败，请重试');
      } finally {
        setActionLoading(false);
      }
    },
    [forceCloseDialog, queryClient, handleForceCloseClose]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={3} flex={1}>
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
              社区管理
            </Typography>
          </HorizontalStack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <TextField
              inputRef={inputRef}
              placeholder="搜索社区名称或描述"
              value={keywordInput}
              onCompositionStart={() => {
                isComposingRef.current = true;
              }}
              onCompositionEnd={() => {
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
              sx={{ minWidth: { sm: 220 } }}
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
                setStatus(e.target.value as 'all' | MyApi.OutputCommunityDto['status'])
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
              value={type}
              onChange={(e) => setType(e.target.value as 'all' | 'public' | 'private')}
              sx={{ minWidth: { sm: 100 } }}
            >
              {TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>

        {initialLoading ? (
          <Grid container spacing={2}>
            {[...Array(6)].map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <CommunityAuditCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : list.length > 0 ? (
          <>
            <Grid container spacing={2}>
              {list.map((item) => (
                <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <CommunityAuditCard
                    item={item}
                    onApprove={handleApprove}
                    onReject={handleRejectOpen}
                    onForceClose={handleForceCloseOpen}
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
            title="暂无社区"
            description={
              status === 'pending' ? '当前没有待审核的社区' : '暂无符合筛选条件的社区记录'
            }
          />
        )}
      </Stack>

      <CommunityRejectDialog
        open={rejectDialog.open}
        onClose={handleRejectClose}
        onSubmit={handleRejectSubmit}
        loading={actionLoading}
        communityName={rejectDialog.name}
      />

      <CommunityForceCloseDialog
        open={forceCloseDialog.open}
        onClose={handleForceCloseClose}
        onSubmit={handleForceCloseSubmit}
        loading={actionLoading}
        communityName={forceCloseDialog.name}
      />
    </DashboardContent>
  );
}
