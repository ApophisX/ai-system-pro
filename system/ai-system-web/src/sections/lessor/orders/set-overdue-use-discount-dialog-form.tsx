import type { DialogProps } from '@toolpad/core/useDialogs';

import { z as zod } from 'zod';
import Decimal from 'decimal.js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Alert, Stack, Typography } from '@mui/material';

import API from 'src/services/API';
import { fCurrency } from 'src/utils';

import { Field } from 'src/components/hook-form';
import { CurrencyTypography } from 'src/components/custom';
import { FormDialog, FormDialogContent } from 'src/components/custom/form-dialog';

// ----------------------------------------------------------------------

/** 创建减免逾期费用表单校验：优惠金额不能超过待付超期费 */
const createSetOverdueUseDiscountFormSchema = (maxDiscountAmount: number) =>
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
      remark: zod.string().max(200, '备注最多200字').optional().or(zod.literal('')),
    })
    .refine((data) => data.discountAmount <= maxDiscountAmount, {
      message: `优惠金额不能超过待付超期费 ${fCurrency(maxDiscountAmount)}`,
      path: ['discountAmount'],
    });

export type SetOverdueUseDiscountFormSchemaType = zod.infer<
  ReturnType<typeof createSetOverdueUseDiscountFormSchema>
>;

type DialogPayload = {
  order: MyApi.OutputRentalOrderDto;
  callback?: () => void;
};

/**
 * 减免逾期费用弹窗
 * 超期使用费用待支付时，出租方设置超期使用费优惠金额（仅适用于先付后用、非分期订单，且订单处于超时使用状态）
 */
export function SetOverdueUseDiscountDialogForm(props: DialogProps<DialogPayload, void>) {
  const { open, onClose, payload } = props;

  const { callback, order } = payload || {};
  const {
    id: orderId,
    overdueUseAmount,
    overdueUseDiscountAmount,
    overdueUseDiscountRemark,
  } = order || {};

  const maxDiscountAmount = Number(overdueUseAmount) || 0;
  const schema = createSetOverdueUseDiscountFormSchema(maxDiscountAmount);

  const defaultValues: SetOverdueUseDiscountFormSchemaType = {
    discountAmount: Number(overdueUseDiscountAmount) || 0,
    remark: overdueUseDiscountRemark ?? '',
  };

  const methods = useForm<SetOverdueUseDiscountFormSchemaType>({
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const discountAmount = Number(data.discountAmount);
      if (discountAmount < 0 || discountAmount > maxDiscountAmount) {
        methods.setError('discountAmount', {
          type: 'manual',
          message: `优惠金额需在 0 ~ ${fCurrency(maxDiscountAmount)} 之间`,
        });
        return;
      }

      await API.AppRentalOrderLessor.AppRentalOrderLessorControllerSetOverdueUseDiscountV1(
        { id: orderId! },
        {
          discountAmount,
          remark: data.remark?.trim() || undefined,
        },
        { fetchOptions: { useApiMessage: true } }
      );

      reset();
      callback?.();
      onClose();
    } catch (error) {
      console.error('设置超期使用费优惠失败:', error);
      // 不关闭弹窗，由 useApiMessage 展示错误；如需可在此 callback 刷新
      callback?.();
    }
  });

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const afterDiscountAmount = new Decimal(maxDiscountAmount)
    .minus(methods.watch('discountAmount') || defaultValues.discountAmount)
    .toNumber();

  return (
    <FormDialog
      open={open}
      methods={methods}
      onSubmit={onSubmit}
      scroll="paper"
      onClose={handleClose}
      dialogTitle="减免逾期费用"
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
          {/* 待付超期费与优惠说明 */}
          <Alert severity="info" slotProps={{ message: { sx: { flex: 1 } } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                待付超期费
              </Typography>
              <CurrencyTypography
                currency={maxDiscountAmount}
                disableDivide
                slotProps={{
                  integer: {
                    sx:
                      order.overdueUseDiscountAmount > 0
                        ? { color: 'text.secondary', textDecoration: 'line-through' }
                        : {},
                  },
                }}
              />
            </Stack>

            {order.overdueUseDiscountAmount > 0 && (
              <>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    当前已设优惠
                  </Typography>
                  <CurrencyTypography currency={order.overdueUseDiscountAmount} disableDivide />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    优惠后待付
                  </Typography>
                  <CurrencyTypography
                    currency={afterDiscountAmount > 0 ? afterDiscountAmount : 0}
                    disableDivide
                    color="error"
                  />
                </Stack>
              </>
            )}
          </Alert>

          <Field.Text
            name="discountAmount"
            label="超期使用优惠金额（元）"
            placeholder="请输入优惠金额"
            type="number"
            helperText={`优惠金额不能超过待付超期费 ${fCurrency(maxDiscountAmount)}`}
          />

          <Field.Text
            name="remark"
            label="优惠备注（选填）"
            placeholder="如：友好协商减免、首次逾期减免等"
            multiline
            rows={2}
            slotProps={{
              input: {
                inputProps: {
                  maxLength: 200,
                },
              },
            }}
          />
        </Stack>
      </FormDialogContent>
    </FormDialog>
  );
}
