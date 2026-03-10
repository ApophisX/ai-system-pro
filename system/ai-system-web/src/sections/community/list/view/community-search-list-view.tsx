import { useDialogs } from '@toolpad/core/useDialogs';
import { useMemo, useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { Box, Stack, Button, Typography, CardActions, Skeleton } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import API from 'src/services/API';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { LoadMore } from 'src/components/custom/load-more';
import { EmptyContent } from 'src/components/empty-content';
import { Searchbar, MobileLayout, MyConfirmDialog } from 'src/components/custom';

import { VerifyInviteCodeDialog } from 'src/sections/community/verify-invite-code-dialog';

import { CommunityCard } from '../components/community-card';

// ----------------------------------------------------------------------

const PAGE_SIZE = 20;

// ----------------------------------------------------------------------

export function CommunitySearchListView() {
  const [keyword, setKeyword] = useState('');

  const router = useRouter();

  const { open: openDialog } = useDialogs();

  const {
    data,
    isPending: initialLoading,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    enabled: !!keyword,
    retry: false,
    gcTime: 0,
    staleTime: 0,
    queryKey: ['community-list', keyword],
    queryFn: async ({ pageParam }) => {
      const res = await API.AppCommunity.AppCommunityControllerGetListV1({
        page: pageParam,
        pageSize: PAGE_SIZE,
        sort: 'memberCount',
        order: 'desc',
        keyword: keyword || undefined,
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
  });

  const list = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data ?? []) as MyApi.OutputCommunityListItemDto[];
  }, [data?.pages]);

  const handleLoadMore = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  const renderActions = useCallback(
    (item: MyApi.OutputCommunityListItemDto) => {
      if (item.joined) {
        return null;
      }
      return (
        <CardActions>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              if (item.type === 'private') {
                openDialog(
                  VerifyInviteCodeDialog,
                  { communityName: item.name },
                  {
                    onClose: async (inviteCode) => {
                      if (inviteCode) {
                        try {
                          await API.AppCommunity.AppCommunityControllerJoinV1(
                            { id: item.id },
                            { inviteCode }
                          );
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : '加入失败');
                        }
                        router.back();
                      }
                    },
                  }
                );
              } else {
                openDialog(MyConfirmDialog, {
                  title: '确定要加入社区吗？',
                  content: '加入社区后，您将可以访问社区内的所有资源。',
                  okButtonText: '加入',
                  iconColor: 'info.main',
                  useInfoIcon: true,
                  cancelButtonText: '取消',
                  okButtonProps: { color: 'primary' },
                  onOk: async () => {
                    await API.AppCommunity.AppCommunityControllerJoinV1(
                      { id: item.id },
                      { inviteCode: '' }
                    );
                    router.back();
                  },
                });
              }
            }}
          >
            立即加入
          </Button>
        </CardActions>
      );
    },
    [openDialog, router]
  );

  return (
    <MobileLayout
      appTitle={
        <Searchbar
          defaultValue={keyword}
          onChange={(value) => {
            setKeyword(value);
          }}
          slotProps={{
            root: { sx: { py: 0.5 } },
          }}
        />
      }
      appBarProps={{
        rightContent: (
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push(paths.community.create)}
            sx={{ ml: 1 }}
          >
            <Iconify icon="mingcute:add-line" sx={{ width: 16, height: 16 }} />
            创建社区
          </Button>
        ),
      }}
    >
      <Stack spacing={2}>
        {/* 列表内容 */}
        {isLoading ? (
          <Stack spacing={2}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: 2 }} />
            ))}
          </Stack>
        ) : list.length > 0 ? (
          <>
            <Stack spacing={2}>
              {list.map((item, i) => (
                <CommunityCard key={item.id} item={item} index={i} actions={renderActions(item)} />
              ))}
            </Stack>
            <LoadMore
              hasMore={!!hasNextPage}
              loading={isFetchingNextPage}
              onLoadMore={handleLoadMore}
              show={list.length >= PAGE_SIZE}
            />
          </>
        ) : keyword ? (
          <EmptyContent
            title="未找到相关社区"
            description="赶快创建你的专属社区，和成员一起交流互动吧！"
            action={
              <Button
                sx={{ mt: 2 }}
                variant="contained"
                color="primary"
                onClick={() => router.push(paths.community.create)}
              >
                <Iconify icon="mingcute:add-line" />
                创建社区
              </Button>
            }
            sx={{ height: '70vh' }}
          />
        ) : (
          <Stack
            spacing={1}
            alignItems="center"
            justifyContent="center"
            sx={{ height: '70vh', textAlign: 'center' }}
          >
            <Iconify
              icon="eva:search-fill"
              width={64}
              height={64}
              sx={{ color: 'text.secondary' }}
            />
            <Typography variant="h6" color="text.secondary">
              发现感兴趣的社区
            </Typography>
            <Typography variant="body2" color="text.secondary">
              输入关键词，查找并加入你感兴趣的社区。
            </Typography>
          </Stack>
        )}
      </Stack>
    </MobileLayout>
  );
}
