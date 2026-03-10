import type { IconifyName } from 'src/components/iconify';
import type {
  MerchantInviteRewardType,
  MerchantInviteRewardStatus,
  MerchantInviteRewardItem as RewardItem,
} from '../types';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { fDateTime } from 'src/utils';

import { Iconify } from 'src/components/iconify';
import { CurrencyTypography } from 'src/components/custom';

// ----------------------------------------------------------------------

const TYPE_CONFIG: Record<
  MerchantInviteRewardType,
  { label: string; icon: IconifyName; color: string }
> = {
  REGISTER: { label: '注册奖励', icon: 'solar:user-plus-bold', color: 'info' },
  VERIFY: { label: '认证奖励', icon: 'solar:verified-check-bold', color: 'warning' },
  LIST: { label: '上架奖励', icon: 'solar:box-minimalistic-bold', color: 'success' },
  FIRST_ORDER: { label: '首单奖励', icon: 'solar:cart-3-bold', color: 'primary' },
  REBATE: { label: '订单分润', icon: 'solar:wad-of-money-bold', color: 'success' },
};

const STATUS_CONFIG: Record<MerchantInviteRewardStatus, { label: string; color: string }> = {
  PENDING: { label: '待发放', color: 'warning' },
  RELEASED: { label: '已发放', color: 'success' },
  REVOKED: { label: '已撤销', color: 'error' },
};

/** 金额单位：接口返回分为主，展示时 /100 转为元 */
const AMOUNT_DIVISOR = 100;

export function MerchantInviteRewardListItem({ item, index }: { item: RewardItem; index: number }) {
  const typeConfig = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.REBATE;
  const statusConfig = STATUS_CONFIG[item.status];

  const amountYuan = item.amount / AMOUNT_DIVISOR;

  return (
    <ListItem
      component={m.div}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      sx={{
        py: 1.5,
        px: 2,
        borderRadius: 2,
        '&:hover': {
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 2,
          bgcolor: (theme) => alpha(theme.palette[typeConfig.color as 'primary'].main, 0.12),
          color: (theme) => theme.palette[typeConfig.color as 'primary'].main,
        }}
      >
        <Iconify icon={typeConfig.icon} width={22} />
      </Box>
      <ListItemText
        primary={
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography variant="subtitle2">{typeConfig.label}</Typography>
            <Box
              component="span"
              sx={{
                px: 0.75,
                py: 0.125,
                borderRadius: 1,
                typography: 'caption',
                fontWeight: 600,
                bgcolor: (theme) =>
                  alpha(theme.palette[statusConfig.color as 'primary'].main, 0.16),
                color: (theme) => theme.palette[statusConfig.color as 'primary'].main,
              }}
            >
              {statusConfig.label}
            </Box>
          </Stack>
        }
        secondary={
          <Typography variant="caption" color="text.secondary">
            {fDateTime(item.createdAt)}
          </Typography>
        }
        primaryTypographyProps={{ variant: 'subtitle2' }}
        secondaryTypographyProps={{ variant: 'caption' }}
      />
      <CurrencyTypography
        currency={amountYuan}
        fontSize={16}
        disableDivide
        showSign={item.status === 'RELEASED'}
        color={
          item.status === 'RELEASED'
            ? 'success.main'
            : item.status === 'REVOKED'
              ? 'text.disabled'
              : 'warning.main'
        }
      />
    </ListItem>
  );
}
