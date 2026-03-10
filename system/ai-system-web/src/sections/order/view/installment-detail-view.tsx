import type { Theme } from '@mui/material';
import type { UserType } from 'src/auth/types';
import type { PaletteColorKey } from 'src/theme';
import type { InstallmentStatusType } from 'src/sections/payment/enum';

import { m } from 'framer-motion';
import { varAlpha } from 'minimal-shared/utils';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useBoolean, usePopover } from 'minimal-shared/hooks';
import { useRef, useMemo, useEffect, useCallback } from 'react';
import { Clock, Calendar, RotateCcw, CreditCard, AlertCircle } from 'lucide-react';

import {
  Box,
  Chip,
  Paper,
  Stack,
  Button,
  styled,
  Divider,
  Typography,
  LinearProgress,
} from '@mui/material';

import { useRouter, useParams, useSearchParams } from 'src/routes/hooks';

import { ORDER_EVENT_NAME } from 'src/constants';
import { useGetOrderDetail } from 'src/actions/order';
import { fCurrency, fDurationMinutes } from 'src/utils';

import { Iconify } from 'src/components/iconify';
import { Image } from 'src/components/image/image';
import { CustomPopover } from 'src/components/custom-popover';
import { varFade } from 'src/components/animate/variants/fade';
import { FadeInPaper } from 'src/components/custom/fade-in-paper';
import { AmountTypography } from 'src/components/custom/amount-typography';
import { MobileLayout, HorizontalStack } from 'src/components/custom/layout';
import { StatusStamp, BackgroundBox, CurrencyTypography } from 'src/components/custom';

import { SetPaymentDiscountDialogForm } from 'src/sections/lessor/orders/set-payment-discount-dialog-form';

import { useAuthContext } from 'src/auth/hooks';

import { useConfirmPayCallback } from '../hook';
import { getOverdueTipText } from '../components';
import { payOrder, payInstallment } from '../actions';
import { getRefundStatusLabelColor } from '../utils/order-status';
import { InstallmentDetailSkeleton } from '../installment-detail-skeleton';

// ----------------------------------------------------------------------

const getInstallmentStatusColor = (status: InstallmentStatusType) => {
  const colorMap: Record<InstallmentStatusType, PaletteColorKey | 'default'> = {
    pending: 'warning',
    paid: 'success',
    overdue: 'error',
    generating: 'default',
    completed: 'primary',
    due: 'default',
    canceled: 'default',
    closed: 'default',
    expired: 'default',
    partial_paid: 'default',
  };
  return colorMap[status];
};

const getInstallmentStatusIcon = (status: InstallmentStatusType) => {
  switch (status) {
    case 'paid':
    case 'completed':
      return <Iconify icon="eva:checkmark-circle-2-outline" width={14} height={14} />;
    case 'overdue':
      return <AlertCircle size={14} />;
    case 'partial_paid':
    case 'pending':
      return <CreditCard size={14} />;
    case 'generating':
      return <Iconify icon="eva:arrowhead-right-fill" width={14} height={14} />;
    case 'closed':
    case 'canceled':
      return <Iconify icon="mingcute:close-circle-line" width={14} height={14} />;
    default:
      return <Clock size={14} />;
  }
};

// 分期详情视图
export function InstallmentDetailView({ readonly = true }: { readonly?: boolean }) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const payNow = searchParams.get('payNow') === 'true';
  const orderId = params.id || '';

  const { data: order, dataLoading, mutate } = useGetOrderDetail(orderId);
  const { confirmPayCallback } = useConfirmPayCallback();

  const { value: isPaying, onTrue: onPaying, onFalse: onPayingFalse } = useBoolean(false);

  const firstLoadRef = useRef<boolean>(true);

  const { user } = useAuthContext();

  const payments = useMemo(
    () => (order?.payments || []).filter((p) => p.paymentType === 'installment'),
    [order?.payments]
  );

  const handlePay = useCallback(
    async (item: MyApi.OutputPaymentDto) => {
      try {
        onPaying();
        if (!order) return;
        if (item.periodIndex === 1) {
          await payOrder(order);
        } else {
          await payInstallment(order, item.id);
        }
        await confirmPayCallback();
        onPayingFalse();
      } finally {
        mutate();
        onPayingFalse();
      }
    },
    [confirmPayCallback, mutate, onPaying, onPayingFalse, order]
  );

  useEffect(() => {
    if (payNow && firstLoadRef.current) {
      const payment = payments?.find((p) => p.isPending && p.paymentType === 'installment');
      if (payment) {
        firstLoadRef.current = false;
        console.log(payment);

        handlePay(payment);
      }
    }
  }, [payNow, payments, handlePay]);

  if (dataLoading) {
    return (
      <MobileLayout appTitle="分期详情" containerProps={{ sx: { pb: 3 } }}>
        <InstallmentDetailSkeleton />
      </MobileLayout>
    );
  }

  if (!order) {
    return (
      <MobileLayout appTitle="分期详情" containerProps={{ sx: { pb: 3 } }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            分期信息不存在
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            请检查订单编号是否正确
          </Typography>
          <Button variant="contained" onClick={() => router.back()}>
            返回
          </Button>
        </Paper>
      </MobileLayout>
    );
  }

  if (!order) {
    return null;
  }
  const progressPercent = (order.completedPeriodCount / order.rentalPeriod) * 100;

  return (
    <MobileLayout
      appTitle="分期详情"
      containerProps={{ sx: { pb: 3, bgcolor: 'background.default' } }}
    >
      <Stack spacing={2}>
        {/* 订单信息卡片 */}
        <FadeInPaper>
          <Stack direction="row" spacing={2}>
            <Image
              src={order.assetSnapshot.coverImage}
              sx={{ width: 80, height: 80, borderRadius: 1.5, flexShrink: 0 }}
            />
            <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }} noWrap>
                {order.assetSnapshot.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                订单号：{order.orderNo}
              </Typography>
            </Stack>
          </Stack>
        </FadeInPaper>

        {/* 分期总览卡片 */}
        <FadeInPaper>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <CreditCard size={24} style={{ color: 'var(--mui-palette-primary-main)' }} />
            <Typography variant="h6" flex={1}>
              分期总览
            </Typography>
            <AmountTypography amount={order.rentalAmount} />
          </Stack>

          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                分期进度
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {order.completedPeriodCount}/{order.rentalPeriod}期
              </Typography>
            </Stack>

            <Box sx={{ position: 'relative' }}>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  color: order.isInvalid
                    ? 'grey.500'
                    : order.isOverdue
                      ? 'error.main'
                      : 'primary.main',
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'divider',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontWeight: 'bold',
                  color: 'primary.contrastText',
                  textShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
                }}
              >
                {progressPercent.toFixed(0)}%
              </Typography>
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack spacing={1.5}>
              {/* <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      总金额
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    ¥{order.rentalAmount}
                  </Typography>
                </Stack> */}
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  每期金额
                </Typography>
                <CurrencyTypography currency={order.rentalPlanSnapshot?.price} disableDivide />
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  已支付
                </Typography>
                <CurrencyTypography currency={order.paidAmount} disableDivide />
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  剩余待付
                </Typography>
                <CurrencyTypography currency={order.unpaidRentalAmount} disableDivide />
              </Stack>
            </Stack>
          </Stack>
        </FadeInPaper>

        {/* 分期列表 */}
        <FadeInPaper>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Calendar size={20} style={{ color: 'var(--mui-palette-primary-main)' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              分期账单明细
            </Typography>
          </Stack>

          <Stack spacing={2}>
            {payments.map((item) => (
              <InstallmentItemCard
                user={user}
                key={item.id}
                data-payment-id={item.id}
                order={order}
                item={item}
                readonly={readonly}
                onPay={handlePay}
                onRefresh={mutate}
                isPaying={isPaying}
              />
            ))}
          </Stack>
        </FadeInPaper>
      </Stack>
      <BackgroundBox />
    </MobileLayout>
  );
}

// ----------------------------------------------------------------------

const PaidBackgroundDecor = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -20,
  right: -20,
  width: 80,
  height: 80,
  borderRadius: '50%',
  backgroundColor: varAlpha(theme.palette.success.mainChannel, 0.3),
  opacity: 0.1,
}));

// 计算逾期时间
/**
 * 计算超时时长（小时或天，业务用于超时费用计算显示）
 * - 如果单位为小时，不足0.5小时向上取整为0.5小时，不足1小时向上取整为1小时，否则保留一位小数
 * - 如果单位为天，不足1天按1天计算，否则保留一位小数
 *
 * @param overdueMinutes 超时时间（分钟）
 * @param overdueFeeUnit 单位（'hour' | 'day'）
 */
const calculateOverdueTime = (overdueMinutes: number, overdueFeeUnit: 'hour' | 'day'): number => {
  if (!overdueMinutes || overdueMinutes <= 0) return 0;

  if (overdueFeeUnit === 'hour') {
    // 小时数
    const hours = Math.floor(overdueMinutes / 60);
    const leftMinutes = overdueMinutes % 60;

    if (leftMinutes > 0 && leftMinutes < 30) {
      return hours + 0.5;
    }
    if (leftMinutes >= 30 && leftMinutes < 60) {
      return hours + 1;
    }
    return hours;
  }

  if (overdueFeeUnit === 'day') {
    // 天数
    const days = overdueMinutes / (60 * 24);
    // 不足1天，按1天计
    if (days <= 1) return 1;

    return Math.ceil(days);
  }

  // 默认情况，返回0
  return 0;
};

type InstallmentItemCardProps = {
  user?: UserType | null;
  order: MyApi.OutputRentalOrderDto;
  item: MyApi.OutputPaymentDto;
  readonly?: boolean;
  onPay: (item: MyApi.OutputPaymentDto) => void;
  onRefresh?: () => void;
  isPaying: boolean;
};
// 分期账单卡片
function InstallmentItemCard({
  item,
  order,
  readonly = false,
  onPay,
  onRefresh,
  user,
  isPaying,
}: InstallmentItemCardProps) {
  const { open: openDialog } = useDialogs();

  const handleRefreshOrder = useCallback(() => {
    window.dispatchEvent(new CustomEvent(ORDER_EVENT_NAME.REFRESH_RENTAL_ORDER));
    onRefresh?.();
  }, [onRefresh]);

  const handleAddDiscount = useCallback(() => {
    openDialog(SetPaymentDiscountDialogForm, {
      order,
      payment: item,
      callback: handleRefreshOrder,
    });
  }, [order, item, openDialog, handleRefreshOrder]);
  const showActionButtons = useMemo(() => {
    const isShow =
      item.status === 'pending' ||
      item.status === 'overdue' ||
      item.canPrepay ||
      item.status === 'partial_paid';
    return isShow;
  }, [item.status, item.canPrepay]);

  const isLesses = user?.id === item.userId;
  const isLessor = user?.id === item.lessorId;

  const color = (theme: Theme) => {
    if (item.status === 'overdue') {
      return theme.palette.error.main;
    }
    if (item.status === 'pending') {
      return theme.palette.warning.main;
    }
    if (item.status === 'paid') {
      return theme.palette.success.main;
    }
    return theme.palette.grey[500];
  };

  const handlePay = useCallback(() => {
    onPay(item);
  }, [item, onPay]);

  const popover = usePopover();

  return (
    <Box
      component={m.div}
      variants={varFade('in')}
      initial="initial"
      animate="animate"
      sx={{ position: 'relative' }}
    >
      {item.refundStatus && item.refundStatus === 'completed' && (
        <StatusStamp label={item.refundStatusLabel} color="error" top={120} />
      )}
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: (theme) => `1px solid ${color(theme)}`,
          bgcolor: (theme) => color(theme) + '08',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 背景装饰 */}
        {item.status === 'paid' && <PaidBackgroundDecor />}

        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: color,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'common.white' }}>
                {item.periodIndex}
              </Typography>
            </Box>
            <Stack spacing={0.5} flex={1}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={0.5}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  第{item.periodIndex}期
                </Typography>
                <Chip
                  icon={getInstallmentStatusIcon(item.status)}
                  label={item.statusLabel}
                  color={getInstallmentStatusColor(item.status)}
                  size="small"
                  sx={{ px: 0.5, borderRadius: 0.5 }}
                />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {item.paymentNo || '账单编号：待生成'}
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1 }}>
            {/* 应付金额 */}
            <HorizontalStack justifyContent="space-between">
              <HorizontalStack spacing={1}>
                <Iconify icon="custom:money-cny-circle-line" sx={{ width: 16 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  应付金额
                </Typography>
              </HorizontalStack>
              <CurrencyTypography
                currency={item.rentalAmount}
                disableDivide
                slotProps={{
                  integer:
                    item.discountAmount > 0
                      ? { sx: { color: 'text.secondary', textDecoration: 'line-through' } }
                      : {},
                }}
              />
            </HorizontalStack>

            {/* 已享优惠 */}
            {item.discountAmount > 0 && (
              <>
                <HorizontalStack justifyContent="space-between">
                  <HorizontalStack spacing={1}>
                    <Iconify icon="custom:money-cny-circle-line" sx={{ width: 16 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      已享优惠
                    </Typography>
                  </HorizontalStack>
                  <CurrencyTypography
                    currency={item.discountAmount}
                    disableDivide
                    isNegative
                    color="success"
                  />
                </HorizontalStack>
                <HorizontalStack justifyContent="space-between">
                  <HorizontalStack spacing={1}>
                    <Iconify icon="custom:money-cny-circle-line" sx={{ width: 16 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      优惠后应付金额
                    </Typography>
                  </HorizontalStack>
                  <CurrencyTypography currency={item.totalPayableAmount} disableDivide />
                </HorizontalStack>
              </>
            )}

            {/* 时间信息 */}
            <HorizontalStack justifyContent="space-between">
              <HorizontalStack spacing={1}>
                <Iconify icon="solar:clock-circle-outline" sx={{ width: 16 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  应付时间
                </Typography>
              </HorizontalStack>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                {item.payableTime}
              </Typography>
            </HorizontalStack>

            {item.status === 'paid' && (
              <>
                <HorizontalStack justifyContent="space-between">
                  <HorizontalStack spacing={1}>
                    <Iconify icon="custom:money-cny-circle-line" sx={{ width: 16 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      支付金额
                    </Typography>
                  </HorizontalStack>
                  <CurrencyTypography currency={item.paidAmount} />
                </HorizontalStack>

                <HorizontalStack justifyContent="space-between">
                  <HorizontalStack spacing={1}>
                    <Iconify icon="solar:clock-circle-outline" sx={{ width: 16 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      支付时间
                    </Typography>
                  </HorizontalStack>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    {item.paidAt}
                  </Typography>
                </HorizontalStack>
              </>
            )}
            {/* 支付金额 */}

            {/* 逾期费用 */}
            {item.overdueAmount > 0 && (
              <HorizontalStack justifyContent="space-between">
                <HorizontalStack spacing={1}>
                  <Iconify icon="custom:money-cny-circle-line" sx={{ width: 16 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    逾期费用
                  </Typography>
                </HorizontalStack>
                <HorizontalStack spacing={0.5} onClick={popover.onOpen} sx={{ cursor: 'pointer' }}>
                  <Iconify icon="eva:info-outline" sx={{ width: 16, color: 'error.main' }} />
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {fCurrency(item.overdueAmount)}
                  </Typography>
                </HorizontalStack>
              </HorizontalStack>
            )}
            {/* 已逾期时间展示 */}
            {item.isOverdue && (
              <HorizontalStack justifyContent="space-between">
                <HorizontalStack spacing={1}>
                  <Iconify icon="solar:clock-circle-outline" sx={{ width: 16 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    逾期时间
                  </Typography>
                </HorizontalStack>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  {fDurationMinutes(item.overdueMinutes)}
                </Typography>
              </HorizontalStack>
            )}
            {/* 退款信息 */}
            {item.refundStatus && item.refundStatus !== 'none' && (
              <>
                <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />
                <RefundCard item={item} />
              </>
            )}
          </Stack>

          {/* 操作按钮 */}
          {showActionButtons && !readonly && isLesses && (
            <Stack direction="row" spacing={1.5} sx={{ mt: 1, position: 'relative', zIndex: 1 }}>
              {item.canPrepay ? (
                <Button
                  variant="contained"
                  size="medium"
                  onClick={handlePay}
                  sx={{ borderRadius: 2, flex: 1 }}
                  color="success"
                >
                  提前支付
                </Button>
              ) : (
                <Button
                  component={HorizontalStack}
                  variant="contained"
                  size="medium"
                  onClick={handlePay}
                  color={
                    item.status === 'overdue'
                      ? 'error'
                      : item.status === 'pending'
                        ? 'warning'
                        : 'info'
                  }
                  sx={{
                    gap: 0.5,
                    borderRadius: 3,
                    flex: item.canPrepay ? 1 : 'auto',
                    minWidth: 120,
                    alignItems: 'center',
                  }}
                  loading={isPaying}
                >
                  {item.isOverdue && item.totalPayableAmount !== item.rentalAmount && (
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {item.isOverdue ? fCurrency(item.totalPayableAmount) : ''}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {item.status === 'overdue' ? '立即支付' : '支付'}
                  </Typography>
                </Button>
              )}
            </Stack>
          )}

          {showActionButtons && !readonly && isLessor && (
            <Stack direction="row" spacing={1.5} sx={{ mt: 1, position: 'relative', zIndex: 1 }}>
              <Button
                component={HorizontalStack}
                variant="contained"
                size="medium"
                onClick={handleAddDiscount}
                color={
                  item.status === 'overdue'
                    ? 'error'
                    : item.status === 'pending'
                      ? 'warning'
                      : 'info'
                }
                sx={{
                  gap: 0.5,
                  borderRadius: 3,
                  flex: item.canPrepay ? 1 : 'auto',
                  minWidth: 120,
                  alignItems: 'center',
                }}
                loading={isPaying}
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {item.discountAmount > 0 ? '修改优惠' : '设置优惠金额'}
                </Typography>
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        anchorEl={popover.anchorEl}
        slotProps={{
          paper: { sx: { p: 2 }, offset: [20, 10] },
          arrow: {
            placement: 'bottom-left',
          },
        }}
      >
        <Stack spacing={1}>
          <HorizontalStack spacing={0.5}>
            <Iconify icon="custom:money-cny-circle-line" sx={{ width: 16 }} />
            <Typography variant="body2">逾期费用</Typography>
          </HorizontalStack>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              逾期费用计算规则，{item.overdueFee}/{item.overdueFeeUnitLabel}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {getOverdueTipText(item.overdueFeeUnit)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              当前已逾期：
              <Typography
                variant="body2"
                component="span"
                sx={{ fontWeight: 'bold', color: 'error.main' }}
              >
                {calculateOverdueTime(item.overdueMinutes, item.overdueFeeUnit)}
                {item.overdueFeeUnitLabel}
              </Typography>
            </Typography>
          </Box>
        </Stack>
      </CustomPopover>
    </Box>
  );
}

// 退款信息卡片
export function RefundCard({ item }: Pick<InstallmentItemCardProps, 'item'>) {
  // 优化：提取样式逻辑为局部函数，提升可维护性与可读性
  const getRefundStatusColor = (theme: Theme, status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: theme.palette.success.main + '08',
          border: `1px solid ${theme.palette.success.main + '20'}`,
        };
      case 'processing':
        return {
          bg: theme.palette.info.main + '08',
          border: `1px solid ${theme.palette.info.main + '20'}`,
        };
      case 'failed':
        return {
          bg: theme.palette.error.main + '08',
          border: `1px solid ${theme.palette.error.main + '20'}`,
        };
      default:
        return {
          bg: theme.palette.warning.main + '08',
          border: `1px solid ${theme.palette.warning.main + '20'}`,
        };
    }
  };

  return (
    <Box
      sx={(theme) => {
        const colors = getRefundStatusColor(theme, item.refundStatus);
        return {
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: colors.bg,
          border: colors.border,
        };
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between">
          <RotateCcw
            size={16}
            style={{
              color:
                item.refundStatus === 'completed'
                  ? 'var(--mui-palette-success-main)'
                  : item.refundStatus === 'processing'
                    ? 'var(--mui-palette-info-main)'
                    : item.refundStatus === 'failed'
                      ? 'var(--mui-palette-error-main)'
                      : 'var(--mui-palette-warning-main)',
            }}
          />
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 'bold',
              color: getRefundStatusLabelColor(item.refundStatus),
            }}
          >
            退款信息
          </Typography>
          <Box flex={1} />
          <Chip
            label={item.refundStatusLabel || '退款中'}
            size="small"
            color={getRefundStatusLabelColor(item.refundStatus)}
            sx={{ height: 20, fontSize: '0.65rem', borderRadius: 0.5 }}
          />
        </Stack>
        <Stack spacing={0.5}>
          {item.refundedAmount > 0 && (
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                退款金额
              </Typography>
              <AmountTypography
                amount={item.refundedAmount}
                color={
                  item.refundStatus === 'completed'
                    ? 'success'
                    : item.refundStatus === 'failed'
                      ? 'error'
                      : undefined
                }
                slotProps={{ amount: { sx: { fontWeight: 'bold' } } }}
              />
            </Stack>
          )}

          {item.refundedAt && (
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                退款时间
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                {item.refundedAt}
              </Typography>
            </Stack>
          )}

          {/* 退款记录列表 */}
          {item.refundRecords && item.refundRecords.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                退款记录：
              </Typography>
              <Stack spacing={1}>
                {item.refundRecords.map((record) => (
                  <Box
                    key={record.id}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack spacing={0.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          退款单号：{record.refundNo}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center">
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          退款状态：
                        </Typography>
                        <Chip
                          label={record.statusLabel || '处理中'}
                          size="small"
                          color={getRefundStatusLabelColor(record.status)}
                          sx={{ height: 18, fontSize: '0.6rem', borderRadius: 0.5 }}
                        />
                      </Stack>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        金额：¥{record.amount}
                      </Typography>
                      {record.reason && (
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                        >
                          原因：{record.reason}
                        </Typography>
                      )}
                      {record.refundedAt && (
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                        >
                          完成时间：{record.refundedAt}
                        </Typography>
                      )}
                      {record.failureReason && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'error.main',
                            fontSize: '0.7rem',
                          }}
                        >
                          失败原因：{record.failureReason}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
