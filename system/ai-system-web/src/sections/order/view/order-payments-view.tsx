import { useMemo } from 'react';
import { m } from 'framer-motion';
import { Receipt, CreditCard } from 'lucide-react';
import { useDialogs } from '@toolpad/core/useDialogs';

import { Box, Chip, Paper, Stack, Button, Divider, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, useParams } from 'src/routes/hooks';

import { ORDER_EVENT_NAME } from 'src/constants';
import { useGetOrderDetail } from 'src/actions/order';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { CurrencyTypography } from 'src/components/custom';
import { varFade } from 'src/components/animate/variants/fade';
import { ListEmptyContent } from 'src/components/empty-content';
import { FadeInPaper } from 'src/components/custom/fade-in-paper';
import { MobileLayout, HorizontalStack } from 'src/components/custom/layout';

import { RefundPaymentRecordDialogForm } from 'src/sections/lessor/orders/refund-payment-record-dialog-form';

import { useAuthContext } from 'src/auth/hooks';

import { getRefundStatusLabelColor } from '../utils';
import { OrderPaymentsSkeleton } from '../order-payments-skeleton';

// ----------------------------------------------------------------------

/** 筛选已支付或部分支付的账单 */
const filterPaidPayments = (payments: MyApi.OutputPaymentDto[] = []) =>
  payments.filter((p) => p.isPaid || p.status === 'partial_paid');

const getPaymentStatusColor = (status: string): 'success' | 'warning' | 'default' => {
  if (status === 'paid' || status === 'completed') return 'success';
  if (status === 'partial_paid') return 'warning';
  return 'default';
};

/** 计算支付记录的可退金额 */
const getRefundableAmount = (
  record: MyApi.OutputPaymentRecordDto,
  refundRecords: MyApi.OutputRefundRecordDto[] = []
) => {
  const recordRefunds = refundRecords.filter(
    (r) => r.paymentRecordId === record.id && r.status === 'completed'
  );
  const refundedSum = recordRefunds.reduce((sum, r) => sum + r.amount, 0);
  return Math.max(0, record.amount - refundedSum);
};

/** 支付记录是否可退款 */
const canRefundRecord = (record: MyApi.OutputPaymentRecordDto, refundableAmount: number) =>
  record.status === 'completed' &&
  (record.refundStatus === 'none' ||
    record.refundStatus === 'partial_refund' ||
    !record.refundStatus) &&
  refundableAmount > 0;

// 支付记录项（含底部退款按钮）
function PaymentRecordRow({
  record,
  refundRecords,
  order,
  showRefundBtn,
  onRefundSuccess,
}: {
  record: MyApi.OutputPaymentRecordDto;
  refundRecords: MyApi.OutputRefundRecordDto[];
  order: MyApi.OutputRentalOrderDto;
  showRefundBtn: boolean;
  onRefundSuccess: () => void;
}) {
  const { open: openDialog } = useDialogs();
  const refundableAmount = getRefundableAmount(record, refundRecords);
  const canRefund = showRefundBtn && canRefundRecord(record, refundableAmount);

  const handleRefund = () => {
    openDialog(RefundPaymentRecordDialogForm, {
      order,
      paymentRecordId: record.id,
      recordNo: record.recordNo,
      maxAmount: refundableAmount,
      callback: onRefundSuccess,
    });
  };

  const renderRefundStatus = () => {
    if (record.refundStatus === 'none' || !record.refundStatus) {
      return null;
    }
    return (
      <Chip
        label={record.refundStatusLabel}
        size="small"
        color={getRefundStatusLabelColor(record.refundStatus)}
        sx={{ height: 20, fontSize: '0.7rem', borderRadius: 0.5 }}
      />
    );
  };

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        bgcolor: 'background.neutral',
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack spacing={1}>
        <HorizontalStack justifyContent="space-between">
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            记录单号：{record.recordNo}
          </Typography>
        </HorizontalStack>
        <HorizontalStack justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            支付金额
          </Typography>
          <HorizontalStack spacing={1}>
            {renderRefundStatus()}
            <CurrencyTypography currency={record.amount} disableDivide />
          </HorizontalStack>
        </HorizontalStack>
        <HorizontalStack justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            支付渠道
          </Typography>
          <Typography variant="body2">
            {record.provider === 'wechat' ? '微信' : '支付宝'}
          </Typography>
        </HorizontalStack>
        <HorizontalStack justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            支付状态
          </Typography>
          <Chip
            label={record.statusLabel}
            size="small"
            color={record.status === 'completed' ? 'success' : 'default'}
            sx={{ height: 20, fontSize: '0.7rem', borderRadius: 0.5 }}
          />
        </HorizontalStack>
        {record.paidAt && (
          <HorizontalStack justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              支付时间
            </Typography>
            <Typography variant="body2">{record.paidAt}</Typography>
          </HorizontalStack>
        )}
        {canRefund && (
          <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Button variant="outlined" color="error" size="small" onClick={handleRefund} fullWidth>
              发起退款
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

// 支付明细卡片
function PaymentItemCard({
  item,
  order,
  showRefundBtn,
  onRefresh,
}: {
  item: MyApi.OutputPaymentDto;
  order: MyApi.OutputRentalOrderDto;
  showRefundBtn: boolean;
  onRefresh: () => void;
}) {
  const isPartialPaid = item.status === 'partial_paid';
  const paymentRecords = item.paymentRecords.filter((p) => p.status === 'completed') || [];
  const refundRecords = item.refundRecords || [];
  const router = useRouter();

  return (
    <Box component={m.div} variants={varFade('in')} initial="initial" animate="animate">
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: (theme) =>
            `1px solid ${isPartialPaid ? theme.palette.warning.main + '40' : theme.palette.success.main + '40'}`,
          bgcolor: (theme) =>
            (isPartialPaid ? theme.palette.warning.main : theme.palette.success.main) + '08',
        }}
      >
        <Stack spacing={2}>
          {/* 账单概要 */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isPartialPaid ? 'warning.main' : 'success.main',
              }}
            >
              <Receipt size={22} style={{ color: 'white' }} />
            </Box>
            <Stack spacing={0} flex={1}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={0.5}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {item.paymentTypeLabel}
                  {item.isInstallment && item.periodIndex > 0 && ` · 第${item.periodIndex}期`}
                </Typography>
                <Chip
                  label={item.statusLabel}
                  color={getPaymentStatusColor(item.status)}
                  size="small"
                  sx={{ px: 0.5, borderRadius: 0.5 }}
                />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {item.paymentNo || '账单编号'}
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack spacing={1.5}>
            <HorizontalStack justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                应付金额
              </Typography>
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
            {item.discountAmount > 0 && (
              <HorizontalStack justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  已享优惠
                </Typography>
                <CurrencyTypography
                  currency={item.discountAmount}
                  disableDivide
                  isNegative
                  color="success"
                />
              </HorizontalStack>
            )}
            <HorizontalStack justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                支付金额
              </Typography>
              <CurrencyTypography currency={item.paidAmount} disableDivide />
            </HorizontalStack>
            <HorizontalStack justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                应付时间
              </Typography>
              <Typography variant="body2">{item.payableTime}</Typography>
            </HorizontalStack>
            {/* {item.paidAt && (
              <HorizontalStack justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  支付时间
                </Typography>
                <Typography variant="body2">{item.paidAt}</Typography>
              </HorizontalStack>
            )} */}
          </Stack>

          {/* 支付记录 */}
          {paymentRecords.length > 0 && (
            <>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <Stack spacing={1}>
                <HorizontalStack justifyContent="space-between">
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    支付记录
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    color="error"
                    onClick={() => {
                      router.push(paths.my.orderRefundRecords(order.id));
                    }}
                  >
                    退款记录
                    <Iconify icon="eva:arrow-ios-forward-fill" width={16} />
                  </Button>
                </HorizontalStack>
                <Stack spacing={1}>
                  {paymentRecords.map((record) => (
                    <PaymentRecordRow
                      key={record.id}
                      record={record}
                      refundRecords={refundRecords}
                      order={order}
                      showRefundBtn={showRefundBtn}
                      onRefundSuccess={onRefresh}
                    />
                  ))}
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function OrderPaymentsView() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id || '';

  const { user } = useAuthContext();
  const { data: order, dataLoading, mutate } = useGetOrderDetail(orderId);

  const paidPayments = filterPaidPayments(order?.payments);
  const showRefundBtn = useMemo(() => {
    if (!order || !user) return false;
    const allowrefundStatus: MyApi.OutputRentalOrderDto['status'][] = [
      'received',
      'pending_receipt',
      'cancel_pending',
      'dispute',
    ];
    const isAllow = allowrefundStatus.includes(order.status);
    return user?.id === order.lessorId && isAllow;
  }, [order, user]);

  const handleRefresh = () => {
    mutate();
    window.dispatchEvent(new CustomEvent(ORDER_EVENT_NAME.REFRESH_RENTAL_ORDER));
  };

  if (dataLoading) {
    return (
      <MobileLayout appTitle="支付明细" containerProps={{ sx: { pb: 3 } }}>
        <OrderPaymentsSkeleton />
      </MobileLayout>
    );
  }

  if (!order) {
    return (
      <MobileLayout appTitle="支付明细" containerProps={{ sx: { pb: 3 } }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            订单不存在
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

  return (
    <MobileLayout
      appTitle="支付明细"
      containerProps={{ sx: { pb: 3, bgcolor: 'background.default' } }}
    >
      <Stack spacing={2}>
        {/* 订单信息卡片 */}
        <FadeInPaper>
          <Stack direction="row" spacing={2}>
            <Image
              src={order.assetSnapshot?.coverImage}
              sx={{ width: 80, height: 80, borderRadius: 1.5, flexShrink: 0 }}
            />
            <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }} noWrap>
                {order.assetSnapshot?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                订单号：{order.orderNo}
              </Typography>
            </Stack>
          </Stack>
        </FadeInPaper>

        {/* 支付总览 */}
        <FadeInPaper>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <CreditCard size={24} style={{ color: 'var(--mui-palette-primary-main)' }} />
            <Typography variant="h6" flex={1}>
              支付总览
            </Typography>
          </Stack>

          <Stack spacing={1.5}>
            <HorizontalStack justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                订单金额
              </Typography>
              <CurrencyTypography currency={order.orderAmount} disableDivide />
            </HorizontalStack>
            <HorizontalStack justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                已支付
              </Typography>
              <CurrencyTypography currency={order.paidAmount} disableDivide />
            </HorizontalStack>
            <HorizontalStack justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                已支付账单数
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {paidPayments.length} 笔
              </Typography>
            </HorizontalStack>
          </Stack>
        </FadeInPaper>

        {/* 账单明细列表 */}
        <FadeInPaper>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Receipt size={20} style={{ color: 'var(--mui-palette-primary-main)' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              账单明细
            </Typography>
          </Stack>

          {paidPayments.length === 0 ? (
            <ListEmptyContent
              title="暂无已支付账单"
              description="当前订单暂无已支付或部分支付的账单记录"
              sx={{ py: 5 }}
            />
          ) : (
            <Stack spacing={2}>
              {paidPayments.map((item) => (
                <PaymentItemCard
                  key={item.id}
                  item={item}
                  order={order}
                  showRefundBtn={showRefundBtn}
                  onRefresh={handleRefresh}
                />
              ))}
            </Stack>
          )}
        </FadeInPaper>
      </Stack>
    </MobileLayout>
  );
}
