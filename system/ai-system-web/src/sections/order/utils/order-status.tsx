import { useMemo } from 'react';

export type OrderActionType =
  | 'cancel'
  | 'apply-cancel-order'
  | 'pay'
  | 'pay-renewal'
  | 'pay-deposit'
  | 'logistics'
  | 'confirm'
  | 'renew-order'
  | 'delete'
  | 'contact'
  | 'authorize-free-deposit'
  | 'pay-overdue-fee'
  | 'revoke-cancel-order'
  | 'return'
  | 'pay-installment'
  | 'review'
  | 'none';

export type LessorOrderActionType =
  | 'cancel-order'
  | 'add-discount'
  | 'add-overdue-discount'
  | 'review-cancel-request'
  | 'deduct-deposit'
  | 'ship'
  | 'bind-asset'
  | 'logistics'
  | 'confirm-return'
  | 'evaluation'
  | 'contact'
  | 'complete-order'
  | 'end-order'
  | 'rebind-asset'
  | 'none';

type StatusButtonProps = {
  label: string;
  variant: 'contained' | 'outlined';
  color: 'primary' | 'inherit' | 'error' | 'success' | 'info' | 'warning';
  action: OrderActionType;
  caption?: string;
  price?: number;
};

export type LessorStatusButtonProps = {
  action: LessorOrderActionType;
} & Pick<StatusButtonProps, 'variant' | 'color' | 'label'>;

export type DepositDeductionStatus = MyApi.OutputDepositDeductionDto['status'];
export type OrderStatus = MyApi.OutputRentalOrderDto['status'];
export type OrderUseageStatus = MyApi.OutputRentalOrderDto['useageStatus'];
export type OrderRefundStatus = MyApi.OutputRentalOrderDto['refundStatus'];
export type DepositStatus = MyApi.OutputRentalOrderDto['depositStatus'];
export type OrderOverdueStatus = MyApi.OutputRentalOrderDto['overdueStatus'];
export type OrderStatusColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning';

// 获取出租方订单状态按钮
export function useGetLessorStatusButtons(order: MyApi.OutputRentalOrderDto | undefined) {
  const memoizedButtons = useMemo(() => {
    const buttons: Array<LessorStatusButtonProps> = [];

    if (!order || order.isInvalid || order.isOrderEnded) {
      return [];
    }

    if (order.canCancelByLessor) {
      buttons.push({
        label: '取消订单',
        variant: 'contained',
        color: 'inherit',
        action: 'cancel-order',
      });
    }

    if (order.canDeductDeposit) {
      buttons.push({
        label: '扣除押金',
        variant: 'contained',
        color: 'error',
        action: 'deduct-deposit',
      });
    }

    if (order.isPendingReceipt) {
      buttons.push({
        label: '绑定资产',
        variant: 'contained',
        color: 'primary',
        action: 'bind-asset',
      });
    }

    if (order.isCancelPending) {
      buttons.push({
        label: '审核取消申请',
        variant: 'contained',
        color: 'warning',
        action: 'review-cancel-request',
      });
    }

    if (order.isReturnedPending) {
      buttons.push({
        label: '确认归还',
        variant: 'contained',
        color: 'primary',
        action: 'confirm-return',
      });
    }

    if (order.isReceived && order.isReturned) {
      buttons.push({
        label: '结束订单',
        variant: 'contained',
        color: 'primary',
        action: 'end-order',
      });
    }

    if (order.overdueStatus === 'overdue_use' && order.isReturned) {
      buttons.push({
        label: '减免逾期费用',
        variant: 'contained',
        color: 'warning',
        action: 'add-overdue-discount',
      });
    }

    if (order.isPending && !order.isInstallment) {
      buttons.push({
        label: '添加优惠',
        variant: 'contained',
        color: 'primary',
        action: 'add-discount',
      });
    }

    if (order.isInUse && order.inventoryId) {
      buttons.push({
        label: '换绑资产',
        variant: 'contained',
        color: 'primary',
        action: 'rebind-asset',
      });
    }

    return buttons;
  }, [order]);

  return memoizedButtons;
}

export const getRefundStatusLabelColor = (status: OrderRefundStatus): OrderStatusColor => {
  const colorMap: Partial<Record<OrderRefundStatus, OrderStatusColor>> = {
    none: 'default',
    processing: 'warning',
    completed: 'success',
    failed: 'error',
    timeout: 'error',
    partial_refund: 'error',
  };
  return colorMap[status] || 'default';
};

/**
 * 获取订单状态标签颜色
 * @param status 订单状态
 * @returns 订单状态标签颜色
 */
export const getOrderStatusLabelColor = (status?: OrderStatus): OrderStatusColor => {
  if (!status) return 'default';
  const colorMap: Partial<Record<OrderStatus, OrderStatusColor>> = {
    created: 'warning',
    pending_receipt: 'info',
    completed: 'success',
    cancel_pending: 'warning',
    dispute: 'error',
  };
  return colorMap[status] || 'default';
};

/**
 * 获取超时状态标签颜色
 * @param status 超时状态
 * @returns 超时状态标签颜色
 */
export const getOverdueStatusLabelColor = (status: OrderOverdueStatus): OrderStatusColor => {
  const colorMap: Partial<Record<OrderOverdueStatus, OrderStatusColor>> = {
    none: 'default',
    overdue_use: 'error',
    overdue: 'error',
    overdue_fee_paid: 'success',
  };
  return colorMap[status] || 'default';
};

export const getUseageStatusLabelColor = (status: OrderUseageStatus): OrderStatusColor => {
  const colorMap: Partial<Record<OrderUseageStatus, OrderStatusColor>> = {
    none: 'default',
    in_use: 'secondary',
    returned: 'success',
    wait_return: 'warning',
    returned_pending: 'warning',
    rejected: 'error',
  };
  return colorMap[status] || 'default';
};

export const getDepositStatusLabelColor = (status: DepositStatus): OrderStatusColor => {
  const colorMap: Partial<Record<DepositStatus, OrderStatusColor>> = {
    none: 'default',
    pending: 'warning',
    frozen: 'info',
    paid: 'success',
    returned: 'success',
    fully_deducted: 'error',
    partial_deducted: 'warning',
    canceled: 'error',
    failed: 'error',
    refunding: 'warning',
  };
  return colorMap[status] || 'default';
};

export const getDepositDeductionStatusLabelColor = (
  status: DepositDeductionStatus
): OrderStatusColor => {
  const colorMap: Partial<Record<DepositDeductionStatus, OrderStatusColor>> = {
    pending_user_confirm: 'info',
    pending_audit: 'warning',
    platform_approved: 'success',
    platform_rejected: 'error',
  };
  return colorMap[status] || 'default';
};
