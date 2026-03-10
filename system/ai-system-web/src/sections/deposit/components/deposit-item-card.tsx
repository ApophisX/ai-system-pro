import { useMemo } from 'react';
import { m } from 'framer-motion';

import { Box, Paper, PaperProps, Stack, Theme, Typography } from '@mui/material';

import { fCurrency } from 'src/utils/format-number';

import { fDateTime } from 'src/utils';

// ----------------------------------------------------------------------

const DEPOSIT_STATUS_LABELS: Record<string, string> = {
  pending: '待支付',
  frozen: '冻结中',
  paid: '已支付',
  partial_deducted: '部分扣除',
  fully_deducted: '已扣除',
  unfrozen: '已解冻',
  returned: '已退还',
  canceled: '已取消',
  none: '-',
  failed: '失败',
  refunding: '退款中',
};

function getStatusColor(status: MyApi.OutputDepositDto['status']) {
  if (status === 'frozen' || status === 'paid') {
    return {
      bgcolor: 'info.lighter',
      color: 'info.darker',
    };
  } else if (status === 'returned' || status === 'unfrozen') {
    return {
      bgcolor: 'success.lighter',
      color: 'success.darker',
    };
  } else if (status === 'partial_deducted') {
    return {
      bgcolor: 'warning.lighter',
      color: 'warning.darker',
    };
  } else if (status === 'fully_deducted') {
    return {
      bgcolor: 'error.lighter',
      color: 'error.darker',
    };
  }
  return {
    bgcolor: (theme: Theme) => theme.vars.palette.grey[200],
  };
}

// ----------------------------------------------------------------------

type DepositItemCardProps = {
  item: MyApi.OutputDepositDto;
  index: number;
} & PaperProps;

export function DepositItemCard({ item, index, ...props }: DepositItemCardProps) {
  const statusLabel = DEPOSIT_STATUS_LABELS[item.status] ?? item.status;

  const timeLabel = useMemo(() => {
    if (item.status === 'frozen' || item.status === 'paid') {
      return item.frozenAt;
    } else if (item.status === 'returned' || item.status === 'unfrozen') {
      return item.unfrozenAt;
    }
    return item.createdAt;
  }, [item.status, item.frozenAt, item.unfrozenAt, item.createdAt]);
  const statusColor = useMemo(() => getStatusColor(item.status), [item.status]);

  const displayAmount = useMemo(() => {
    if (['frozen', 'paid', 'fully_deducted'].includes(item.status)) {
      return `- ${fCurrency(item.amount)}`;
    } else if (item.status === 'returned' || item.status === 'unfrozen') {
      return `+ ${fCurrency(item.remainingAmount)}`;
    } else if (item.status === 'partial_deducted') {
      return `- ${fCurrency(item.deductedAmount)}`;
    }
    return fCurrency(item.amount);
  }, [item.status, item.amount, item.remainingAmount, item.deductedAmount]);

  return (
    <Paper
      component={m.div}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (index % 10) * 0.1 }}
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: (theme) => theme.customShadows.card,
      }}
      {...props}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flexGrow: 1, mr: 2 }}>
          订单号: {item.orderNo}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            flexShrink: 0,
            px: 1,
            py: 0.5,
            borderRadius: 0.5,
            fontWeight: 'bold',
            bgcolor: statusColor.bgcolor,
            color: statusColor.color,
          }}
        >
          {statusLabel}
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            押金单号: {item.depositNo}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            时间: {fDateTime(timeLabel)}
          </Typography>
        </Box>
        <Typography variant="h6">{displayAmount}</Typography>
      </Stack>
    </Paper>
  );
}
