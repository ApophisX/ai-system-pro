import dayjs from 'dayjs';
import { useMemo } from 'react';
import { m } from 'framer-motion';

import { Box, Alert, Typography, Stack } from '@mui/material';

import { fDateTime, fDurationMinutes } from 'src/utils';

import { Iconify } from 'src/components/iconify';
import { HorizontalStack } from 'src/components/custom/layout';

import { useAuthContext } from 'src/auth/hooks';

import { OrderDetailPanel } from './components';

// 进度条
type ProgressBarProps = {
  progress: number;
  isOverdue: boolean;
  disabled: boolean;
};
const ProgressBar = ({ progress, isOverdue, disabled }: ProgressBarProps) => (
  <Box
    sx={{
      width: '100%',
      height: 8,
      borderRadius: 4,
      bgcolor: 'divider',
      overflow: 'hidden',
    }}
  >
    <Box
      component={m.div}
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      sx={{
        height: '100%',
        bgcolor: disabled
          ? (theme) => theme.palette.grey[500]
          : isOverdue
            ? 'error.main'
            : progress > 85
              ? 'error.main'
              : progress > 50
                ? 'warning.main'
                : 'info.main',
        borderRadius: 4,
      }}
    />
  </Box>
);

export function OrderProgressSection({ order }: { order: MyApi.OutputRentalOrderDto }) {
  const { user } = useAuthContext();
  const progress = useMemo(() => {
    if (!order.startDate || !order.endDate) {
      return 0;
    }
    if (order.useageStatus === 'none') {
      return 0;
    }
    const startDate = dayjs(order.startDate);
    const endDate = dayjs(order.endDate);
    const returnedAt = order.returnedAt ? dayjs(order.returnedAt) : dayjs();
    const duration = endDate.diff(startDate, 'second');
    return (returnedAt.diff(startDate, 'second') / duration) * 100;
  }, [order]);

  if (order.useageStatus === 'none' || order.isProductPurchase) {
    return null;
  }

  const showOverdueFee =
    order.rentalPlanSnapshot.overdueFee > 0 && order.isInUse && order.lesseeId === user?.id;

  return (
    <OrderDetailPanel>
      <HorizontalStack spacing={1} sx={{ mb: 2 }}>
        <Iconify icon="carbon:progress-bar" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          租赁进度
        </Typography>
        <Box flex={1} />
        <Typography
          variant="body2"
          sx={{ color: progress > 100 ? 'error.main' : 'text.secondary' }}
        >
          {progress.toFixed(2)}%
        </Typography>
      </HorizontalStack>
      <ProgressBar
        progress={progress}
        isOverdue={order.isOverdue}
        disabled={order.status === 'completed'}
      />
      <HorizontalStack justifyContent="space-between" sx={{ mt: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {fDateTime(order.startDate)}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {fDateTime(order.endDate)}
        </Typography>
      </HorizontalStack>
      {order.overdueUseMinutes > 0 ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          超时使用：{fDurationMinutes(order.overdueUseMinutes)}
        </Alert>
      ) : (
        <>
          {showOverdueFee && (
            <Alert severity="info" sx={{ mt: 2 }}>
              超时费用：{order.rentalPlanSnapshot.overdueFee}/
              {order.rentalPlanSnapshot.overdueFeeUnitLabel}，请在到期前归还，否则将产生逾期费用。
            </Alert>
          )}
        </>
      )}
    </OrderDetailPanel>
  );
}
