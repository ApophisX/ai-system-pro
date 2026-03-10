import type { OrderActionType } from '../utils/order-status';

import { m } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useCountdownSeconds } from 'minimal-shared/hooks';
import { useRef, useState, useEffect, useCallback } from 'react';

import { Box, Paper, Stack, Button, Divider, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, useParams, useSearchParams } from 'src/routes/hooks';

import { formatCountdown } from 'src/utils/format-time';

import API from 'src/services/API';

import { Iconify } from 'src/components/iconify';
import { StatusStamp } from 'src/components/custom';
import { MobileLayout } from 'src/components/custom/layout';
import { EmptyContent } from 'src/components/empty-content';
import { varFade } from 'src/components/animate/variants/fade';

import { FeeDetailButton } from 'src/sections/rental/rental-order-confirm/components';

import { useAuthContext } from 'src/auth/hooks';

import { RenewalPriceInfo } from '../components';
import { LesseeOrderAlert } from '../order-alert';
import { DepositInfo } from '../components/deposit-info';
import { OrderDetailSkeleton } from '../order-detail-skeleton';
import { OrderProgressSection } from '../order-progress-section';
import { useGetOrderButtons } from '../hook/use-get-order-buttons';
import { OrderDetailPanel } from '../components/order-detail-panel';
import { OverdueUseFeeBox } from '../components/overdue-tip-popover';
import { LessorRejectCancelOrderEvidencesSection } from '../lessor-evidences-section';
import { useRefreshOrder, useConfirmPayCallback, useGetOrderButtonClick } from '../hook';
import { payOrder, payRenewal, payDeposit, payOverdueFee, authorizeFreeDeposit } from '../actions';
import {
  OrderRenewalInfoSection,
  getRenewalPendingPayment,
} from '../components/order-renewal-info';
import {
  OrderStatusSection,
  OrderBaseInfoSection,
  OrderTimelineSection,
  OrderPriceInfoSection,
  OrderUserRemarkSection,
  OrderInstallmentSection,
  OrderShippingInfoSection,
  OrderLessorAddressInfoSection,
} from '../components/order-base-info';

// ----------------------------------------------------------------------

export function OrderDetailView() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id || '';
  const searchParams = useSearchParams();
  const payNow = searchParams.get('payNow');
  const first = useRef(true);

  const { unid } = useAuthContext();

  const {
    data: order,
    isLoading: dataLoading,
    refetch: mutate,
  } = useQuery({
    gcTime: 0,
    staleTime: 0,
    queryKey: ['order-detail', orderId],
    queryFn: () =>
      API.AppRentalOrderLessee.AppRentalOrderLesseeControllerGetOrderByIdV1({
        id: orderId,
      }),
    select: (res) => res.data.data,
  });

  const { handleButtonClick, loading: buttonLoading } = useGetOrderButtonClick();

  const { confirmPayCallback } = useConfirmPayCallback();

  const [initialSeconds, setInitialSeconds] = useState(0.01);
  const statusButtons = useGetOrderButtons(order);

  useRefreshOrder({ mutate });

  // 倒计时 hook
  const {
    start: startCountdown,
    reset: resetCountdown,
    value: countdownValue,
  } = useCountdownSeconds(initialSeconds);

  // 按钮点击事件
  const handleAction = useCallback(
    async (action: OrderActionType) => {
      if (!order) return;

      // 将需要直接mutate()的操作归为一类处理，提升可维护性
      const simpleMutateActions: OrderActionType[] = ['cancel', 'confirm', 'renew-order'];

      if (simpleMutateActions.includes(action)) {
        mutate();
        return;
      }

      switch (action) {
        case 'delete':
          router.replace(paths.my.orders);
          return;
        case 'pay':
          await payOrder(order);
          await confirmPayCallback();
          break;

        case 'pay-renewal': {
          const pendingRenewalPayment = getRenewalPendingPayment(order);
          if (!pendingRenewalPayment) {
            break;
          }
          await payRenewal(order, pendingRenewalPayment.id);
          await confirmPayCallback('支付续租租金提醒', '是否已支付续租租金成功？');
          break;
        }
        case 'pay-deposit':
          await payDeposit(order);
          await confirmPayCallback('支付押金提醒', '是否已支付押金成功？');
          break;
        case 'pay-overdue-fee':
          await payOverdueFee(order);
          await confirmPayCallback('支付提醒', '是否已支付成功？');
          break;
        case 'authorize-free-deposit':
          await authorizeFreeDeposit(order);
          await confirmPayCallback('授权免押提醒', '是否已授权免押成功？');
          break;
        default:
          break;
      }
      mutate();
    },
    [confirmPayCallback, mutate, order, router]
  );

  // 当订单状态为待支付且有支付截止时间时，更新初始秒数并启动倒计时
  useEffect(() => {
    if (order && order.isPending) {
      const expiredTime = new Date(order.paymentExpiredAt).getTime();
      const now = Date.now();
      const seconds = Math.max(0, Math.floor((expiredTime - now) / 1000) + 1);
      setInitialSeconds(seconds);
      if (seconds > 0) {
        resetCountdown();
        startCountdown();
      }
    }
  }, [resetCountdown, startCountdown, order]);

  // 自动支付逻辑
  useEffect(() => {
    if (order && payNow && first.current && order.status === 'created') {
      first.current = false;
      const payOrderAndConfirm = async () => {
        let action: OrderActionType;
        if (order.assetSnapshot.creditFreeDeposit) {
          action = 'authorize-free-deposit';
        } else if (order.depositAmount > 0 && ['pending', 'failed'].includes(order.depositStatus)) {
          action = 'pay-deposit';
        } else {
          action = 'pay';
        }
        handleAction(action);
        window.history.replaceState({}, '', window.location.pathname);
      };
      payOrderAndConfirm();
    }
  }, [order, payNow, handleAction]);

  // 倒计时结束，刷新订单
  useEffect(() => {
    if (countdownValue <= 0 && order && order.isPending) {
      mutate();
    }
  }, [countdownValue, mutate, order]);

  // 注册接收支付结果的, WebSocket 连接，用于刷新订单
  useEffect(() => {
    // TODO: 替换为实际的 WebSocket 地址
    // const ws = new WebSocket(`wss://api.example.com/ws?unid=${unid}`);
  }, [unid]);

  if (!order && !dataLoading) {
    return (
      <MobileLayout appTitle="订单详情">
        <EmptyContent
          sx={{ minHeight: '80vh' }}
          title="订单不存在"
          description="请检查订单编号是否正确"
          action={
            <Button variant="contained" onClick={() => router.back()} sx={{ mt: 2 }}>
              <Iconify icon="eva:arrow-ios-back-fill" />
              返回
            </Button>
          }
        />
      </MobileLayout>
    );
  }

  if (dataLoading) {
    return (
      <MobileLayout appTitle="订单详情">
        <OrderDetailSkeleton />
      </MobileLayout>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <MobileLayout
      appTitle="订单详情"
      containerProps={{
        sx: { pb: 16, bgcolor: 'background.default', position: 'relative' },
      }}
      onRefresh={mutate}
      bottomContent={
        statusButtons.length > 0 && (
          <ButtomButtonPaper>
            <Stack direction="row" spacing={1.5} alignItems="center">
              {
                // 待支付订单，显示支付价格信息
                order.isPending && (
                  <FeeDetailButton
                    order={order}
                    assetDetail={order.assetSnapshot}
                    rentalPlan={order.rentalPlanSnapshot}
                    needDelivery={order.needDelivery}
                    duration={order.duration}
                    isDepositPaid={order.isDepositFrozenOrPaid}
                    amount={order.firstPaymentAmount}
                  />
                )
              }
              {/* 续租金额信息 */}
              <RenewalPriceInfo order={order} />

              {/* 订单逾期，显示逾期费用信息 */}
              <OverdueUseFeeBox order={order} />

              <Box flex={1} />
              {statusButtons.map((btn) => (
                <Button
                  id={`order-detail-view-button-${btn.action}`}
                  key={btn.action}
                  variant={btn.variant}
                  color={btn.color}
                  size="large"
                  disabled={buttonLoading}
                  onClick={async () => {
                    const data = await mutate();
                    const updatedOrder = data?.data;
                    if (updatedOrder) {
                      const result = await handleButtonClick(btn.action, updatedOrder);
                      if (result.success) {
                        handleAction(result.action);
                      } else {
                        mutate();
                      }
                    }
                  }}
                  sx={{ borderRadius: 10, minWidth: 120 }}
                >
                  {btn.label}
                </Button>
              ))}
            </Stack>
          </ButtomButtonPaper>
        )
      }
    >
      {/* 退款成功水印标记 */}
      {order.refundStatus === 'completed' && (
        <StatusStamp label="退款成功" color="error" top={180} />
      )}
      {/* 订单信息 */}
      <Stack
        spacing={2}
        sx={{
          '--primary-main': (theme) => theme.palette.primary.main,
        }}
      >
        {/* 承租方订单提醒 */}
        <LesseeOrderAlert order={order} />

        {/* 订单头部信息 */}
        <OrderDetailPanel>
          {/* 订单状态信息 */}
          <OrderStatusSection order={order} />
          {/* 待支付订单倒计时 */}
          {order.isPending && order.paymentExpiredAt && countdownValue > 0 && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'warning.lighter',
                border: (theme) => `1px solid ${theme.palette.warning.light}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:clock-circle-bold" sx={{ color: 'warning.main' }} />
                <Typography variant="body2" sx={{ color: 'warning.darker', fontWeight: 600 }}>
                  支付剩余时间：
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: countdownValue <= 60 * 5 ? 'error.main' : 'warning.darker',
                    fontWeight: 'bold',
                  }}
                >
                  {formatCountdown(countdownValue, '已过期')}
                </Typography>
              </Stack>
            </Box>
          )}
        </OrderDetailPanel>

        {/* 商品信息卡片，租赁方案信息，租赁时长，每期租金 */}
        <OrderDetailPanel>
          {/* 订单基本信息/绑定设备信息 */}
          <OrderBaseInfoSection order={order} />
          <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
          {/* 出租方地址信息 */}
          <OrderLessorAddressInfoSection order={order} />
          <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
          {/* 订单金额信息 */}
          <OrderPriceInfoSection order={order} />
        </OrderDetailPanel>

        {/* 押金信息 */}
        <DepositInfo order={order} />

        {/* 收货信息卡片 */}
        <OrderShippingInfoSection order={order} />

        {/* 租赁进度卡片 */}
        <OrderProgressSection order={order} />

        {/* 分期信息卡片（如果有） */}
        <OrderInstallmentSection order={order} />

        {/* 续租信息（如果有） */}
        <OrderRenewalInfoSection order={order} />

        {/* 订单时间线 */}
        <OrderTimelineSection order={order} />

        {/* 备注信息（如果有） */}
        <OrderUserRemarkSection order={order} />

        {/* 出租方拒绝取消订单凭证，及拒绝原因 */}
        <LessorRejectCancelOrderEvidencesSection order={order} />
      </Stack>
    </MobileLayout>
  );
}

// 底部操作按钮容器
function ButtomButtonPaper({ children }: { children: React.ReactNode }) {
  return (
    <Paper
      component={m.div}
      variants={varFade('inUp')}
      initial="initial"
      animate="animate"
      transition={{ delay: 0.6 }}
      sx={{
        py: 2.5,
        px: 3,
        position: 'fixed',
        width: '100%',
        left: 0,
        bottom: 0,
        borderRadius: 0,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: (theme) => theme.customShadows.z8,
      }}
    >
      {children}
    </Paper>
  );
}

{
  /* 物流信息卡片（如果有） */
}
{
  /* {order.logistics && (
            <Paper
              component={m.div}
              variants={varFade('inUp')}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3 }}
              sx={{ p: 3, borderRadius: 2, boxShadow: (theme) => theme.customShadows.card }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Truck size={20} style={{ color: 'var(--mui-palette-primary-main)' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  物流信息
                </Typography>
              </Stack>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    快递公司
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {order.logistics.company}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    运单号
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {order.logistics.trackingNumber}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    物流状态
                  </Typography>
                  <Chip label={order.logistics.status} color="info" size="small" />
                </Stack>
 
                <Divider sx={{ my: 1 }} />
 
                <Stack spacing={2}>
                  {order.logistics.timeline.map((item, index) => (
                    <Stack key={index} direction="row" spacing={2}>
                      <Box sx={{ position: 'relative', pt: 0.5 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: index === 0 ? 'primary.main' : 'divider',
                            border: (theme) =>
                              `2px solid ${index === 0 ? theme.palette.primary.main : theme.palette.divider}`,
                          }}
                        />
                        {index < order.logistics!.timeline.length - 1 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 14,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 2,
                              height: 40,
                              bgcolor: 'divider',
                            }}
                          />
                        )}
                      </Box>
                      <Stack
                        spacing={0.5}
                        sx={{
                          flexGrow: 1,
                          pb: index < order.logistics!.timeline.length - 1 ? 2 : 0,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: index === 0 ? 'bold' : 'normal' }}
                        >
                          {item.description}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            {item.time}
                          </Typography>
                          {item.location && (
                            <>
                              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                |
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                {item.location}
                              </Typography>
                            </>
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          )} */
}
