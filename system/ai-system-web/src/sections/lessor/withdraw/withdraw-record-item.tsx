import type { Theme } from '@mui/material';
import type { IconifyName } from 'src/components/iconify';

import { m } from 'framer-motion';
import { useNavigate } from 'react-router';
import { varAlpha } from 'minimal-shared/utils';

import { Box, Stack, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { fDateTime } from 'src/utils';

import { CurrencyTypography } from 'src/components/custom';
import { Iconify, withdrawIcons } from 'src/components/iconify';

type WithdrawStatus =
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'canceled'
  | 'processing'
  | 'completed'
  | 'failed';

function getStatusConfig(status: WithdrawStatus): {
  label: string;
  color: string;
  bgColor: (theme: Theme) => string;
  icon: IconifyName;
} {
  switch (status) {
    case 'pending':
      return {
        label: '待审核',
        color: 'warning.main',
        bgColor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.15),
        icon: withdrawIcons.pending,
      };
    case 'reviewing':
      return {
        label: '审核中',
        color: 'info.main',
        bgColor: (theme) => varAlpha(theme.vars.palette.info.mainChannel, 0.15),
        icon: withdrawIcons.reviewing,
      };
    case 'approved':
    case 'processing':
      return {
        label: status === 'approved' ? '待打款' : '打款中',
        color: 'info.main',
        bgColor: (theme) => varAlpha(theme.vars.palette.info.mainChannel, 0.15),
        icon: withdrawIcons.wallet,
      };
    case 'completed':
      return {
        label: '已完成',
        color: 'success.main',
        bgColor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.15),
        icon: withdrawIcons.completed,
      };
    case 'rejected':
    case 'failed':
      return {
        label: status === 'rejected' ? '已拒绝' : '打款失败',
        color: 'error.main',
        bgColor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.15),
        icon: withdrawIcons.rejected,
      };
    case 'canceled':
      return {
        label: '已取消',
        color: 'text.disabled',
        bgColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.15),
        icon: withdrawIcons.rejected,
      };
    default:
      return {
        label: status,
        color: 'text.secondary',
        bgColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.15),
        icon: withdrawIcons.fileText,
      };
  }
}

type WithdrawRecordItemProps = {
  item: MyApi.OutputWithdrawOrderDto;
  index: number;
};

export function WithdrawRecordItem({ item, index }: WithdrawRecordItemProps) {
  const navigate = useNavigate();
  const amount = Number.parseFloat(item.amount) || 0;
  const config = getStatusConfig(item.status as WithdrawStatus);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        p: 2,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
      }}
      component={m.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(paths.lessor.withdraw.detail(item.id))}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: config.bgColor,
            color: config.color,
          }}
        >
          <Iconify icon={config.icon} width={24} />
        </Box>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {item.withdrawNo}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {item.withdrawChannel === 'wechat'
                ? '微信'
                : item.withdrawChannel === 'alipay'
                  ? '支付宝'
                  : '银行卡'}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {fDateTime(item.requestedAt)}
          </Typography>
        </Box>
      </Stack>

      <Stack sx={{ textAlign: 'right' }}>
        <CurrencyTypography
          color={item.status === 'completed' ? 'success.main' : 'text.primary'}
          currency={amount}
          fontSize={16}
          disableDivide
        />
        <Typography variant="caption" color="text.secondary">
          {config.label}
        </Typography>
      </Stack>
    </Stack>
  );
}
