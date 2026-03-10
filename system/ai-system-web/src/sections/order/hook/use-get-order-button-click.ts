import type { OrderActionType } from '../utils/order-status';

import { useCallback } from 'react';
import { useBoolean } from 'minimal-shared/hooks';
import { useDialogs } from '@toolpad/core/useDialogs';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import API from 'src/services/API';

import { MyConfirmDialog } from 'src/components/custom/confirm-dialog';

import { payRenewal } from '../actions';
import { RenewOrderDialogForm } from '../renew-order-dialog-form';
import { useConfirmPayCallback } from './use-confirm-pay-callback';
import { ReturnAssetDialogForm } from '../return-asset-dialog-form';
import { ConfirmReceiveDialogForm } from '../confirm-receive-dialog-form';
import { getRenewalPendingPayment } from '../components/order-renewal-info';
import { ApplyCancelOrderDialogForm } from '../apply-cancel-order-dialog-form';

type OrderActionResult = {
  success: boolean;
  action: OrderActionType;
};

export function useGetOrderButtonClick() {
  const { open: openDialog } = useDialogs();
  const { value: loading, onTrue: onLoading, onFalse: onLoadingFalse } = useBoolean(false);
  const router = useRouter();
  const { confirmPayCallback } = useConfirmPayCallback();

  const handleButtonClick = useCallback(
    (
      action: OrderActionType,
      orderData: MyApi.OutputRentalOrderDto
    ): Promise<OrderActionResult> => {
      switch (action) {
        // 取消订单
        case 'cancel': {
          return new Promise((resolve) => {
            openDialog(MyConfirmDialog, {
              title: '取消订单',
              content: '确定要取消订单吗？',
              loadingText: '取消中，请稍后...',
              onOk: async () => {
                onLoading();
                try {
                  await API.AppRentalOrderLessee.AppRentalOrderLesseeControllerCancelOrderV1(
                    { id: orderData.id },
                    { reason: '用户订单取消' },
                    { fetchOptions: { useApiMessage: true } }
                  );
                  resolve({ success: true, action });
                } finally {
                  onLoadingFalse();
                }
              },
            });
          });
        }
        // 支付押金
        case 'pay-deposit': {
          return Promise.resolve({ success: true, action });
        }
        // 支付订单租金
        case 'pay': {
          return Promise.resolve({ success: true, action });
        }
        // 支付分期账单
        case 'pay-installment':
          router.push(`${paths.my.orderInstallments(orderData.id)}?payNow=true`);
          return Promise.resolve({ success: true, action });

        // 支付续租租金
        case 'pay-renewal': {
          return Promise.resolve({ success: true, action });
        }
        // 支付超时费用
        case 'pay-overdue-fee': {
          return Promise.resolve({ success: true, action });
        }
        // 续租下单
        case 'renew-order': {
          return new Promise((resolve) => {
            openDialog(
              RenewOrderDialogForm,
              {
                order: orderData,
                onSuccess: async () => {},
              },
              {
                onClose: async (order) => {
                  if (!order) return;
                  try {
                    const pendingRenewalPayment = getRenewalPendingPayment(order);
                    if (!pendingRenewalPayment) {
                      return;
                    }
                    await payRenewal(order, pendingRenewalPayment.id);
                    await confirmPayCallback('支付续租租金提醒', '是否已支付续租租金成功？');
                    resolve({ success: true, action });
                  } catch {
                    resolve({ success: false, action });
                  }
                },
              }
            );
          });
        }
        // 申请取消订单，已支付租金和押金的情况
        case 'apply-cancel-order': {
          return new Promise((resolve) => {
            openDialog(ApplyCancelOrderDialogForm, {
              orderId: orderData.id,
              onSuccess: () => {
                resolve({ success: true, action });
              },
            });
          });
        }

        // 取消取消订单
        case 'revoke-cancel-order': {
          return new Promise((resolve) => {
            openDialog(MyConfirmDialog, {
              title: '撤销取消订单',
              content: '确定要撤销取消订单吗？',
              loadingText: '撤销中，请稍后...',
              useInfoIcon: true,
              iconColor: 'primary.main',
              okButtonProps: {
                color: 'primary',
              },
              onOk: async () => {
                onLoading();
                try {
                  await API.AppRentalOrderLessee.AppRentalOrderLesseeControllerRevokeCancelOrderV1(
                    { id: orderData.id },
                    { fetchOptions: { useApiMessage: true } }
                  );
                  resolve({ success: true, action });
                } finally {
                  onLoadingFalse();
                }
              },
            });
          });
        }

        // 授权免押
        case 'authorize-free-deposit': {
          return Promise.resolve({ success: true, action });
        }
        // TODO: 查看物流
        case 'logistics':
          console.log('查看物流', orderData.id);
          return Promise.resolve({ success: false, action });
        // 确认收货
        case 'confirm': {
          return new Promise((resolve) => {
            openDialog(ConfirmReceiveDialogForm, {
              order: orderData,
              onSuccess: () => {
                resolve({ success: true, action });
              },
            });
          });
        }
        // 归还资产
        case 'return': {
          return new Promise((resolve) => {
            openDialog(ReturnAssetDialogForm, {
              orderId: orderData.id,
              onSuccess: () => {
                resolve({ success: true, action });
              },
            });
          });
        }

        case 'review':
          router.push(paths.my.orderReview(orderData.id));
          return Promise.resolve({ success: true, action });
        case 'delete': {
          return new Promise((resolve) => {
            openDialog(MyConfirmDialog, {
              title: '确定要删除订单吗？',
              content: '订单删除后将无法恢复，请谨慎操作。',
              loadingText: '删除中，请稍后...',
              onOk: async () => {
                onLoading();
                try {
                  await API.AppRentalOrderLessee.AppRentalOrderLesseeControllerDeleteOrderV1(
                    { id: orderData.id },
                    { fetchOptions: { useApiMessage: true } }
                  );
                  resolve({ success: true, action });
                } finally {
                  onLoadingFalse();
                }
              },
            });
          });
        }
        default:
          return Promise.resolve({ success: false, action: 'none' });
      }
    },
    [router, openDialog, onLoading, onLoadingFalse, confirmPayCallback]
  );
  return { handleButtonClick, loading };
}
