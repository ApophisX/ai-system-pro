import { useCallback } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import { Stack, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { CurrencyTypography } from 'src/components/custom';
import { CustomPopover } from 'src/components/custom-popover';
import { HorizontalStack } from 'src/components/custom/layout';

import { getRenewalPendingPayment } from './order-renewal-info';

type Props = {
  order: MyApi.OutputRentalOrderDto;
};

export function RenewalPriceInfo({ order }: Props) {
  const renewalPayment = getRenewalPendingPayment(order);

  const { onOpen: handleOpen, onClose, ...popover } = usePopover();
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      handleOpen(e);
    },
    [handleOpen]
  );

  const handleClose = useCallback(
    (e: React.SyntheticEvent) => {
      e.stopPropagation();
      onClose?.();
    },
    [onClose]
  );

  if (!renewalPayment) {
    return null;
  }

  return (
    <>
      <Stack
        color="error.main"
        sx={{ justifyContent: 'flex-start', alignItems: 'flex-start', pr: 3 }}
        onClick={handleClick}
      >
        <CurrencyTypography currency={renewalPayment.totalPayableAmount} />
        <HorizontalStack spacing={0.5}>
          <Typography variant="caption">续租费用</Typography>
          <Iconify icon="eva:info-outline" sx={{ width: 14 }} />
        </HorizontalStack>
      </Stack>
      <CustomPopover
        open={popover.open}
        onClose={handleClose}
        anchorEl={popover.anchorEl}
        slotProps={{
          paper: { offset: [0, 10], sx: { p: 2 } },
          arrow: { placement: 'bottom-left', sx: { marginLeft: '-20px' } },
        }}
      >
        <Stack spacing={1} sx={{ width: 160 }}>
          <HorizontalStack spacing={0.5}>
            <Iconify icon="eva:info-outline" sx={{ width: 16 }} />
            <Typography variant="body2">续租详情</Typography>
          </HorizontalStack>

          <HorizontalStack justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              续租时长
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.main' }}>
              {renewalPayment.renewalInfo.duration}
              {order.durationUnitLabel}
            </Typography>
          </HorizontalStack>
          <HorizontalStack justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              续租费用
            </Typography>
            <CurrencyTypography
              color="info.main"
              currency={renewalPayment.totalPayableAmount}
              disableDivide
            />
          </HorizontalStack>
        </Stack>
      </CustomPopover>
    </>
  );
}
