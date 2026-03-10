import type { DialogProps } from '@toolpad/core/useDialogs';

import { z as zod } from 'zod';
import Decimal from 'decimal.js';
import { useForm } from 'react-hook-form';
import { varAlpha } from 'minimal-shared/utils';
import { zodResolver } from '@hookform/resolvers/zod';

import { Stack, Typography } from '@mui/material';

import API from 'src/services/API';
import { fCurrency } from 'src/utils';

import { Field } from 'src/components/hook-form';
import { CurrencyTypography } from 'src/components/custom';
import { FormDialog, FormDialogContent } from 'src/components/custom/form-dialog';

// ----------------------------------------------------------------------

/** 账单原始金额（优惠前）= 总应付金额 + 已设置优惠金额 */
function getPaymentOriginalAmount(payment: MyApi.OutputPaymentDto): number {
  const totalPayable = payment.totalPayableAmount ?? 0;
  const currentDiscount = payment.discountAmount ?? 0;
  return new Decimal(totalPayable).plus(currentDiscount).toNumber();
}

const createSetPaymentDiscountFormSchema = (maxDiscountAmount: number) =>
  zod
    .object({
      discountAmount: zod
        .union([zod.string(), zod.number()])
        .transform((val) => {
          if (typeof val === 'string') {
            const num = parseFloat(val);
            return isNaN(num) ? 0 : num;
          }
          return val;
        })
        .pipe(zod.number().min(0, '优惠金额不能为负数').max(999999, '优惠金额不能超过999999元')),
    })
    .refine((data) => data.discountAmount < maxDiscountAmount, {
      message: `优惠金额需小于账单总金额（${fCurrency(maxDiscountAmount)}）`,
      path: ['discountAmount'],
    });

export type SetPaymentDiscountFormSchemaType = zod.infer<
  ReturnType<typeof createSetPaymentDiscountFormSchema>
>;

type DialogPayload = {
  order: MyApi.OutputRentalOrderDto;
  payment: MyApi.OutputPaymentDto;
  callback?: () => void;
};

export function SetPaymentDiscountDialogForm(props: DialogProps<DialogPayload, void>) {
  const { open, onClose, payload } = props;

  const { callback, order, payment } = payload || {};

  const orderId = order?.id;
  const paymentId = payment?.id;
  const currentDiscount = payment?.discountAmount ?? 0;
  const maxDiscountAmount = payment ? getPaymentOriginalAmount(payment) : 0;

  const schema = createSetPaymentDiscountFormSchema(maxDiscountAmount);

  const defaultValues: SetPaymentDiscountFormSchemaType = {
    discountAmount: currentDiscount,
  };

  const methods = useForm<SetPaymentDiscountFormSchemaType>({
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, watch } = methods;
  const watchedDiscount = watch('discountAmount');
  const discountNum =
    typeof watchedDiscount === 'number'
      ? watchedDiscount
      : parseFloat(String(watchedDiscount)) || 0;
  const afterDiscountAmount = new Decimal(maxDiscountAmount).minus(discountNum).toNumber();

  const onSubmit = handleSubmit(async (data) => {
    if (!orderId || !paymentId) {
      return;
    }

    const amount = Number(data.discountAmount);
    if (amount > maxDiscountAmount) {
      methods.setError('discountAmount', {
        type: 'manual',
        message: `优惠金额不能超过账单金额 ${fCurrency(maxDiscountAmount)}`,
      });
      return;
    }

    try {
      await API.AppRentalOrderLessor.AppRentalOrderLessorControllerSetPaymentDiscountV1(
        { id: orderId },
        { paymentId, discountAmount: amount },
        { fetchOptions: { useApiMessage: true } }
      );

      reset();
      callback?.();
      onClose();
    } catch (error) {
      console.error('设置续租账单优惠失败:', error);
    }
  });

  const handleClose = () => {
    reset();
    onClose?.();
  };

  if (!order || !payment || !orderId || !paymentId) {
    return null;
  }

  /** 仅允许待支付状态：pending、overdue、partial_paid、due */
  const allowedStatuses = ['pending', 'overdue', 'partial_paid', 'due'];
  if (!allowedStatuses.includes(payment.status)) {
    return null;
  }

  return (
    <FormDialog
      open={open}
      methods={methods}
      onSubmit={onSubmit}
      scroll="paper"
      onClose={handleClose}
      dialogTitle="设置账单优惠"
      okButtonText="确认设置"
      okButtonProps={{
        color: 'primary',
      }}
      slotProps={{
        paper: {
          sx: {
            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
          },
        },
      }}
    >
      <FormDialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* 账单金额信息 */}
          <Stack
            spacing={1}
            sx={(theme) => ({
              p: 2,
              borderRadius: 1.5,
              bgcolor: varAlpha(theme.vars.palette.info.mainChannel, 0.08),
              border: `1px solid ${varAlpha(theme.vars.palette.info.mainChannel, 0.2)}`,
            })}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                账单金额
              </Typography>
              <CurrencyTypography
                currency={maxDiscountAmount}
                disableDivide
                slotProps={{
                  integer: {
                    sx:
                      currentDiscount > 0
                        ? { color: 'text.secondary', textDecoration: 'line-through' }
                        : {},
                  },
                }}
              />
            </Stack>

            {currentDiscount > 0 && (
              <>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    当前优惠金额
                  </Typography>
                  <CurrencyTypography currency={currentDiscount} disableDivide />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    优惠后应付金额
                  </Typography>
                  <CurrencyTypography
                    currency={payment.totalPayableAmount}
                    disableDivide
                    color="error"
                  />
                </Stack>
              </>
            )}
          </Stack>

          <Field.Text
            name="discountAmount"
            label="优惠金额（元）"
            placeholder="请输入优惠金额"
            type="number"
            helperText={`优惠金额不能超过账单金额 ${fCurrency(maxDiscountAmount)}，输入 0 可取消优惠`}
          />

          {discountNum > 0 && (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={(theme) => ({
                p: 1.5,
                borderRadius: 1,
                bgcolor: varAlpha(theme.vars.palette.success.mainChannel, 0.08),
              })}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                设置后应付金额
              </Typography>
              <CurrencyTypography currency={afterDiscountAmount} disableDivide color="error" />
            </Stack>
          )}
        </Stack>
      </FormDialogContent>
    </FormDialog>
  );
}
