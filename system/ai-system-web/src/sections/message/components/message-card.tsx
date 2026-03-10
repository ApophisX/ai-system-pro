import type { CardProps } from '@mui/material';
import type { IconifyName } from 'src/components/iconify';

import { m } from 'framer-motion';

import { Box, Card, alpha, Stack, Typography } from '@mui/material';

import { fToNow } from 'src/utils';

import { Iconify } from 'src/components/iconify';

const ICONS: Record<MyApi.OutputMessageDto['type'], IconifyName> = {
  SYSTEM: 'solar:bell-bing-bold-duotone',
  ORDER: 'solar:bill-list-bold',
  USER: 'solar:user-rounded-bold',
  VERIFICATION: 'solar:shield-check-bold',
  PAYMENT: 'solar:wad-of-money-bold',
  ASSET: 'solar:box-minimalistic-bold',
  REVIEW: 'solar:dumbbell-large-minimalistic-bold',
};

type MessageCardProps = {
  msg: MyApi.OutputMessageDto;
  index: number;
} & CardProps;

export function MessageCard({ msg, index, ...props }: MessageCardProps) {
  return (
    <Card
      component={m.div}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: (index % 10) * 0.01 }}
      sx={{
        p: 2,
        cursor: 'pointer',
        position: 'relative',
        '&:hover': { bgcolor: 'background.neutral' },
      }}
      {...props}
    >
      <Stack direction="row" spacing={2}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) =>
              msg.isUnread
                ? alpha(theme.palette.primary.main, 0.15)
                : alpha(theme.palette.grey[500], 0.15),
            color: (theme) => (msg.isUnread ? theme.palette.primary.main : theme.palette.grey[500]),
            flexShrink: 0,
          }}
        >
          <Iconify icon={ICONS[msg.type]} width={24} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 0.5 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: !msg.readAt ? 'bold' : 500 }}>
              {msg.title}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {fToNow(msg.createdAt)}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap={false}
            sx={{ mb: 0.5, wordBreak: 'break-all' }}
          >
            {msg.content}
          </Typography>
          {msg.isUnread && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'error.main',
              }}
            />
          )}
        </Box>
      </Stack>
    </Card>
  );
}
