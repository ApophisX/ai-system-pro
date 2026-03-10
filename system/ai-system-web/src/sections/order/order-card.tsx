import type { OrderActionType } from './utils/order-status';

import { m } from 'framer-motion';
import { useCallback, useMemo } from 'react';

import { Box, Chip, Paper, Stack, Button, Avatar, Divider, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { Image } from 'src/components/image/image';
import { CurrencyTypography } from 'src/components/custom';
import { HorizontalStack } from 'src/components/custom/layout';

import { useGetOrderButtons } from './hook/use-get-order-buttons';
import { useConfirmPayCallback, useGetOrderButtonClick } from './hook';
import { getRenewalPendingPayment } from './components/order-renewal-info';
import { payOrder, payRenewal, payDeposit, payOverdueFee } from './actions';
import { OrderStatusChip, OverdueUseFeeBox, RenewalPriceInfo } from './components';

// ----------------------------------------------------------------------

type Props = {
  order: MyApi.OutputRentalOrderDto;
  index: number;
  onMutate?: () => void;
};

export function OrderCard({ order, index, onMutate }: Props) {
  const router = useRouter();

  const handleCardClick = useCallback(() => {
    router.push(paths.my.orderDetail(order.id));
  }, [order.id, router]);

  const statusButtons = useGetOrderButtons(order);
  const { handleButtonClick, loading: buttonLoading } = useGetOrderButtonClick();

  const { confirmPayCallback } = useConfirmPayCallback();

  const onButtonClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const action = e.currentTarget.getAttribute('data-action') as OrderActionType;
      if (!action) return;
      const result = await handleButtonClick(action, order);

      if (result.success) {
        if (action === 'pay') {
          await payOrder(order);
          await confirmPayCallback();
        } else if (action === 'pay-deposit') {
          await payDeposit(order);
          await confirmPayCallback('支付押金提醒', '是否已支付押金成功？');
        } else if (action === 'pay-overdue-fee') {
          await payOverdueFee(order);
          await confirmPayCallback('支付超时费用提醒', '是否已支付超时费用成功？');
        } else if (action === 'pay-renewal') {
          const pendingRenewalPayment = getRenewalPendingPayment(order);
          if (!pendingRenewalPayment) return;
          await payRenewal(order, pendingRenewalPayment.id);
          await confirmPayCallback('支付续租租金提醒', '是否已支付续租租金成功？');
        }
      }
      onMutate?.();
    },
    [confirmPayCallback, handleButtonClick, onMutate, order]
  );

  return (
    <Paper
      component={m.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      sx={{
        borderRadius: 2,
        boxShadow: (theme) => theme.customShadows.card,
        cursor: 'pointer',
      }}
    >
      <OrderCardHeader
        order={order}
        avatar={order.lessor?.avatar}
        contactName={
          order.assetSnapshot?.contactName ||
          order.lessor?.profile?.realName ||
          order.lessor?.username
        }
      />

      <OrderCardContent order={order} />

      {statusButtons.length > 0 && (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <HorizontalStack justifyContent="flex-end" spacing={1} p={2}>
            {/* 订单逾期，显示逾期费用信息 */}
            <OverdueUseFeeBox order={order} />
            {/* 续租金额信息 */}
            <RenewalPriceInfo order={order} />
            <Box sx={{ flexGrow: 1 }} />
            {statusButtons.map((btn) => (
              <Button
                key={btn.action}
                variant={btn.variant}
                color={btn.color}
                size="medium"
                data-action={btn.action}
                disabled={buttonLoading}
                onClick={onButtonClick}
                sx={{ minWidth: 100, borderRadius: 50 }}
              >
                {btn.label}
              </Button>
            ))}
          </HorizontalStack>
        </>
      )}
    </Paper>
  );
}

// 卡片内容
export function OrderCardContent({ order }: { order: MyApi.OutputRentalOrderDto }) {
  // 是否是续租订单
  const isRenewalOrder = useMemo(
    () => order.payments.some((p) => p.isPaid && p.paymentType === 'renewal'),
    [order.payments]
  );
  return (
    <>
      <Stack direction="row" spacing={2} p={2}>
        <Image
          src={order.assetSnapshot?.coverImage || order.assetSnapshot?.images[0] || ''}
          sx={{ width: 80, height: 80, borderRadius: 1.5, flexShrink: 0 }}
        />
        <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} noWrap>
            {order.assetSnapshot?.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {order.isProductPurchase ? '商品规格' : '租赁方案'}：{order.rentalPlanSnapshot?.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            下单时间：{order.createdAt}
          </Typography>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        alignItems="flex-end"
        justifyContent="space-between"
        spacing={1}
        px={2}
        pb={2}
      >
        {order.isProductPurchase ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            商品数量：{order.duration}
          </Typography>
        ) : (
          <>
            {isRenewalOrder && <Chip label="续租订单" color="warning" size="small" />}

            {order.rentalPlanSnapshot.isInstallment && (
              <Chip label="分期订单" color="info" size="small" />
            )}
            {order.rentalPlanSnapshot.isInstallment ? (
              <Chip
                label={`${order.rentalPlanSnapshot?.rentalPeriod}期`}
                color="info"
                size="small"
                sx={{ borderRadius: 1 }}
              />
            ) : (
              <Chip
                label={`${order.duration}${order.durationUnitLabel}`}
                color="info"
                size="small"
                sx={{ borderRadius: 1 }}
              />
            )}
            {order.overdueStatus === 'overdue_use' && (
              <Chip label={order.overdueStatusLabel} color="error" size="small" />
            )}
          </>
        )}

        <Box sx={{ flexGrow: 1 }} />
        <CurrencyTypography currency={order.orderAmount} />
      </Stack>
    </>
  );
}

// 卡片头部
export function OrderCardHeader({
  order,
  avatar,
  contactName,
}: {
  order: MyApi.OutputRentalOrderDto;
  avatar?: string;
  contactName?: string;
}) {
  return (
    <>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
        p={2}
      >
        <HorizontalStack flex={1} spacing={1}>
          <Avatar variant="rounded" src={avatar} />
          <Stack flex={1} spacing={0.5}>
            <HorizontalStack justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle2">{contactName}</Typography>
                <Iconify
                  icon="eva:arrow-ios-forward-fill"
                  width={14}
                  sx={{ color: 'text.disabled' }}
                />
              </Stack>
              {/* 订单状态 */}
              <OrderStatusChip order={order} />
            </HorizontalStack>
            <Typography variant="caption" color="text.secondary">
              {order.orderNo}
            </Typography>
          </Stack>
        </HorizontalStack>
      </Stack>
      <Divider sx={{ borderStyle: 'dashed' }} />
    </>
  );
}
