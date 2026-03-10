import type { IconifyName } from 'src/components/iconify';
import type {
  MerchantInviteRelationStatus,
  MerchantInvitationItem as InvitationItem,
} from '../types';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';

import { fDateTime } from 'src/utils';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const STATUS_CONFIG: Record<
  MerchantInviteRelationStatus,
  { label: string; color: string; icon: IconifyName }
> = {
  REGISTERED: { label: '已注册', color: 'info', icon: 'solar:user-rounded-bold' },
  VERIFIED: { label: '已认证', color: 'warning', icon: 'solar:verified-check-bold' },
  LISTED: { label: '已上架', color: 'success', icon: 'solar:box-minimalistic-bold' },
  FIRST_ORDER: { label: '首单完成', color: 'primary', icon: 'solar:cart-3-bold' },
};

export function MerchantInvitationListItem({
  item,
  index,
}: {
  item: InvitationItem;
  index: number;
}) {
  const config = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.REGISTERED;
  const displayName = item.merchantName ?? `商户 ${item.merchantId.slice(0, 8)}`;

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
      <ListItemAvatar>
        <Avatar
          sx={{
            width: 44,
            height: 44,
            bgcolor: (theme) => alpha(theme.palette[config.color as 'primary'].main, 0.16),
            color: (theme) => theme.palette[config.color as 'primary'].main,
          }}
        >
          <Iconify icon={config.icon} width={22} />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2">{displayName}</Typography>
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 1,
                typography: 'caption',
                fontWeight: 600,
                bgcolor: (theme) => alpha(theme.palette[config.color as 'primary'].main, 0.16),
                color: (theme) => theme.palette[config.color as 'primary'].main,
              }}
            >
              {config.label}
            </Box>
          </Stack>
        }
        secondary={
          <Typography variant="caption" color="text.secondary">
            {fDateTime(item.createdAt, 'YYYY-MM-DD')}
          </Typography>
        }
        primaryTypographyProps={{ variant: 'subtitle2' }}
        secondaryTypographyProps={{ variant: 'caption' }}
      />
    </ListItem>
  );
}
