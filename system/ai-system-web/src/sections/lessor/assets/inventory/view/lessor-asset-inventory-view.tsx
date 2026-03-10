import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import { Stack, Button, Box } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks/use-params';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useGetMyAssetDetail, useGetAssetInventory } from 'src/actions/assets';

import { Iconify } from 'src/components/iconify';
import { Searchbar } from 'src/components/custom';
import { LoadMore } from 'src/components/custom/load-more';
import { EmptyContent } from 'src/components/empty-content';
import { MobileLayout } from 'src/components/custom/layout';

import { InventoryInstanceCard } from '../inventory-instance-card';
import { useInventoryAction } from '../hooks/use-inventory-action';
import { InventoryInstanceCardSkeleton } from '../inventory-instance-card-skeleton';

// ----------------------------------------------------------------------

export function LessorAssetInventoryView() {
  const { id = '' } = useParams();
  const assetId = id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialKeyword = searchParams.get('keyword') || '';
  const [searchValue, setSearchValue] = useState(initialKeyword);

  const { data: assetDetail, dataLoading: assetLoading } = useGetMyAssetDetail(assetId);
  const {
    allData: instances,
    hasMore,
    dataValidating,
    dataLoading: listLoading,
    isFirstDataLoading,
    loadMore,
    mutate,
    clearCache,
  } = useGetAssetInventory({ assetId, keyword: searchValue });

  // const appTitle = assetDetail?.name ? `${assetDetail.name} · 实例` : '资产实例';

  const renderSkeletons = (
    <Stack spacing={2}>
      {[...Array(5)].map((_, i) => (
        <InventoryInstanceCardSkeleton key={i} />
      ))}
    </Stack>
  );

  const handleCreate = () => router.push(paths.lessor.assets.inventory.create(assetId));

  const handleInventoryAction = useInventoryAction({
    onDeleteSuccess: mutate,
    callback: mutate,
  });

  // 渲染列表
  const renderList = (
    <>
      <Stack spacing={2}>
        {instances.map((instance, index) => (
          <InventoryInstanceCard
            assetId={assetId}
            data-instance-id={instance.id}
            data-asset-id={assetId}
            key={instance.id}
            instance={instance}
            index={index}
            slotProps={{
              action: handleInventoryAction,
            }}
          />
        ))}
      </Stack>
      <LoadMore
        hasMore={hasMore}
        loading={dataValidating}
        onLoadMore={loadMore}
        disabled={listLoading}
        show={instances.length > 0}
      />
      <Box sx={{ height: 20 }} />
    </>
  );

  // 空状态
  const emptyContent = (
    <EmptyContent
      title="暂无实例"
      description="该资产下尚未添加任何实例"
      sx={{ py: 20 }}
      action={
        assetDetail ? (
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleCreate}
            sx={{ mt: 2 }}
          >
            创建实例
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
            onClick={() => router.replace(paths.dashboard.root)}
            sx={{ mt: 2 }}
          >
            返回首页
          </Button>
        )
      }
    />
  );

  const isLoading = assetLoading || isFirstDataLoading;

  useEffect(() => {
    if (searchValue) {
      searchParams.set('keyword', searchValue);
      clearCache?.();
    } else {
      searchParams.delete('keyword');
    }
    window.history.replaceState(null, '', `${window.location.pathname}?${searchParams}`);
  }, [searchValue, searchParams, clearCache]);

  return (
    <MobileLayout
      appTitle={
        <Searchbar
          defaultValue={initialKeyword}
          onChange={setSearchValue}
          slotProps={{ root: { sx: { mr: 2 } } }}
        />
      }
      appBarProps={{
        rightContent:
          instances.length > 0 ? (
            <Button
              variant="contained"
              size="small"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" width={14} />}
              onClick={handleCreate}
            >
              添加
            </Button>
          ) : undefined,
      }}
      containerProps={{ maxWidth: 'sm', sx: { pb: 4 } }}
      sx={{
        pt: {
          xs: 7,
          sm: 8,
        },
      }}
    >
      {isLoading ? (
        renderSkeletons
      ) : (
        <AnimatePresence mode="wait">
          {instances.length > 0 ? renderList : emptyContent}
        </AnimatePresence>
      )}
    </MobileLayout>
  );
}
