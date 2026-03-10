import { useState } from 'react';

import { Stack, Skeleton, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useGetLesseeDeposits, useGetLesseeDepositSummary } from 'src/actions/deposit';

import { LoadMore } from 'src/components/custom/load-more';
import { MobileLayout } from 'src/components/custom/layout';

import { DepositItemCard } from '../components/deposit-item-card';
import { DepositSummaryCard } from '../components/deposit-summary-card';

// ----------------------------------------------------------------------

export function DepositManagementView() {
  const [page, setPage] = useState(0);
  const router = useRouter();

  const { data: summary, dataLoading: summaryLoading } = useGetLesseeDepositSummary();
  const {
    allData: deposits,
    dataLoading: listLoading,
    dataValidating,
    hasMore,
    isFirstDataLoading,
  } = useGetLesseeDeposits({ page, pageSize: 10 });

  const isLoading = summaryLoading || listLoading;

  return (
    <MobileLayout appTitle="押金管理">
      <DepositSummaryCard summary={summary} loading={summaryLoading} />

        <Typography variant="h6" sx={{ mb: 2 }}>
          押金明细
        </Typography>

        {isFirstDataLoading ? (
          <Stack spacing={2}>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={120} />
            ))}
          </Stack>
        ) : (
          <Stack spacing={2}>
            {deposits.map((item, index) => (
              <DepositItemCard
                key={item.id}
                item={item}
                index={index}
                onClick={() => {
                  router.push(paths.my.orderDetail(item.orderId));
                }}
              />
            ))}
          </Stack>
        )}

        <LoadMore
          hasMore={hasMore}
          loading={dataValidating}
          onLoadMore={() => setPage((prev: number) => prev + 1)}
          disabled={isLoading}
          show={deposits.length > 0 && deposits.length >= 10}
        />
        {/* 
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button startIcon={<Iconify icon="carbon:bicycle" />} sx={{ color: 'text.secondary' }}>
            了解押金退还规则
          </Button>
        </Box> */}
    </MobileLayout>
  );
}
