import type { DialogProps } from '@toolpad/core/useDialogs';

import { z as zod } from 'zod';
import Decimal from 'decimal.js';
import { useForm } from 'react-hook-form';
import { varAlpha } from 'minimal-shared/utils';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Stack, Alert, Typography } from '@mui/material';

import API from 'src/services/API';
import { fCurrency } from 'src/utils';

import { Field } from 'src/components/hook-form';
import { CurrencyTypography } from 'src/components/custom';
import { FormDialog, FormDialogContent } from 'src/components/custom/form-dialog';

// ----------------------------------------------------------------------

const createSetDiscountFormSchema = (totalPaymentAmount: number) =>
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
        .pipe(zod.number().min(0.0, '优惠金额必须大于0').max(999999, '优惠金额不能超过999999元')),
    })
    .refine((data) => data.discountAmount <= totalPaymentAmount, {
      message: `优惠金额不能超过待支付账单总金额 ${fCurrency(totalPaymentAmount)}`,
      path: ['discountAmount'],
    });

export type SetDiscountFormSchemaType = zod.infer<ReturnType<typeof createSetDiscountFormSchema>>;

type DialogPayload = {
  order: MyApi.OutputRentalOrderDto;
  callback?: () => void;
};

export function SetDiscountDialogForm(props: DialogProps<DialogPayload, void>) {
  const { open, onClose, payload } = props;

  const { callback, order } = payload || {};

  const { id: orderId, totalPaymentAmount, isInstallment, isPending } = payload.order || {};

  const schema = createSetDiscountFormSchema(totalPaymentAmount);

  const defaultValues: SetDiscountFormSchemaType = {
    discountAmount: 0,
  };

  const methods = useForm<SetDiscountFormSchemaType>({
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (data.discountAmount > totalPaymentAmount) {
        methods.setError('discountAmount', {
          type: 'manual',
          message: `优惠金额不能超过待支付账单总金额 ${fCurrency(totalPaymentAmount)}`,
        });
        return;
      }

      await API.AppRentalOrderLessor.AppRentalOrderLessorControllerSetOrderDiscountV1(
        { id: orderId! },
        { discountAmount: data.discountAmount },
        { fetchOptions: { useApiMessage: true } }
      );

      reset();
      callback?.();
      onClose();
    } catch (error) {
      console.error('设置优惠金额失败:', error);
      callback?.();
    }
  });

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const afterDiscountAmount = new Decimal(totalPaymentAmount)
    .minus(order.totalDiscountAmount)
    .toNumber();

  return (
    <FormDialog
      open={open}
      methods={methods}
      onSubmit={onSubmit}
      scroll="paper"
      onClose={handleClose}
      dialogTitle="设置优惠金额"
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
          {/* 待支付账单总金额提示 */}
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
                待支付总金额
              </Typography>
              <CurrencyTypography
                currency={totalPaymentAmount}
                disableDivide
                slotProps={{
                  integer: {
                    sx:
                      order.totalDiscountAmount > 0
                        ? { color: 'text.secondary', textDecoration: 'line-through' }
                        : {},
                  },
                }}
              />
            </Stack>

            {order.totalDiscountAmount > 0 && (
              <>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    当前优惠金额
                  </Typography>
                  <CurrencyTypography currency={order.totalDiscountAmount} disableDivide />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    优惠后支付总金额
                  </Typography>
                  <CurrencyTypography currency={afterDiscountAmount} disableDivide color="error" />
                </Stack>
              </>
            )}
          </Stack>

          <Field.Text
            name="discountAmount"
            label="优惠金额（元）"
            placeholder="请输入优惠金额"
            type="number"
            helperText={`优惠金额不能超过待支付账单总金额 ${fCurrency(totalPaymentAmount)}`}
          />
        </Stack>
      </FormDialogContent>
    </FormDialog>
  );
}
