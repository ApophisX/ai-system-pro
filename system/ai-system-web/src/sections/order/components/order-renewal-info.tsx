import Decimal from 'decimal.js';
import { useMemo, useCallback } from 'react';
import { useDialogs } from '@toolpad/core/useDialogs';

import { Box, Chip, Paper, Stack, Button, Typography } from '@mui/material';

import { ORDER_EVENT_NAME } from 'src/constants';
import { fCurrency, fDateTime } from 'src/utils';

import { Iconify } from 'src/components/iconify';
import { CountdownTypography } from 'src/components/custom';
import { HorizontalStack } from 'src/components/custom/layout';

import { SetPaymentDiscountDialogForm } from 'src/sections/lessor/orders/set-payment-discount-dialog-form';

import { useAuthContext } from 'src/auth/hooks';

import { OrderDetailPanel } from './order-detail-panel';
import { PaymentStatusChip } from './payment-status-chip';

// ----------------------------------------------------------------------

type Props = {
  order: MyApi.OutputRentalOrderDto;
};

function findPaidRenewalPayment(paymnet: MyApi.OutputPaymentDto) {
  return paymnet.paymentType === 'renewal' && paymnet.status === 'paid';
}

function findPendingRenewalPayment(paymnet: MyApi.OutputPaymentDto) {
  return paymnet.paymentType === 'renewal' && paymnet.status === 'pending';
}

export function getRenewalPendingPayment(order: MyApi.OutputRentalOrderDto) {
  return order.payments.find(findPendingRenewalPayment);
}

/** 订单续租信息区块 */
export function OrderRenewalInfoSection({ order }: Props) {
  const { user } = useAuthContext();
  const { open: openDialog } = useDialogs();
  const pendingRenewalPayment = getRenewalPendingPayment(order);

  const handleRefreshOrder = useCallback(() => {
    window.dispatchEvent(new CustomEvent(ORDER_EVENT_NAME.REFRESH_RENTAL_ORDER));
  }, []);

  const handleAddDiscount = useCallback(() => {
    if (!pendingRenewalPayment) return;
    openDialog(SetPaymentDiscountDialogForm, {
      order,
      payment: pendingRenewalPayment,
      callback: handleRefreshOrder,
    });
  }, [order, pendingRenewalPayment, openDialog, handleRefreshOrder]);
  const renewalPayments = order.payments.filter(findPaidRenewalPayment);
  const totalRenewalPaid = renewalPayments
    .reduce((acc, payment) => acc.plus(payment.amount), new Decimal(0))
    .toNumber();

  const totalRenewalDuration = useMemo(() => {
    const duration = order.duration * order.rentalPeriod;
    if (order.isInstallment) {
      return (
        duration +
        renewalPayments
          .reduce((acc, payment) => acc.plus(payment.renewalInfo.duration), new Decimal(0))
          .toNumber()
      );
    }
    return duration;
  }, [order.duration, order.isInstallment, order.rentalPeriod, renewalPayments]);

  if (!pendingRenewalPayment && renewalPayments.length === 0) {
    return null;
  }

  return (
    <OrderDetailPanel>
      {/* 标题 */}
      <HorizontalStack spacing={1} sx={{ mb: 2 }}>
        <Iconify icon="solar:file-text-bold" sx={{ width: 22, height: 22 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
          续租信息
        </Typography>
        {pendingRenewalPayment ? (
          <Chip
            label="待支付续租账单"
            size="small"
            color="warning"
            variant="soft"
            sx={{ fontWeight: 600 }}
          />
        ) : (
          <Chip
            label={`已续租 ${order.renewalCount} 次`}
            size="small"
            color="info"
            variant="soft"
            sx={{ fontWeight: 600 }}
          />
        )}
      </HorizontalStack>

      {/* 续租详情信息 */}
      {renewalPayments.length > 0 && (
        <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
          <Stack spacing={1.5}>
            {/* 当前租赁总时长 */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                当前租赁总时长
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {totalRenewalDuration} {order.durationUnitLabel}
              </Typography>
            </Stack>

            {/* 当前到期时间 */}
            {order.endDate && (
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  到期时间
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {fDateTime(order.endDate)}
                </Typography>
              </Stack>
            )}

            {/* 续租累计支付金额 */}
            {totalRenewalPaid > 0 && (
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  续租累计支付
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'error.main' }}>
                  {fCurrency(order.totalRenewalPaidAmount)}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      )}

      {/* 待支付续租账单信息 */}
      {pendingRenewalPayment && (
        <Paper variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5 }} color="warning">
            待支付续租账单
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                支付状态
              </Typography>
              <PaymentStatusChip
                status={pendingRenewalPayment.status}
                label={pendingRenewalPayment.statusLabel}
              />
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                续租时长
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {pendingRenewalPayment.renewalInfo.duration} {order.durationUnitLabel}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                应付金额
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  ...(pendingRenewalPayment.discountAmount > 0
                    ? { color: 'text.secondary', textDecoration: 'line-through' }
                    : {}),
                }}
              >
                {fCurrency(pendingRenewalPayment.rentalAmount)}
              </Typography>
            </Stack>
            {pendingRenewalPayment.discountAmount > 0 && (
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  已享优惠
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  -{fCurrency(pendingRenewalPayment.discountAmount)}
                </Typography>
              </Stack>
            )}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                剩余待付
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'error.main' }}>
                {fCurrency(pendingRenewalPayment.unpaidAmount)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                剩余支付时间
              </Typography>
              <CountdownTypography expiredAt={pendingRenewalPayment.paymentExpireAt} />
            </Stack>
          </Stack>

          {user?.id === order.lessorId && (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="small"
              sx={{ mt: 1 }}
              onClick={handleAddDiscount}
            >
              {pendingRenewalPayment.discountAmount > 0 ? '修改优惠' : '添加优惠'}
            </Button>
          )}
        </Paper>
      )}

      {/* 续租支付记录列表 */}
      {renewalPayments.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 600 }}>
            续租支付记录
          </Typography>
          <Stack spacing={1}>
            {renewalPayments.map((payment, index) => (
              <Box
                key={payment.id}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={1}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', flex: 1 }}>
                    第 {index + 1} 次续租
                  </Typography>
                  <PaymentStatusChip status={payment.status} label={payment.statusLabel} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {fCurrency(payment.paidAmount)}
                  </Typography>
                </Stack>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}
                >
                  续租时长：{payment.renewalInfo.duration} {order.durationUnitLabel}
                </Typography>
                {payment.paidAt && (
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}
                  >
                    支付时间：{fDateTime(payment.paidAt)}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </OrderDetailPanel>
  );
}
