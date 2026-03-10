import dayjs, { Dayjs } from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box, Card, Grid, Stack, alpha, Divider, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import API from 'src/services/API';
import { CONFIG } from 'src/global-config';
import { useApiQuery } from 'src/lib/use-api-query';

import { Iconify } from 'src/components/iconify';
import { LoadMore } from 'src/components/custom/load-more';
import { CurrencyTypography } from 'src/components/custom';
import { EmptyContent } from 'src/components/empty-content';
import { MobileLayout, HorizontalStack } from 'src/components/custom/layout';

import { IncomeSkeleton } from '../income-skeleton';
import { FinanceRecordItem } from '../finance-record-item';

// ----------------------------------------------------------------------

const PAGE_SIZE = 10;

export default function LessorIncomeView() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

  const { data: financeStatistics } = useQuery({
    queryKey: ['lessor-income-statistics', selectedDate?.format('YYYY-MM') ?? ''],
    queryFn: () =>
      API.AppStatistics.AppStatisticsControllerGetLessorFinanceStatisticsV1({
        startDate: selectedDate?.startOf('month').format('YYYY-MM-DD'),
        endDate: selectedDate?.endOf('month').format('YYYY-MM-DD'),
      }),
    select: (res) => res.data.data,
  });

  // const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('today'); // TODO 后期实现

  const {
    data,
    isPending: initialLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['lessor-income-list', selectedDate?.format('YYYY-MM') ?? ''],
    queryFn: async ({ pageParam }) => {
      const res = await API.AppLessorFinance.AppLessorFinanceControllerFindPageListV1({
        page: pageParam,
        pageSize: PAGE_SIZE,
        startDate: selectedDate?.startOf('month').format('YYYY-MM-DD'),
        endDate: selectedDate?.endOf('month').format('YYYY-MM-DD'),
      });
      return res.data;
    },
    gcTime: 1000 * 60,
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

  const financeList = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data ?? []);
  }, [data?.pages]);

  const canWithdraw = (financeStatistics?.withdrawableBalance ?? 0) >= CONFIG.withdraw.minAmount;

  // 渲染统计信息
  const renderStats = (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={6}>
        <Card
          sx={{
            p: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            cursor: canWithdraw ? 'pointer' : 'default',
            transition: 'transform 0.2s, box-shadow 0.2s',
            ...(canWithdraw && {
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
            }),
          }}
          // TODO 后期实现
          // onClick={() => canWithdraw && router.push(paths.lessor.withdraw.root)}
        >
          <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
            {/* 可提现余额 (元) */}
            累计收入
          </Typography>

          <HorizontalStack
            sx={{ mt: 1 }}
            spacing={1}
            justifyContent="space-between"
            alignItems="flex-end"
          >
            <CurrencyTypography
              currency={financeStatistics?.withdrawableBalance ?? 0}
              fontSize={28}
            />
            {/* <Typography
              variant="caption"
              sx={{ opacity: 0.9, visibility: canWithdraw ? 'visible' : 'hidden' }}
            >
              点击提现 →
            </Typography> */}
          </HorizontalStack>
        </Card>
      </Grid>
      <Grid size={6} alignItems="stretch">
        <Card sx={{ p: 2, bgcolor: 'warning.main', color: 'warning.contrastText' }}>
          <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
            待入账金额 (元)
          </Typography>
          <HorizontalStack sx={{ mt: 1 }} spacing={1} justifyContent="space-between">
            <CurrencyTypography currency={financeStatistics?.pendingAmount ?? 0} fontSize={28} />
          </HorizontalStack>
        </Card>
      </Grid>
      {/* <Grid size={12}>
        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                color: 'success.main',
              }}
            >
              <Iconify icon="solar:palette-bold" width={24} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                累计结算
              </Typography>
              <Typography variant="body2" color="text.secondary">
                自加入以来
              </Typography>
            </Box>
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            ¥{financeStatistics?.totalSettledAmount ?? 0}
          </Typography>
        </Card>
      </Grid> */}
    </Grid>
  );

  // 渲染列表
  const renderList = (
    <Card>
      <Stack divider={<Divider />}>
        {financeList.map((item, index) => (
          <FinanceRecordItem key={item.id} item={item} index={index} />
        ))}
      </Stack>

      <LoadMore
        hasMore={!!hasNextPage}
        loading={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        disabled={initialLoading}
        show={financeList.length >= PAGE_SIZE}
      />
    </Card>
  );

  return (
    <MobileLayout appTitle="收入明细" containerProps={{ sx: { pb: 4 } }}>
      {/* <Tabs
        value={timeRange}
        variant="fullWidth"
        onChange={(event, newValue) => setTimeRange(newValue)}
        indicatorColor="custom"
        textColor="primary"
        sx={{ borderRadius: 1, mb: 2 }}
      >
        <Tab value="today" label="今日" />
        <Tab value="week" label="本周" />
        <Tab value="month" label="本月" />
        <Tab value="year" label="今年" />
        <Tab value="all" label="全部" />
      </Tabs> */}
      <Box sx={{ height: 12 }} />

      {/* 年月日 下拉框 */}
      <DatePicker
        label="选择时间"
        maxDate={dayjs().endOf('year')}
        openTo="year"
        format="YYYY年MM月"
        views={['year', 'month']}
        yearsOrder="desc"
        sx={{ mb: 2 }}
        value={selectedDate}
        onChange={(newValue) => setSelectedDate(newValue)}
      />

      {renderStats}

      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        收支记录
      </Typography>

      {initialLoading ? (
        <IncomeSkeleton />
      ) : financeList.length > 0 ? (
        renderList
      ) : (
        <EmptyContent title="暂无收支记录" />
      )}
    </MobileLayout>
  );
}
