import { AnimatePresence } from 'framer-motion';
import React, { useMemo, useState } from 'react';

import { Tab, Box, Tabs, Stack, Button } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useGetMyAssets } from 'src/actions/assets';
import { AssetStatus, AssetAuditStatus } from 'src/constants/assets';

import { Iconify } from 'src/components/iconify';
import { LoadMore } from 'src/components/custom/load-more';
import { MobileLayout } from 'src/components/custom/layout';
import { ListEmptyContent } from 'src/components/empty-content';

import { AssetCard } from '../asset-card';
import { AssetCardSkeleton } from '../asset-card-skeleton';
import { useAssetAction } from '../hooks/use-asset-action';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'all', label: '全部' },
  { value: 'online', label: '展示中' },
  { value: 'offline', label: '已下架' },
  { value: 'review', label: '审核中' },
];

export default function LessorAssetsView() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';

  const [currentTab, setCurrentTab] = useState(initialTab);

  const auditStatus = useMemo(() => {
    if (currentTab === 'review') {
      return AssetAuditStatus.PENDING;
    }

    if (currentTab === 'online') {
      return AssetAuditStatus.APPROVED;
    }

    return undefined;
  }, [currentTab]);

  const status = useMemo(() => {
    if (currentTab === 'online' || currentTab === 'review') {
      return AssetStatus.AVAILABLE;
    }
    if (currentTab === 'offline') {
      return AssetStatus.OFFLINE;
    }
    return undefined;
  }, [currentTab]);

  const {
    allData: assets,
    clearCache,
    hasMore,
    dataValidating,
    dataLoading,
    isFirstDataLoading,
    mutate,
  } = useGetMyAssets({ page, status, auditStatus });

  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    clearCache();
    setPage(0);
    setCurrentTab(newValue);
    window.history.replaceState(null, '', `${window.location.pathname}?tab=${newValue}`);
  };

  const { handleOnEdit, handleOnOffline, handleOnOnline, handleOnClick } = useAssetAction();

  // 骨架屏渲染
  const renderSkeletons = (
    <Stack spacing={2}>
      {[...Array(10)].map((_, index) => (
        <AssetCardSkeleton key={index} />
      ))}
    </Stack>
  );

  // 列表渲染
  const renderList = (
    <Stack spacing={2}>
      {assets.map((asset, index) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          index={index}
          onEdit={(e) => handleOnEdit(e, asset)}
          onClick={(e) => handleOnClick(e, asset)}
          onOnline={(e) => handleOnOnline(e, asset).then(() => mutate())}
          onOffline={(e) => handleOnOffline(e, asset).then(() => mutate())}
        />
      ))}

      <LoadMore
        hasMore={hasMore}
        loading={dataValidating}
        onLoadMore={() => setPage((prev) => prev + 1)}
        disabled={dataLoading}
        show={assets.length > 0 && assets.length >= 10}
      />
    </Stack>
  );

  // 空状态渲染
  const emptyContent = (
    <ListEmptyContent
      title={`暂无${currentTab === 'all' ? '资产' : currentTab === 'online' ? '展示中资产' : currentTab === 'offline' ? '已下架资产' : '审核中资产'}`}
      description={currentTab === 'all' ? '去发布第一个资产' : undefined}
      action={
        currentTab === 'all' && (
          <Button
            sx={{ mt: 2 }}
            variant="outlined"
            onClick={() => router.push(paths.rental.goodsPublish.root)}
          >
            去发布第一个资产
          </Button>
        )
      }
    />
  );

  return (
    <MobileLayout
      appTitle="我的资产"
      onRefresh={mutate}
      appBarProps={{
        rightContent: (
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" sx={{ width: 14 }} />}
            onClick={() => router.push(paths.rental.goodsPublish.root)}
            sx={{ borderRadius: 1.5 }}
          >
            添加
          </Button>
        ),
        extra: (
          <Tabs
            value={currentTab}
            onChange={handleChangeTab}
            variant="fullWidth"
            sx={{
              '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
            }}
          >
            {TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </Tabs>
        ),
      }}
      containerProps={{ sx: { pb: 10 } }}
      bottomContent={
        <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" sx={{ width: 16 }} />}
            onClick={() => router.push(paths.rental.goodsPublish.root)}
          >
            发布资产
          </Button>
        </Box>
      }
    >
      {isFirstDataLoading ? (
        renderSkeletons
      ) : (
        <AnimatePresence mode="wait">
          {assets.length > 0 ? renderList : emptyContent}
        </AnimatePresence>
      )}
    </MobileLayout>
  );
}
