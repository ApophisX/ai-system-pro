import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Box, Card, Stack, alpha, Button, Divider, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import API from 'src/services/API';
import { CONFIG } from 'src/global-config';

import { LoadMore } from 'src/components/custom/load-more';
import { CurrencyTypography } from 'src/components/custom';
import { MobileLayout } from 'src/components/custom/layout';
import { Iconify, withdrawIcons } from 'src/components/iconify';

import { WithdrawSkeleton } from '../withdraw-skeleton';
import { WithdrawRecordItem } from '../withdraw-record-item';

// ----------------------------------------------------------------------

export default function LessorWithdrawView() {
  const router = useRouter();
  const [page, setPage] = useState(0);

  const { data: account, isPending: accountLoading } = useQuery({
    queryKey: ['lessor-withdraw-account'],
    queryFn: () => API.AppWithdraw.AppWithdrawControllerGetAccountV1(),
    select: (res) => res?.data?.data,
  });

  const { data, isPending, isFetching } = useQuery({
    queryKey: ['lessor-withdraw-list', page],
    queryFn: () => API.AppWithdraw.AppWithdrawControllerListV1({ page, pageSize: 10 }),
    select: (res) => res.data,
    placeholderData: (previousData) => previousData,
  });

  const availableBalance = Number.parseFloat(account?.availableBalance ?? '0') || 0;
  const frozenBalance = Number.parseFloat(account?.frozenBalance ?? '0') || 0;
  const totalBalance = Number.parseFloat(account?.totalBalance ?? '0') || 0;

  const { meta, data: withdrawList = [] } = data || {};
  const hasMore = isPending ? false : (meta?.total ?? 0) > withdrawList.length;

  const renderAccountCard = (
    <Card
      sx={{
        p: 2,
        mb: 3,
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.dark, 0.08)} 100%)`,
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              可提现余额
            </Typography>
            <CurrencyTypography
              currency={availableBalance}
              fontSize={28}
              slotProps={{ integer: { sx: { fontWeight: 700 } } }}
            />
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
              color: 'primary.main',
            }}
          >
            <Iconify icon={withdrawIcons.wallet} width={32} />
          </Box>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              冻结余额
            </Typography>
            <CurrencyTypography currency={frozenBalance} fontSize={28} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              总余额
            </Typography>
            <CurrencyTypography currency={totalBalance} fontSize={28} />
          </Box>
        </Stack>
        <Button
          fullWidth
          variant="contained"
          size="large"
          color="primary"
          startIcon={<Iconify icon={withdrawIcons.export} width={20} />}
          disabled={availableBalance < CONFIG.withdraw.minAmount || accountLoading}
          onClick={() => router.push(paths.lessor.withdraw.apply)}
        >
          申请提现
        </Button>
      </Stack>
    </Card>
  );

  const renderList = (
    <Card>
      {withdrawList.length > 0 ? (
        <Stack divider={<Divider />}>
          {withdrawList.map((item, index) => (
            <WithdrawRecordItem key={item.id} item={item} index={index} />
          ))}
        </Stack>
      ) : (
        <Stack alignItems="center" sx={{ py: 6 }} spacing={1}>
          <Iconify icon={withdrawIcons.fileText} width={48} sx={{ color: 'text.disabled' }} />
          <Typography variant="body2" color="text.secondary">
            暂无提现记录
          </Typography>
          <Typography variant="caption" color="text.disabled">
            提现申请将显示在这里
          </Typography>
        </Stack>
      )}

      <LoadMore
        hasMore={hasMore}
        loading={isFetching}
        onLoadMore={() => setPage((prev) => prev + 1)}
        disabled={isPending}
        show={withdrawList.length > 0 || isFetching}
      />
    </Card>
  );

  return (
    <MobileLayout appTitle="提现" containerProps={{ sx: { pb: 4 } }}>
      {renderAccountCard}

      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        提现记录
      </Typography>

      {isPending ? <WithdrawSkeleton /> : renderList}
    </MobileLayout>
  );
}
