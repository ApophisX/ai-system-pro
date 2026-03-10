import type { DialogProps } from '@toolpad/core/useDialogs';

import { useMemo } from 'react';
import Decimal from 'decimal.js';
import { useDialogs } from '@toolpad/core/useDialogs';

import { Chip, Stack, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { MyDialog } from 'src/components/custom/my-dialog';
import { CurrencyTypography } from 'src/components/custom';
import { HorizontalStack } from 'src/components/custom/layout';
import { AmountTypography } from 'src/components/custom/amount-typography';

type FeeDetailButtonProps = {
  order?: MyApi.OutputRentalOrderDto;
  assetDetail: MyApi.OutputAssetDetailDto;
  rentalPlan: MyApi.OutputAssetRentalPlanDto;
  needDelivery: boolean;
  duration?: number;
  isDepositPaid?: boolean;
  amount: number;
};

export function FeeDetailButton(props: FeeDetailButtonProps) {
  const dialogs = useDialogs();
  const { rentalPlan, order, amount } = props;

  const totalAmount = useMemo(() => {
    if (order && !order.isInstallment) {
      if (order.needDeposit && order.isDepositFrozenOrPaid) {
        return order.orderAmount;
      }
      return order.totalAmount;
    }
    return amount;
  }, [amount, order]);

  return (
    <HorizontalStack
      spacing={0.5}
      onClick={() => {
        if (rentalPlan) {
          dialogs.open(FeeDetailDialog, props);
        }
      }}
    >
      <Stack>
        <CurrencyTypography fontSize={28} currency={totalAmount} color="error.main" />
        <Typography variant="caption" color="text.secondary">
          {rentalPlan.isInstallment ? '首期租金' : '订单总额'}
        </Typography>
      </Stack>
      <Iconify icon="eva:arrow-ios-upward-fill" sx={{ width: 18 }} />
    </HorizontalStack>
  );
}

// 费用明细弹框
function FeeDetailDialog({ open, onClose, payload }: DialogProps<FeeDetailButtonProps>) {
  const {
    assetDetail,
    rentalPlan,
    needDelivery = false,
    duration = 1,
    isDepositPaid = false,
    order,
  } = payload;
  const handleClose = async () => {
    onClose();
  };

  const totalAmount = useMemo(() => {
    if (order && !order.isInstallment) {
      if (order.needDeposit && order.isDepositFrozenOrPaid) {
        return order.orderAmount;
      }
      return order.totalAmount;
    }

    const rentalAmount = rentalPlan.isInstallment
      ? new Decimal(rentalPlan.price)
      : new Decimal(rentalPlan.price).mul(duration);
    const otherAmount =
      assetDetail.deposit > 0 && !isDepositPaid ? new Decimal(assetDetail.deposit) : new Decimal(0);
    const deliveryAmount = needDelivery ? new Decimal(assetDetail.deliveryFee) : new Decimal(0);
    return rentalAmount.plus(otherAmount).plus(deliveryAmount).toNumber();
  }, [
    order,
    rentalPlan.isInstallment,
    rentalPlan.price,
    duration,
    assetDetail.deposit,
    assetDetail.deliveryFee,
    isDepositPaid,
    needDelivery,
  ]);

  return (
    <MyDialog
      open={open}
      onClose={handleClose}
      dialogTitle="支付明细"
      cancelButtonText="关闭"
      okButtonProps={{ sx: { display: 'none' } }}
    >
      <Stack sx={{ p: 3 }} spacing={1}>
        <HorizontalStack justifyContent="space-between">
          <HorizontalStack spacing={1}>
            {assetDetail.isMallProduct ? (
              <Typography variant="body2" color="text.secondary">
                总金额
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {rentalPlan.isInstallment ? '首期租金' : '总租金'}
              </Typography>
            )}

            {assetDetail.creditFreeDeposit && !assetDetail.isMallProduct && (
              <Chip
                label="支持信用免押"
                size="small"
                variant="filled"
                color="primary"
                sx={{ borderRadius: 0.5, height: 20, fontSize: 10 }}
              />
            )}
          </HorizontalStack>
          <CurrencyTypography
            currency={
              rentalPlan.isInstallment
                ? rentalPlan.price
                : new Decimal(rentalPlan.price).mul(duration).toNumber()
            }
            disableDivide
          />
        </HorizontalStack>
        {needDelivery && (
          <HorizontalStack justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              配送费
            </Typography>
            <CurrencyTypography currency={assetDetail.deliveryFee} disableDivide />
          </HorizontalStack>
        )}
        {order && order.discountAmount > 0 && (
          <HorizontalStack justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              优惠金额
            </Typography>
            <CurrencyTypography
              currency={order.discountAmount}
              isNegative
              disableDivide
              color="error"
            />
          </HorizontalStack>
        )}
        {assetDetail.deposit > 0 && !isDepositPaid && (
          <HorizontalStack justifyContent="space-between">
            <HorizontalStack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                押金
              </Typography>
              {assetDetail.creditFreeDeposit && (
                <Chip
                  label="支持信用免押"
                  size="small"
                  variant="filled"
                  color="primary"
                  sx={{ borderRadius: 0.5, height: 20, fontSize: 10 }}
                />
              )}
            </HorizontalStack>
            <CurrencyTypography currency={assetDetail.deposit} disableDivide />
          </HorizontalStack>
        )}
        <HorizontalStack justifyContent="space-between" alignItems="baseline">
          <Typography variant="body2" color="text.secondary">
            合计
          </Typography>
          <AmountTypography amount={totalAmount} />
        </HorizontalStack>
      </Stack>
    </MyDialog>
  );
}
