import type { IconifyName } from 'src/components/iconify';

import { m } from 'framer-motion';
import React, { useMemo, useState, useEffect } from 'react';

import { Box, Card, Grid, Stack, alpha, Skeleton, Typography } from '@mui/material';

import { useSearchParams } from 'src/routes/hooks';

import { useGetLessorPendingOrders } from 'src/actions/order';
import { useGetLessorPendingOrdersStatistics } from 'src/actions/statistics';

import { Iconify } from 'src/components/iconify';
import { LoadMore } from 'src/components/custom';
import { MobileLayout } from 'src/components/custom/layout';
import { ListEmptyContent } from 'src/components/empty-content';

import { LessorPendingOrderCard } from './lessor-pending-order-card';

// ----------------------------------------------------------------------
type PendingOrderStatus = MyApi.AppRentalOrderLessorControllerQueryPendingOrdersV1Params['status'];
interface LessorOrderTask {
  id: string;
  type: PendingOrderStatus;
  title: string;
  count: number;
  icon: IconifyName | string;
  color: 'info' | 'warning' | 'error' | 'success';
}

// 订单处理
export default function LessorOrderManagementView() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') as PendingOrderStatus | null;
  const { data: pendingOrdersStatistics } = useGetLessorPendingOrdersStatistics();
  const [selectedStatus, setSelectedStatus] = useState<PendingOrderStatus | null>(initialStatus);
  const [page, setPage] = useState(0);
  const {
    allData: pendingOrders,
    dataLoading,
    hasMore,
    dataValidating,
    clearCache,
    mutate,
  } = useGetLessorPendingOrders({
    page,
    pageSize: 20,
    status: selectedStatus || undefined,
  });

  // 渲染任务卡片导航栏
  const tasksNavItems = useMemo(() => {
    const tasks: LessorOrderTask[] = [
      {
        id: 'TASK-001',
        type: 'pending_receipt',
        title: '待发货',
        count: pendingOrdersStatistics?.paidCount ?? 0,
        icon: 'custom:outbound-rounded',
        color: 'info' as const,
      },
      {
        id: 'TASK-002',
        type: 'cancel_pending',
        title: '待取消',
        count: pendingOrdersStatistics?.cancelPendingCount ?? 0,
        icon: 'solar:close-circle-bold-duotone',
        color: 'warning' as const,
      },
      {
        id: 'TASK-004',
        type: 'returned_pending',
        title: '归还待确认',
        count: pendingOrdersStatistics?.returnedPendingCount ?? 0,
        icon: 'solar:check-read-bold',
        color: 'success' as const,
      },
      {
        id: 'TASK-005',
        type: 'wait_return',
        title: '待归还',
        count: pendingOrdersStatistics?.waitReturnCount ?? 0,
        icon: 'custom:return-request',
        color: 'warning' as const,
      },
      {
        id: 'TASK-003',
        type: 'overdue',
        title: '超时/逾期',
        count: pendingOrdersStatistics?.overdueCount ?? 0,
        icon: 'solar:clock-circle-bold-duotone',
        color: 'error' as const,
      },

      {
        id: 'TASK-006',
        type: 'dispute',
        title: '争议',
        count: pendingOrdersStatistics?.disputeCount ?? 0,
        icon: 'solar:danger-triangle-bold-duotone',
        color: 'error' as const,
      },
    ];
    return tasks;
  }, [pendingOrdersStatistics]);

  // 处理任务卡片点击
  const handleTaskClick = (status: LessorOrderTask['type']) => {
    if (selectedStatus === status) {
      // 如果点击的是已选中的状态，则取消选中
      setSelectedStatus(null);
      window.history.replaceState(null, '', `${window.location.pathname}`);
    } else {
      // 选中新的状态
      setSelectedStatus(status);
      window.history.replaceState(null, '', `${window.location.pathname}?status=${status}`);
    }
    // 重置页码
    setPage(0);
  };

  // 渲染任务卡片
  const renderNavItems = (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {tasksNavItems.map((task) => {
        const isSelected = selectedStatus === task.type;
        return (
          <Grid size={{ xs: 4, sm: 3 }} key={task.id}>
            <Card
              component={m.div}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTaskClick(task.type)}
              sx={{
                py: 1.5,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isSelected
                  ? (theme: any) => alpha(theme.palette[task.color].main, 0.1)
                  : 'background.paper',
                boxShadow: (theme) =>
                  isSelected ? theme.customShadows.z24 : theme.customShadows.card,
                border: (theme) =>
                  `2px solid ${isSelected ? theme.palette[task.color].main : 'transparent'}`,
                transition: (theme) =>
                  theme.transitions.create(['background-color', 'box-shadow', 'border'], {
                    duration: theme.transitions.duration.shorter,
                  }),
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: (theme: any) =>
                    alpha(theme.palette[task.color].main, isSelected ? 0.2 : 0.1),
                  color: `${task.color}.main`,
                  margin: '0 auto',
                  mb: 1,
                }}
              >
                <Iconify icon={task.icon as IconifyName} width={24} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {task.title}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {task.count}
              </Typography>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

  // 获取当前选中状态的标题
  const getListTitle = () => {
    if (!selectedStatus) {
      return '急需处理';
    }
    const selectedTask = tasksNavItems.find((task) => task.type === selectedStatus);
    return selectedTask ? selectedTask.title : '订单列表';
  };

  // 渲染订单列表
  const renderActionList = (
    <Stack spacing={2}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
        {getListTitle()}
      </Typography>
      {pendingOrders.length === 0 && !dataLoading ? (
        <ListEmptyContent
          title="暂无订单"
          slotProps={{
            root: {
              sx: { height: 'auto', py: 15 },
            },
          }}
        />
      ) : (
        pendingOrders.map((order, index) => (
          <LessorPendingOrderCard
            key={order.id}
            order={order}
            index={index}
            onCancelPendingCountdownEnd={mutate}
          />
        ))
      )}
    </Stack>
  );

  // 当选中状态改变时，重置页码
  useEffect(() => {
    clearCache();
    setPage(0);
  }, [clearCache, selectedStatus]);

  return (
    <MobileLayout appTitle="订单管理">
      {renderNavItems}
        {dataLoading && page === 0 ? (
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            <Skeleton variant="text" width={100} height={24} />
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
          </Stack>
        ) : (
          renderActionList
        )}
        {/* 加载更多触发器 */}
        <LoadMore
          hasMore={hasMore}
          loading={dataValidating || dataLoading}
          onLoadMore={() => setPage((prev) => prev + 1)}
          disabled={dataLoading}
          show={pendingOrders.length > 0}
        />
    </MobileLayout>
  );
}
