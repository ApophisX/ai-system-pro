import { useMemo, useState, useCallback } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import { Tab, Tabs, Stack, Button, Skeleton, Box } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import API from 'src/services/API';
import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';
import { MobileLayout } from 'src/components/custom';
import { LoadMore } from 'src/components/custom/load-more';
import { EmptyContent } from 'src/components/empty-content';

import { CommunityCard } from '../../list/components/community-card';

// ----------------------------------------------------------------------

const PAGE_SIZE = 20;
const TAB_JOINED = 0;
const TAB_CREATED = 1;

// ----------------------------------------------------------------------

export function MyCommunityView() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const [tabValue, setTabValue] = useState(tab ? parseInt(tab) : TAB_JOINED);
  const router = useRouter();

  const queryClient = useQueryClient();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    window.history.replaceState(null, '', `${window.location.pathname}?tab=${newValue}`);
  };

  const handleRefresh = useCallback(async () => {
    if (tabValue === TAB_JOINED) {
      await queryClient.invalidateQueries({ queryKey: ['community-my-joined'] });
    } else {
      await queryClient.invalidateQueries({ queryKey: ['community-my-created'] });
    }
  }, [tabValue, queryClient]);

  return (
    <MobileLayout
      appTitle="我的社区"
      onRefresh={handleRefresh}
      appBarProps={{
        extra: (
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': { fontWeight: 600 },
              '& .Mui-selected': { color: 'primary.main' },
            }}
          >
            <Tab label="我加入的" />
            <Tab label="我创建的" />
          </Tabs>
        ),
      }}
      bottomContent={
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            backgroundColor: 'background.paper',
            borderTop: (theme) => `1px solid ${theme.vars.palette.divider}`,
          }}
        >
          {tabValue === TAB_CREATED ? (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => router.push(paths.community.create)}
              startIcon={<Iconify icon="mingcute:add-line" sx={{ width: 16, height: 16 }} />}
            >
              创建社区
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => router.push(paths.community.search)}
              startIcon={<Iconify icon="mingcute:add-line" sx={{ width: 16, height: 16 }} />}
            >
              发现社区
            </Button>
          )}
        </Box>
      }
    >
      <Stack spacing={2} sx={{ pb: 10 }}>
        {tabValue === TAB_JOINED ? (
          <JoinedCommunityList />
        ) : (
          <CreatedCommunityList onCreateClick={() => router.push(paths.community.create)} />
        )}
      </Stack>
    </MobileLayout>
  );
}

// ----------------------------------------------------------------------
// 我加入的社区列表
// ----------------------------------------------------------------------

function JoinedCommunityList() {
  const router = useRouter();
  const {
    data,
    isPending: initialLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['community-my-joined'],
    queryFn: async ({ pageParam }) => {
      const res = await API.AppCommunity.AppCommunityControllerGetMyJoinedV1({
        page: pageParam,
        pageSize: PAGE_SIZE,
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

  if (initialLoading) {
    return (
      <Stack spacing={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: 2 }} />
        ))}
      </Stack>
    );
  }

  if (list.length === 0) {
    return (
      <EmptyContent
        imgUrl={`${CONFIG.assetsDir}/assets/icons/empty/ic-content.svg`}
        title="暂无加入的社区"
        description="去发现感兴趣的社区并加入吧"
        action={
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            color="primary"
            onClick={() => router.push(paths.community.search)}
          >
            <Iconify icon="eva:search-fill" />
            发现社区
          </Button>
        }
        sx={{ py: 6 }}
      />
    );
  }

  return (
    <>
      <Stack spacing={2}>
        {list.map((item, i) => (
          <CommunityCard
            key={item.id}
            item={item}
            index={i}
            onClick={() => {
              router.push(paths.community.detail(item.id));
            }}
          />
        ))}
      </Stack>
      <LoadMore
        hasMore={!!hasNextPage}
        loading={isFetchingNextPage}
        onLoadMore={handleLoadMore}
        show={list.length >= PAGE_SIZE}
      />
    </>
  );
}

// ----------------------------------------------------------------------
// 我创建的社区列表
// ----------------------------------------------------------------------

function CreatedCommunityList({ onCreateClick }: { onCreateClick: () => void }) {
  const router = useRouter();
  const {
    data,
    isPending: initialLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['community-my-created'],
    queryFn: async ({ pageParam }) => {
      const res = await API.AppCommunity.AppCommunityControllerGetMyCreatedV1({
        page: pageParam,
        pageSize: PAGE_SIZE,
        status: '',
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
    return data.pages.flatMap((page) => page.data ?? []) as MyApi.OutputCommunityDto[];
  }, [data?.pages]);

  const handleLoadMore = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  if (initialLoading) {
    return (
      <Stack spacing={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: 2 }} />
        ))}
      </Stack>
    );
  }

  if (list.length === 0) {
    return (
      <EmptyContent
        imgUrl={`${CONFIG.assetsDir}/assets/icons/empty/ic-content.svg`}
        title="暂无创建的社区"
        description="创建你的第一个社区，邀请好友一起分享"
        action={
          <Button sx={{ mt: 2 }} variant="contained" color="primary" onClick={onCreateClick}>
            <Iconify icon="mingcute:add-line" />
            创建社区
          </Button>
        }
        sx={{ py: 6 }}
      />
    );
  }

  return (
    <>
      <Stack spacing={2}>
        {list.map((item, i) => (
          <CommunityCard
            key={item.id}
            item={item as unknown as MyApi.OutputCommunityListItemDto}
            index={i}
            onClick={() => {
              router.push(paths.community.detail(item.id));
            }}
          />
        ))}
      </Stack>
      <LoadMore
        hasMore={!!hasNextPage}
        loading={isFetchingNextPage}
        onLoadMore={handleLoadMore}
        show={list.length >= PAGE_SIZE}
      />
    </>
  );
}
