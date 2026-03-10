import type { CustomPopoverProps } from 'src/components/custom-popover';

import { useCallback } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import { Box, Stack, Typography, type ModalProps } from '@mui/material';

import { fCurrency } from 'src/utils';

import { Iconify } from 'src/components/iconify';
import { CurrencyTypography } from 'src/components/custom';
import { CustomPopover } from 'src/components/custom-popover';
import { HorizontalStack } from 'src/components/custom/layout';

type OverduePopoverProps = {
  order: MyApi.OutputRentalOrderDto;
} & CustomPopoverProps;

export function OverdueTipPopover(props: OverduePopoverProps) {
  const { open, onClose, anchorEl, slotProps, order } = props;
  const { overdueFee, overdueFeeUnit, overdueFeeUnitLabel } = order.rentalPlanSnapshot;

  const handleClose = useCallback<NonNullable<ModalProps['onClose']>>(
    (e, reason) => {
      (e as React.SyntheticEvent).stopPropagation();
      onClose?.(e, reason);
    },
    [onClose]
  );

  return (
    <CustomPopover
      open={open}
      onClose={handleClose}
      anchorEl={anchorEl}
      slotProps={{ paper: { sx: { p: 2 } }, ...slotProps }}
    >
      <Stack spacing={1}>
        <HorizontalStack spacing={0.5}>
          <Iconify icon="custom:money-cny-circle-line" sx={{ width: 16 }} />
          <Typography variant="body2">超时费用</Typography>
        </HorizontalStack>
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            超时费用计算规则，{fCurrency(overdueFee)}/{overdueFeeUnitLabel}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {getOverdueTipText(overdueFeeUnit)}
          </Typography>
          <Box>
            <HorizontalStack spacing={0.5}>
              <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                当前已超时：
              </Typography>
              <Typography component="span" variant="body2" sx={{ color: 'error.main' }}>
                {order.overdueUseTimeLabel}
              </Typography>
            </HorizontalStack>
            <HorizontalStack spacing={0.5}>
              <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                超时费用：
              </Typography>
              <CurrencyTypography
                color="error.main"
                currency={order.overdueUseAmount}
                disableDivide
              />
            </HorizontalStack>
            <HorizontalStack spacing={0.5}>
              <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                优惠金额：
              </Typography>
              <CurrencyTypography
                color="success.main"
                currency={order.overdueUseDiscountAmount}
                disableDivide
              />
            </HorizontalStack>
          </Box>
        </Box>
      </Stack>
    </CustomPopover>
  );
}

export function OverdueUseFeeBox({ order }: { order: MyApi.OutputRentalOrderDto }) {
  const overdueTipPopover = usePopover();

  const { onOpen: handleOpen } = overdueTipPopover;
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      handleOpen(e);
    },
    [handleOpen]
  );

  if (order.overdueStatus !== 'overdue_use') {
    return null;
  }

  return (
    <>
      <Stack
        sx={{ justifyContent: 'flex-start', alignItems: 'flex-start', pr: 3 }}
        onClick={handleClick}
      >
        <CurrencyTypography color="error.main" currency={order.payableOverdueUseAmount} />
        <HorizontalStack spacing={0.5}>
          <Typography variant="caption" color="error.main">
            超时费用
          </Typography>
          <Iconify icon="eva:info-outline" sx={{ color: 'error.main' }} />
        </HorizontalStack>
      </Stack>
      {/* 逾期费用提示 */}
      <OverdueTipPopover
        {...overdueTipPopover}
        slotProps={{
          paper: { offset: [0, 10], sx: { p: 2 } },
          arrow: { placement: 'bottom-left', sx: { marginLeft: '-20px' } },
        }}
        order={order}
      />
    </>
  );
}

export function getOverdueTipText(unit: 'hour' | 'day') {
  if (unit === 'hour') {
    return '每满半小时计费一次，超过半小时按一小时计费，未满半小时也按半小时计费。';
  }
  return '未满一天部分按一天计费。';
}
