import { useQuery } from '@tanstack/react-query';

import { Stack, Skeleton, Typography } from '@mui/material';

import API from 'src/services/API';
import { CONFIG } from 'src/global-config';

import { MobileLayout } from 'src/components/custom/layout';

import { ApplyWithdrawFormContent } from '../apply-withdraw-form-content';

// ----------------------------------------------------------------------

export default function LessorWithdrawApplyView() {
  const { data: account, isPending } = useQuery({
    queryKey: ['lessor-withdraw-account'],
    queryFn: () => API.AppWithdraw.AppWithdrawControllerGetAccountV1(),
    select: (res) => res?.data?.data,
  });

  const availableBalance = Number.parseFloat(account?.availableBalance ?? '0') || 0;

  if (isPending) {
    return (
      <MobileLayout appTitle="申请提现">
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={80} />
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={48} width="100%" />
        </Stack>
      </MobileLayout>
    );
  }

  if (availableBalance < CONFIG.withdraw.minAmount) {
    return (
      <MobileLayout appTitle="申请提现">
        <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              当前可提现余额不足 ¥1，无法申请提现
            </Typography>
            <Typography variant="caption" color="text.disabled">
              请等待订单结算后再试
            </Typography>
          </Stack>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout appTitle="申请提现" containerProps={{ sx: { pb: 3 } }}>
      <ApplyWithdrawFormContent availableBalance={availableBalance} />
    </MobileLayout>
  );
}
