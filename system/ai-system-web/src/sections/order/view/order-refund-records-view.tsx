import { m } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

import { Box, Chip, Paper, Stack, Button, Typography } from '@mui/material';

import { useParams, useRouter } from 'src/routes/hooks';

import { fCurrency } from 'src/utils';
import { useGetOrderDetail } from 'src/actions/order';

import { Image } from 'src/components/image';
import { varFade } from 'src/components/animate/variants/fade';
import { ListEmptyContent } from 'src/components/empty-content';
import { FadeInPaper } from 'src/components/custom/fade-in-paper';
import { MobileLayout, HorizontalStack } from 'src/components/custom';

import { getRefundStatusLabelColor } from '../utils/order-status';

// ----------------------------------------------------------------------

/** 从订单所有账单中聚合退款记录，按创建时间倒序 */
const aggregateRefundRecords = (order: MyApi.OutputRentalOrderDto | undefined) => {
  const records: MyApi.OutputRefundRecordDto[] = [];
  order?.payments?.forEach((p) => {
    (p.refundRecords || []).forEach((r) => records.push(r));
  });
  return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// 退款记录卡片
function RefundRecordCard({ record }: { record: MyApi.OutputRefundRecordDto }) {
  return (
    <Box component={m.div} variants={varFade('in')} initial="initial" animate="animate">
      <Paper
        sx={{
          p: 2,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack spacing={1.5}>
          <HorizontalStack justifyContent="space-between" alignItems="center">
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              退款单号：{record.refundNo}
            </Typography>
            <Chip
              label={record.statusLabel || '处理中'}
              size="small"
              color={getRefundStatusLabelColor(record.status as any)}
              sx={{ height: 22, fontSize: '0.75rem' }}
            />
          </HorizontalStack>
          <HorizontalStack justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              退款金额
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: 'error.main' }}>
              {fCurrency(record.amount)}
            </Typography>
          </HorizontalStack>
          <HorizontalStack justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              支付单号
            </Typography>
            <Typography variant="body2">{record.paymentRecordNo}</Typography>
          </HorizontalStack>
          <HorizontalStack justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              支付渠道
            </Typography>
            <Typography variant="body2">
              {record.provider === 'wechat' ? '微信' : '支付宝'}
            </Typography>
          </HorizontalStack>
          {record.reason && (
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                退款原因
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {record.reason}
              </Typography>
            </Box>
          )}
          {record.refundedAt && (
            <HorizontalStack justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                退款时间
              </Typography>
              <Typography variant="body2">{record.refundedAt}</Typography>
            </HorizontalStack>
          )}
          {record.failureReason && (
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: 'error.lighter',
                border: (theme) => `1px solid ${theme.palette.error.light}`,
              }}
            >
              <Typography variant="caption" sx={{ color: 'error.main' }}>
                失败原因：{record.failureReason}
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function OrderRefundRecordsView({ id }: { id: string }) {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id || id;

  const { data: order, dataLoading, mutate } = useGetOrderDetail(orderId);
  const refundRecords = aggregateRefundRecords(order);

  if (dataLoading) {
    return (
      <MobileLayout appTitle="退款记录" containerProps={{ sx: { pb: 3 } }}>
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Paper key={i} sx={{ p: 2, borderRadius: 2 }}>
              <Stack spacing={1}>
                <Box sx={{ height: 20, bgcolor: 'action.hover', borderRadius: 0.5 }} />
                <Box
                  sx={{ height: 16, bgcolor: 'action.hover', borderRadius: 0.5, width: '60%' }}
                />
                <Box
                  sx={{ height: 16, bgcolor: 'action.hover', borderRadius: 0.5, width: '40%' }}
                />
              </Stack>
            </Paper>
          ))}
        </Stack>
      </MobileLayout>
    );
  }

  if (!order) {
    return (
      <MobileLayout appTitle="退款记录" containerProps={{ sx: { pb: 3 } }}>
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
    <MobileLayout appTitle="退款记录" onRefresh={mutate}>
      <Stack spacing={2} height="100%">
        {/* 订单信息 */}
        <FadeInPaper>
          <Stack direction="row" spacing={2}>
            <Image
              src={order.assetSnapshot?.coverImage}
              sx={{ width: 64, height: 64, borderRadius: 1.5, flexShrink: 0 }}
            />
            <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                {order.assetSnapshot?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                订单号：{order.orderNo}
              </Typography>
            </Stack>
          </Stack>
        </FadeInPaper>

        {/* 退款记录列表 */}
        <FadeInPaper>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <RotateCcw size={20} style={{ color: 'var(--mui-palette-primary-main)' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              退款记录
            </Typography>
          </Stack>

          {refundRecords.length === 0 ? (
            <ListEmptyContent
              title="暂无退款记录"
              description="当前订单暂无退款记录"
              sx={{ py: 5 }}
            />
          ) : (
            <Stack spacing={2}>
              {refundRecords.map((record) => (
                <RefundRecordCard key={record.id} record={record} />
              ))}
            </Stack>
          )}
        </FadeInPaper>
      </Stack>
    </MobileLayout>
  );
}
