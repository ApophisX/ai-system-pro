import type { OrderActionType } from '../utils';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import API from 'src/services/API';

type StatusButtonProps = {
  label: string;
  variant: 'contained' | 'outlined' | 'soft';
  color: 'primary' | 'inherit' | 'error' | 'success' | 'info' | 'warning';
  action: OrderActionType;
  caption?: string;
  price?: number;
};

export function useGetOrderButtons(order: MyApi.OutputRentalOrderDto | undefined) {
  // 续租预计算查询
  const { data: renewPreviewData } = useQuery({
    queryKey: ['renew-preview', order?.id],
    queryFn: () =>
      API.RentalOrderRenew.RentalOrderRenewControllerRenewPreviewV1({
        orderId: order!.id,
        duration: 1,
      }),
    select: (res) => res.data.data,
    enabled: !!order?.id,
    staleTime: 10 * 1000,
    retry: 1,
  });

  const orderActionButtons = useMemo(() => {
    if (!order) {
      return [];
    }
    const status = order.status;
    const buttons: Array<StatusButtonProps> = [];

    if (order.isOrderEnded) {
      return buttons;
    }

    if (order.isInUse) {
      const pendingRenewalPayment = order.payments.find(
        (p) => p.status === 'pending' && p.paymentType === 'renewal'
      );
      buttons.push({
        label: '归还物品',
        variant: 'outlined',
        color: 'primary',
        action: 'return',
      });
      if (pendingRenewalPayment) {
        buttons.push({
          label: '立即支付',
          variant: 'contained',
          color: 'primary',
          action: 'pay-renewal',
        });
      } else if (renewPreviewData?.canRenew) {
        buttons.push({
          label: '续租',
          variant: 'contained',
          color: 'success',
          action: 'renew-order',
        });
      }
    }

    const hasPendingInstallment =
      (order.hasPendingInstallment || order.hasOverduePendingInstallment) &&
      order.payStatus !== 'pending';
    if (order.overdueStatus === 'overdue_use') {
      buttons.push({
        label: '立即支付',
        variant: 'contained',
        color: 'error',
        action: 'pay-overdue-fee',
      });
    } else if (hasPendingInstallment) {
      buttons.push({
        label: '立即支付',
        variant: 'contained',
        color: 'error',
        action: 'pay-installment',
      });
    }
    if (order.overdueStatus !== 'none') {
      return buttons;
    }

    switch (status) {
      // 创建订单
      case 'created': {
        buttons.push({
          label: '取消订单',
          variant: 'outlined',
          color: 'inherit',
          action: 'cancel',
        });
        const hasDeposit = order.depositAmount > 0;
        const needDeposit = hasDeposit && ['pending', 'failed'].includes(order.depositStatus);
        const isDepositPaid = hasDeposit && ['frozen', 'paid'].includes(order.depositStatus);

        if (order.assetSnapshot.creditFreeDeposit) {
          buttons.push({
            label: '立即免押',
            variant: 'contained',
            color: 'primary',
            action: 'authorize-free-deposit',
          });
        } else if (needDeposit) {
          buttons.push({
            label: '支付押金',
            variant: 'contained',
            color: 'primary',
            action: 'pay-deposit',
          });
        } else if (order.status === 'created' && order.payStatus === 'pending') {
          buttons.push({
            label: order.isProductPurchase ? '立即支付' : '支付租金',
            variant: 'contained',
            color: 'primary',
            action: 'pay',
          });
        }
        break;
      }

      // 已支付、待收货
      case 'pending_receipt': {
        if (order.useageStatus === 'none') {
          buttons.push(
            {
              label: '申请退款',
              variant: 'outlined',
              color: 'inherit',
              action: 'apply-cancel-order',
            },
            {
              label: '确认收货',
              variant: 'contained',
              color: 'primary',
              action: 'confirm',
            }
          );
        }
        break;
      }

      // 撤销取消申请
      case 'cancel_pending':
        buttons.push({
          label: '撤销',
          variant: 'contained',
          color: 'primary',
          action: 'revoke-cancel-order',
        });
        break;

      // 已完成、已取消、已关闭、支付超时
      case 'completed':
        if (order.canReview) {
          buttons.push({
            label: '去评价',
            variant: 'contained',
            color: 'primary',
            action: 'review',
          });
        }
        buttons.push({
          label: '删除订单',
          variant: 'outlined',
          color: 'inherit',
          action: 'delete',
        });
        break;
      case 'canceled':
      case 'closed':
        buttons.push({
          label: '删除订单',
          variant: 'outlined',
          color: 'inherit',
          action: 'delete',
        });
        break;
      default:
        break;
    }
    return buttons;
  }, [order, renewPreviewData?.canRenew]);
  return orderActionButtons;
}
