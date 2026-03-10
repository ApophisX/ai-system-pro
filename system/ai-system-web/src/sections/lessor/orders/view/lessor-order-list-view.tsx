import { useQuery } from '@tanstack/react-query';
import { m, AnimatePresence } from 'framer-motion';
import React, { useMemo, useState, useCallback, useEffect } from 'react';

import { Tab, Box, Tabs, Card, Stack, Paper, Badge, Divider } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import API from 'src/services/API';
import { withApiData } from 'src/lib/axios';
import { useGetLessorOrders } from 'src/actions/order';

import { LoadMore, Searchbar } from 'src/components/custom';
import { MobileLayout } from 'src/components/custom/layout';
import { ListEmptyContent } from 'src/components/empty-content';

import { useRefreshOrder } from 'src/sections/order/hook';
import { useGetLessorStatusButtons } from 'src/sections/order/utils';
import { OrderCardSkeleton } from 'src/sections/order/order-card-skeleton';
import { OrderCardHeader, OrderCardContent } from 'src/sections/order/order-card';

import { OrderBottomButtons } from './lessor-order-detail-view';

// ----------------------------------------------------------------------
type TabStatus = MyApi.AppRentalOrderLessorControllerQueryOrdersV1Params['status'] | 'all';

export default function LessorOrderListView() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status');
  const initialKeyword = searchParams.get('keyword') || '';
  const [currentTab, setCurrentTab] = useState(initialStatus || 'created');
  const [page, setPage] = useState(0);
  const [searchValue, setSearchValue] = useState(initialKeyword);

  const { data: statistics } = useQuery({
    queryKey: ['lessor-orders-statistics'],
    queryFn: () =>
      withApiData(API.AppStatistics.AppStatisticsControllerGetLessorOrderStatisticsV1()),
  });

  const {
    allData: orders,
    dataLoading,
    dataValidating,
    hasMore,
    clearCache,
    mutate,
  } = useGetLessorOrders({
    page,
    pageSize: 10,
    status: currentTab === 'all' ? undefined : (currentTab as any),
    keyword: searchValue || undefined,
  });

  useRefreshOrder({ mutate });

  const handleChangeTab = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      clearCache();
      setCurrentTab(newValue);
      setPage(0);
      window.history.replaceState(null, '', `${window.location.pathname}?status=${newValue}`);
    },
    [clearCache]
  );

  const statusTabs = useMemo(() => {
    const tabs: Array<{ value: TabStatus; label: string; count?: number }> = [
      { value: 'created', label: '待支付', count: statistics?.pendingPaymentCount ?? 0 },
      {
        value: 'pending_receipt',
        label: '待收货',
        count: statistics?.paidPendingReceiveOrderCount ?? 0,
      },
      { value: 'in_use', label: '进行中', count: statistics?.inUseCount ?? 0 },
      { value: 'overdue', label: '已逾期', count: statistics?.overdueCount ?? 0 },
      {
        value: 'completed',
        label: '已完成',
        count: 0,
        // count: statistics?.completedCount ?? 0,
      },
      {
        value: 'dispute',
        label: '争议中',
        count: statistics?.disputeCount ?? 0,
      },
      { value: 'all', label: '全部', count: 0 },
    ];
    return tabs;
  }, [statistics]);

  // 渲染订单列表骨架
  const renderSkeletons = (
    <Stack spacing={2}>
      {[...Array(5)].map((_, index) => (
        <OrderCardSkeleton key={index} />
      ))}
    </Stack>
  );

  // 渲染订单列表
  const renderList = (
    <Stack spacing={2}>
      {orders.map((order, index) => (
        <OrderCard key={order.id} order={order} index={index} />
      ))}

      <LoadMore
        hasMore={hasMore}
        loading={dataValidating}
        onLoadMore={() => setPage((prev) => prev + 1)}
        disabled={dataLoading}
      />
    </Stack>
  );

  useEffect(() => {
    if (searchValue) {
      searchParams.set('keyword', searchValue);
    } else {
      searchParams.delete('keyword');
    }
    window.history.replaceState(null, '', `${window.location.pathname}?${searchParams}`);
  }, [searchValue, searchParams]);

  return (
    <MobileLayout
      appTitle={
        <Searchbar
          defaultValue={initialKeyword}
          slotProps={{
            input: {
              sx: { py: 0.5 },
            },
          }}
          onChange={setSearchValue}
        />
      }
      onRefresh={mutate}
      sx={{ pt: { xs: 13.5, sm: 14.5, md: 15 } }}
      appBarProps={{
        rightContent: <Box sx={{ width: 8 }} />,
        extra: (
          <Paper sx={{ zIndex: 1, position: 'sticky', top: 56, borderRadius: 0 }}>
            <Tabs
              value={currentTab}
              onChange={handleChangeTab}
              variant="fullWidth"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
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
                />
              ))}
            </Tabs>
          </Paper>
        ),
      }}
    >
      {dataLoading && page === 0 ? (
        renderSkeletons
      ) : (
        <AnimatePresence mode="wait">
          {orders.length > 0 ? renderList : <ListEmptyContent title="暂无订单" />}
        </AnimatePresence>
      )}
    </MobileLayout>
  );
}
/**
 * 订单卡片
 * @param order 订单数据
 * @param index 索引
 * @returns 订单卡片
 */
function OrderCard({ order, index }: { order: MyApi.OutputRentalOrderDto; index: number }) {
  const router = useRouter();
  const statusButtons = useGetLessorStatusButtons(order);

  return (
    <Card
      key={order.id}
      component={m.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: (index % 10) * 0.1 }}
      onClick={() => router.push(paths.lessor.order.detail(order.id))}
    >
      <OrderCardHeader
        order={order}
        avatar={order.lessee.avatar}
        contactName={order.contactName || order.lessee.profile?.realName || order.lessee.username}
      />

      <OrderCardContent order={order} />

      {statusButtons.length > 0 && (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <Box sx={{ p: 2 }}>
            <OrderBottomButtons buttons={statusButtons} order={order} />
          </Box>
        </>
      )}
    </Card>
  );
}
