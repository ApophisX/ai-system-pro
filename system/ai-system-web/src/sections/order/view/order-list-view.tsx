import { AnimatePresence } from 'framer-motion';
import React, { useMemo, useState, useCallback } from 'react';

import { Tab, Tabs, Stack, Badge } from '@mui/material';

import { useSearchParams } from 'src/routes/hooks';

import { useGetLesseeOrders } from 'src/actions/order';
import { useGetLesseeOrderStatistics } from 'src/actions/statistics';

import { LoadMore } from 'src/components/custom/load-more';
import { MobileLayout } from 'src/components/custom/layout';

import { OrderCard } from '../order-card';
import { OrderEmptyState } from '../order-empty-state';
import { OrderCardSkeleton } from '../order-card-skeleton';

// ----------------------------------------------------------------------

type TabStatus = MyApi.AppRentalOrderLesseeControllerQueryOrdersV1Params['status'] | 'all';

export function OrderListView() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const { data: lesseeOrderStatistics, mutate: mutateLesseeOrderStatistics } =
    useGetLesseeOrderStatistics();

  const [currentTab, setCurrentTab] = useState<TabStatus>(initialStatus as TabStatus);

  const [page, setPage] = useState(0);

  const statusTabs = useMemo(
    (): Array<{ value: TabStatus; label: string; count: number }> => [
      { value: 'all', label: '全部', count: 0 },
      { value: 'created', label: '待支付', count: lesseeOrderStatistics?.pendingPaymentCount ?? 0 },
      {
        value: 'pending_receipt',
        label: '待收货',
        count: lesseeOrderStatistics?.paidPendingReceiveOrderCount ?? 0,
      },
      { value: 'in_use', label: '进行中', count: lesseeOrderStatistics?.inUseCount ?? 0 },
      { value: 'overdue', label: '已逾期', count: lesseeOrderStatistics?.overdueCount ?? 0 },
      {
        value: 'completed',
        label: '已完成',
        count: 0,
        // count: lesseeOrderStatistics?.completedCount ?? 0,
      },
      {
        value: 'dispute',
        label: '争议中',
        count: lesseeOrderStatistics?.disputeCount ?? 0,
      },
    ],
    [lesseeOrderStatistics]
  );

  const {
    allData: orders,
    dataLoading,
    dataValidating,
    isFirstDataLoading,
    hasMore,
    clearCache,
    mutate,
  } = useGetLesseeOrders({ page, status: currentTab === 'all' ? undefined : currentTab });

  const handleChangeTab = useCallback(
    (event: React.SyntheticEvent, newValue: TabStatus) => {
      clearCache();
      setCurrentTab(newValue);
      setPage(0);
      window.history.replaceState(null, '', `${window.location.pathname}?status=${newValue}`);
    },
    [clearCache]
  );

  const handleRefresh = useCallback(async () => {
    clearCache();
    setPage(0);
    await mutate();
    await mutateLesseeOrderStatistics();
  }, [clearCache, mutate, mutateLesseeOrderStatistics]);

  const handleMutate = useCallback(async () => {
    mutateLesseeOrderStatistics();
    mutate();
  }, [mutateLesseeOrderStatistics, mutate]);

  // 渲染订单列表
  const renderList = (
    <Stack spacing={2}>
      {orders.map((order, index) => (
        <OrderCard key={order.id} order={order} index={index % 5} onMutate={handleMutate} />
      ))}

      {/* 加载更多 */}
      <LoadMore
        hasMore={hasMore}
        loading={dataValidating}
        onLoadMore={() => setPage((prev) => prev + 1)}
        disabled={dataLoading}
        show={orders.length > 0 && orders.length >= 10}
      />
    </Stack>
  );

  // 渲染订单列表骨架
  const renderSkeletons = (
    <Stack spacing={2}>
      {[...Array(4)].map((_, index) => (
        <OrderCardSkeleton key={index} />
      ))}
    </Stack>
  );

  // 渲染状态标签
  const statusBadgeTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={{
        '& .MuiTabs-indicator': {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
        '& .MuiTab-root': {
          minWidth: 'auto',
          flex: 1,
          px: 1,
        },
      }}
      slotProps={{
        list: {
          style: { gap: 0 },
        },
        scrollbar: {
          sx: { gap: 0 },
        },
      }}
    >
      {statusTabs.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={
            <Badge badgeContent={tab.count} color="error">
              {tab.label}
            </Badge>
          }
          sx={{ px: 0, height: 48, overflow: 'visible' }}
        />
      ))}
    </Tabs>
  );

  return (
    <MobileLayout
      appTitle="我的订单"
      appBarProps={{ extra: statusBadgeTabs }}
      onRefresh={handleRefresh}
    >
      {isFirstDataLoading ? (
        renderSkeletons
      ) : (
        <AnimatePresence mode="wait">
          {orders.length > 0 ? renderList : <OrderEmptyState sx={{ height: '70vh' }} />}
        </AnimatePresence>
      )}
    </MobileLayout>
  );
}
