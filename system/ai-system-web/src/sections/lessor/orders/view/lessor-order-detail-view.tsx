import type { LessorStatusButtonProps } from 'src/sections/order/utils/order-status';

import { m } from 'framer-motion';
import { useEffect, useCallback } from 'react';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Paper, Stack, Alert, Button, Divider, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, useParams } from 'src/routes/hooks';

import API from 'src/services/API';
import { ORDER_EVENT_NAME } from 'src/constants';
import { fCurrency, fDurationMinutes } from 'src/utils';

import { MyConfirmDialog } from 'src/components/custom';
import { varFade } from 'src/components/animate/variants/fade';
import { ListEmptyContent } from 'src/components/empty-content';
import { FadeInBox, FadeInPaper } from 'src/components/custom/fade-in-paper';
import { MobileLayout, HorizontalStack } from 'src/components/custom/layout';

import { OrderProgressSection } from 'src/sections/order/order-progress-section';
import { useGetLessorStatusButtons } from 'src/sections/order/utils/order-status';
import { OrderRenewalInfoSection } from 'src/sections/order/components/order-renewal-info';
import { DepositInfo, OverdueUseFeeBox, DisputeOrderAlert } from 'src/sections/order/components';
import {
  OrderStatusSection,
  OrderBaseInfoSection,
  OrderTimelineSection,
  OrderPriceInfoSection,
  OrderUserRemarkSection,
  OrderLesseeInfoSection,
  OrderInstallmentSection,
  OrderShippingInfoSection,
} from 'src/sections/order/components/order-base-info';

import { OperationTimeoutCountdown } from '../components';
import { CancelOrderDialogForm } from '../cancel-order-dialog-form';
import { SetDiscountDialogForm } from '../set-discount-dialog-form';
import { ConfirmReturnDialogForm } from '../confirm-return-dialog-form';
import { DeductDepositDialogForm } from '../deduct-deposit-dialog-form';
import { LessorOrderDetailSkeleton } from '../lessor-order-detail-skeleton';
import { LesseeCancelOrderEvidencesSection } from '../lessee-evidences-section';
import { SetOverdueUseDiscountDialogForm } from '../set-overdue-use-discount-dialog-form';
import { ReviewCancelRequestDialogForm } from '../review-cancel-request-order-dialog-form';

// ----------------------------------------------------------------------

export function LessorOrderDetailView() {
  const params = useParams();
  const orderId = params.id || '';

  const {
    data: order,
    isLoading: dataLoading,
    refetch: mutate,
  } = useQuery({
    gcTime: 0,
    queryKey: ['order-detail', orderId],
    queryFn: () =>
      API.AppRentalOrderLessee.AppRentalOrderLesseeControllerGetOrderByIdV1({
        id: orderId,
      }),
    select: (res) => res.data.data,
  });

  const queryClient = useQueryClient();

  const statusButtons = useGetLessorStatusButtons(order);

  useEffect(() => {
    const handleRefreshOrder = () => {
      mutate();
      queryClient.invalidateQueries({ queryKey: ['lessor-status-buttons', orderId] });
    };
    window.addEventListener(ORDER_EVENT_NAME.REFRESH_RENTAL_ORDER, handleRefreshOrder);
    return () => {
      window.removeEventListener(ORDER_EVENT_NAME.REFRESH_RENTAL_ORDER, handleRefreshOrder);
    };
  }, [mutate, queryClient, orderId]);

  if (dataLoading) {
    return (
      <MobileLayout appTitle="订单详情">
        <LessorOrderDetailSkeleton />
      </MobileLayout>
    );
  }

  if (!order) {
    return (
      <MobileLayout appTitle="订单详情">
        <ListEmptyContent title="订单不存在" />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      appTitle="订单详情"
      containerProps={{ sx: { pb: 18 } }}
      onRefresh={mutate}
      bottomContent={
        statusButtons.length > 0 && (
          <Paper
            component={m.div}
            variants={varFade('inUp')}
            initial="initial"
            animate="animate"
            sx={{
              py: 2,
              px: 3,
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              borderRadius: 0,
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: (theme) => theme.customShadows.z8,
            }}
          >
            <OrderBottomButtons order={order} buttons={statusButtons} />
          </Paper>
        )
      }
    >
      <Stack spacing={2}>
        {['overdue_use', 'overdue'].includes(order.overdueStatus) && (
          <Alert severity="warning">
            {order.overdueStatus === 'overdue_use' && (
              <>
                该订单已超出约定归还时间，属于超时使用状态。请及时与租客沟通，协商归还及后续处理方案，以免产生争议。已超时使用：
                <Typography component="span" variant="body2" sx={{ color: 'error.main' }}>
                  {fDurationMinutes(order.overdueUseMinutes)}
                </Typography>
                ，需支付逾期费用：
                <Typography component="span" variant="body2" sx={{ color: 'error.main' }}>
                  {fCurrency(order.payableOverdueUseAmount)}
                </Typography>
              </>
            )}
            {order.overdueStatus === 'overdue' &&
              '该订单存在逾期未支付的账单。请尽快联系租客完成支付，如有疑问可通过平台协助申诉或催收。'}
          </Alert>
        )}
        {order.overdueStatus === 'overdue_fee_paid' && (
          <FadeInBox>
            <Alert severity="success">
              逾期费用已结清。请与租客保持沟通，尽快协商归还及后续事宜，避免产生不必要的纠纷。
            </Alert>
          </FadeInBox>
        )}

        {/* 提醒用户尽快确认收货提示 */}
        {order.hasBindInventory && !order.isOrderEnded && (
          <FadeInBox>
            <Alert severity="warning">
              已绑定资产实例，请及时与租客确认收货，避免计时偏差。实际计费时间以确认收货为准。
            </Alert>
          </FadeInBox>
        )}

        {/* 纠纷订单提示 */}
        <DisputeOrderAlert order={order} />

        {
          // 取消申请提示
          order.useageStatus === 'returned_pending' && (
            <FadeInBox>
              <Alert severity="warning">
                用户已申请归还，请尽快审核处理。如超时未处理，系统将自动确认归还并结束订单。
                <OperationTimeoutCountdown
                  seconds={order.confirmReturnDeadline}
                  enabled={order.useageStatus === 'returned_pending'}
                  showIcon={false}
                  slotProps={{
                    typography: { variant: 'body2', component: 'div', fontWeight: 700 },
                  }}
                  onCountdownEnd={mutate}
                />
              </Alert>
            </FadeInBox>
          )
        }

        {
          // 取消申请提示
          order.status === 'cancel_pending' && (
            <FadeInBox>
              <Alert severity="warning">
                用户已提交取消订单申请，请及时处理。若在规定时间内未处理，系统将自动同意退款并解冻押金。
                <OperationTimeoutCountdown
                  seconds={order.cancelRefundConfirmDeadline}
                  enabled={order.status === 'cancel_pending'}
                  showIcon={false}
                  slotProps={{
                    typography: { variant: 'body2', component: 'div', fontWeight: 700 },
                  }}
                  onCountdownEnd={mutate}
                />
              </Alert>
            </FadeInBox>
          )
        }

        {/* 订单状态卡片 */}
        <FadeInPaper>
          <OrderStatusSection order={order} />
        </FadeInPaper>

        {/* 租客信息卡片 */}
        {/* <FadeInPaper>
          <OrderLesseeInfoSection order={order} />
        </FadeInPaper> */}

        {/* 商品信息卡片 */}
        <FadeInPaper>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              商品信息
            </Typography>
          </Stack>
          <OrderBaseInfoSection order={order} />
          <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
          <OrderPriceInfoSection order={order} />
        </FadeInPaper>

        {/* 押金信息 */}
        <DepositInfo order={order} />

        {/* 租赁进度卡片 */}
        <OrderProgressSection order={order} />

        {/* 分期信息卡片（如果是分期订单） */}
        <OrderInstallmentSection order={order} />

        {/* 续租信息（如果有） */}
        <OrderRenewalInfoSection order={order} />

        {/* 收货信息卡片 */}
        <OrderShippingInfoSection order={order} />

        {/* 订单时间线 */}
        <OrderTimelineSection order={order} />

        {/* 备注信息（如果有） */}
        <OrderUserRemarkSection order={order} />

        {/* 承租方取消订单凭证，及取消原因 */}
        <LesseeCancelOrderEvidencesSection order={order} />
      </Stack>
    </MobileLayout>
  );
}

export function OrderBottomButtons(props: {
  order: MyApi.OutputRentalOrderDto;
  buttons: LessorStatusButtonProps[];
}) {
  const { order, buttons } = props;
  const router = useRouter();
  const { open: openDialog } = useDialogs();

  const handleCallback = () => {
    window.dispatchEvent(new CustomEvent(ORDER_EVENT_NAME.REFRESH_RENTAL_ORDER));
  };

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      const action = event.currentTarget.dataset.action;
      switch (action) {
        // 同意取消订单
        case 'review-cancel-request':
          openDialog(ReviewCancelRequestDialogForm, {
            orderId: order.id,
            callback: handleCallback,
          });
          break;
        // 扣除押金
        case 'deduct-deposit':
          openDialog(DeductDepositDialogForm, {
            orderId: order.id,
            depositAmount: order.depositAmount,
            callback: handleCallback,
          });
          break;
        // 取消订单
        case 'cancel-order':
          openDialog(CancelOrderDialogForm, {
            orderId: order.id,
            callback: handleCallback,
          });
          break;
        // 绑定资产
        case 'bind-asset':
          router.push(paths.lessor.order.bindAsset(order.id));
          break;
        // 确认发货
        case 'ship':
          // TODO: 确认发货
          // API.AppRentalOrderLessor.AppRentalOrderLessorControllerConfirmReturnV1
          console.log('确认发货', order.id);
          break;
        // 查看物流
        case 'logistics':
          // TODO: 查看物流
          console.log('查看物流', order.id);
          break;
        // 确认归还
        case 'confirm-return':
          openDialog(ConfirmReturnDialogForm, {
            orderId: order.id,
            userReturnTime: order.returnedAt || order.returnedSubmittedAt || '',
            callback: handleCallback,
          });
          break;
        // 查看评价
        case 'evaluation':
          // TODO: 查看评价
          router.push(paths.lessor.evaluation.root);
          break;

        // 添加优惠
        case 'add-discount':
          openDialog(SetDiscountDialogForm, {
            order,
            callback: handleCallback,
          });
          break;

        // 减免逾期费用
        case 'add-overdue-discount':
          openDialog(SetOverdueUseDiscountDialogForm, {
            order,
            callback: handleCallback,
          });
          break;

        // 换绑资产
        case 'rebind-asset':
          router.push(paths.lessor.order.rebindAsset(order.id));
          break;

        // 联系租客
        case 'contact':
          // TODO: 联系租客
          console.log('联系租客', order.id);
          break;

        case 'end-order':
          openDialog(MyConfirmDialog, {
            title: '确认结束订单',
            content:
              '订单结束后将无法再进行任何操作，且该操作不可撤销。押金将退还给租客。请确保所有服务和款项均已结清，确认要结束订单吗？',
            onOk: async () => {
              await API.AppRentalOrderLessor.AppRentalOrderLessorControllerEndOrderV1(
                { id: order.id },
                {}
              );
              handleCallback();
            },
          });
          break;
        default:
          break;
      }
    },
    [openDialog, order, router]
  );

  return (
    <HorizontalStack direction="row" spacing={1.5}>
      {order.overdueStatus === 'overdue_use' && <OverdueUseFeeBox order={order} />}
      <HorizontalStack
        direction="row"
        justifyContent="flex-end"
        spacing={1.5}
        flex={1}
        flexWrap="wrap"
      >
        {buttons.map((btn) => (
          <Button
            key={btn.action}
            data-action={btn.action}
            variant={btn.variant}
            color={btn.color}
            size="medium"
            onClick={handleClick}
            sx={{ borderRadius: 4, minWidth: 100 }}
          >
            {btn.label}
          </Button>
        ))}
      </HorizontalStack>
    </HorizontalStack>
  );
}
