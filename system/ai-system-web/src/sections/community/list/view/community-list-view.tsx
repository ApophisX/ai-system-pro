import { useMemo, useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { Stack, Button, Skeleton } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import API from 'src/services/API';

import { Iconify } from 'src/components/iconify';
import { LoadMore } from 'src/components/custom/load-more';
import { EmptyContent } from 'src/components/empty-content';
import { Searchbar, MobileLayout, HorizontalStack } from 'src/components/custom';

import { BottomNav } from 'src/sections/home/bottom-nav';

import { CommunityCard } from '../components/community-card';

// ----------------------------------------------------------------------

const PAGE_SIZE = 20;

// ----------------------------------------------------------------------

export function CommunityListView() {
  const [keyword, setKeyword] = useState('');

  const router = useRouter();

  const {
    data,
    refetch,
    isPending: initialLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['community-list', keyword],
    queryFn: async ({ pageParam }) => {
      const res = await API.AppCommunity.AppCommunityControllerGetMyJoinedV1({
        page: pageParam,
        pageSize: PAGE_SIZE,
        keyword: keyword || undefined,
      });
      return res.data;
    },
    retry: false,
    gcTime: 0,
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

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  return (
    <MobileLayout
      onRefresh={handleRefresh}
      containerProps={{
        sx: { pb: 14 },
      }}
      bottomContent={<BottomNav />}
      appTitle={
        <HorizontalStack>
          <Searchbar
            defaultValue={keyword}
            onChange={(value) => {
              setKeyword(value);
            }}
            slotProps={{ root: { sx: { py: 0.5 } } }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push(paths.community.search)}
            startIcon={<Iconify icon="eva:search-fill" />}
          >
            查找社区
          </Button>
        </HorizontalStack>
      }
      appBarProps={{
        rightContent: <div />,
      }}
    >
      <Stack spacing={2}>
        {/* 列表内容 */}
        {initialLoading ? (
          <Stack spacing={2}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: 2 }} />
            ))}
          </Stack>
        ) : list.length > 0 ? (
          <>
            <Stack spacing={2}>
              {list.map((item, i) => (
                <CommunityCard
                  key={item.id}
                  item={item}
                  index={i}
                  onClick={() => {
                    router.push(paths.community.assets(item.id));
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
        ) : (
          <EmptyContent
            title={keyword ? '未找到匹配的社区' : '暂无社区'}
            description={keyword ? '试试其他关键词' : '暂无社区，去查找社区吧'}
            action={
              <Button
                sx={{ mt: 2 }}
                variant="contained"
                color="primary"
                onClick={() => router.push(paths.community.search)}
                startIcon={<Iconify icon="eva:search-fill" />}
              >
                查找社区
              </Button>
            }
            sx={{ height: '80vh' }}
          />
        )}
      </Stack>
    </MobileLayout>
  );
}
