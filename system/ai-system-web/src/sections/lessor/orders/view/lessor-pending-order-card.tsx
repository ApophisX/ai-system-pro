import { m } from 'framer-motion';
import { varAlpha } from 'minimal-shared/utils';

import { Card, Chip, Stack, Button, Avatar, Typography, Box } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fDateTime } from 'src/utils';

import { Image } from 'src/components/image';
import { HorizontalStack } from 'src/components/custom/layout';

import { OrderStatusChip } from 'src/sections/order/components';

import { CancelPendingCountdown } from '../components/cancel-pending-countdown';

// ----------------------------------------------------------------------

interface LessorPendingOrderCardProps {
  order: MyApi.OutputRentalOrderDto;
  index?: number;
  onCancelPendingCountdownEnd?: () => void;
}

export function LessorPendingOrderCard({
  order,
  index = 0,
  onCancelPendingCountdownEnd,
}: LessorPendingOrderCardProps) {
  const router = useRouter();
  const handleClick = () => {
    router.push(paths.lessor.order.detail(order.id));
  };

  return (
    <Card
      component={m.div}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      sx={{ p: 1.5, cursor: 'pointer' }}
      onClick={handleClick}
    >
      <Stack direction="row" spacing={1.5}>
        <Image
          src={order.assetSnapshot.coverImage}
          alt={order.assetSnapshot.name}
          sx={{
            width: 96,
            height: 96,
            borderRadius: 1,
            flexShrink: 0,
            bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.1),
          }}
          slotProps={{ img: { sx: { objectFit: 'contain' } } }}
        />
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 0.5 }}
          >
            <Typography variant="subtitle2" noWrap sx={{ maxWidth: '70%', flex: 1 }}>
              {order.assetSnapshot.name}
            </Typography>

            <OrderStatusChip order={order} sx={{ fontSize: 10, height: 18, borderRadius: 0.5 }} />
          </Stack>
          <CancelPendingCountdown
            seconds={order.cancelRefundConfirmDeadline}
            status={order.status}
            onCountdownEnd={onCancelPendingCountdownEnd}
          />

          <HorizontalStack justifyContent="space-between" alignItems="flex-end" sx={{ flex: 1 }}>
            <Box>
              <HorizontalStack spacing={0.5}>
                <Avatar src={order.lessee.avatar} sx={{ width: 20, height: 20 }} />
                <Typography variant="caption">{order.lessee.username}</Typography>
              </HorizontalStack>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {fDateTime(order.paidAt)}
              </Typography>
            </Box>
            <Button variant="contained" size="small" color="error">
              立即处理
            </Button>
          </HorizontalStack>
        </Stack>
      </Stack>
    </Card>
  );
}
