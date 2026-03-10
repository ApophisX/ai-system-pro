import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';

import { CurrencyTypography } from 'src/components/custom';

// ----------------------------------------------------------------------

const RANK_COLORS = ['primary', 'secondary', 'warning'] as const;

export function MerchantInviteRankListItem({
  item,
  index,
}: {
  item: MyApi.OutputInviteRankItemDto;
  index: number;
}) {
  const rankColor = RANK_COLORS[index % 3];
  const displayName = item.employeeName ?? `用户 ${item.employeeId?.slice(0, 8) ?? '-'}`;

  return (
    <ListItem
      component={m.div}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      sx={{
        py: 1.5,
        px: 2,
        borderRadius: 2,
        '&:hover': {
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
        },
      }}
    >
      <ListItemAvatar sx={{ minWidth: 48 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            typography: 'subtitle1',
            bgcolor: (theme) => alpha(theme.palette[rankColor].main, 0.2),
            color: (theme) => theme.palette[rankColor].main,
          }}
        >
          {item.rank}
        </Box>
      </ListItemAvatar>
      <ListItemAvatar>
        <Avatar
          src={item.employeeName}
          alt={displayName}
          sx={{
            width: 44,
            height: 44,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.2),
          }}
        >
          {(item.employeeName ?? displayName)[0]}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="subtitle2" fontWeight={600}>
            {displayName}
          </Typography>
        }
        secondary={
          <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} flexWrap="wrap">
            <Typography variant="caption" color="text.secondary">
              拓展 {item.invitedCount ?? 0} 户
            </Typography>
            <Typography variant="caption" color="text.secondary">
              首单 {item.firstOrderCount ?? 0}
            </Typography>
          </Stack>
        }
        primaryTypographyProps={{ variant: 'subtitle2' }}
      />
      <Box sx={{ textAlign: 'right' }}>
        <CurrencyTypography currency={999} fontSize={16} disableDivide />
        <Typography variant="caption" color="text.secondary" display="block">
          累计奖励
        </Typography>
      </Box>
    </ListItem>
  );
}
