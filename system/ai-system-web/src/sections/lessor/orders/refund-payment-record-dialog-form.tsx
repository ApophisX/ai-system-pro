import type { DialogProps } from '@toolpad/core/useDialogs';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useEffect, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Stack, Typography } from '@mui/material';

import API from 'src/services/API';

import { Field } from 'src/components/hook-form';
import { FormDialog, FormDialogContent } from 'src/components/custom/form-dialog';

// ----------------------------------------------------------------------

const createRefundPaymentRecordFormSchema = (maxAmount: number) =>
  zod
    .object({
      amount: zod.coerce
        .number({ error: '请输入退款金额' })
        .min(0.01, '退款金额必须大于0')
        .max(maxAmount, `退款金额不能超过 ¥${maxAmount}`),
      // .union([zod.string(), zod.number()])
      // .transform((val) => {
      //   if (typeof val === 'string') {
      //     const num = parseFloat(val);
      //     return isNaN(num) ? 0 : num;
      //   }
      //   return val;
      // })
      // .pipe(
      //   zod
      //     .number()
      //     .min(0.01, '退款金额必须大于0')
      //     .max(maxAmount, `退款金额不能超过 ¥${maxAmount}`)
      // ),
      reason: zod.string().max(200, '退款原因不能超过200个字符').optional(),
    })
    .refine(
      (data) => {
        if (typeof data.amount === 'number' && data.amount > maxAmount) {
          return false;
        }
        return true;
      },
      {
        message: `退款金额不能超过可退金额 ¥${maxAmount}`,
        path: ['amount'],
      }
    );

export type RefundPaymentRecordFormSchemaType = zod.infer<
  ReturnType<typeof createRefundPaymentRecordFormSchema>
>;

type DialogPayload = {
  order: MyApi.OutputRentalOrderDto;
  paymentRecordId: string;
  recordNo: string;
  maxAmount: number;
  callback?: () => void;
};

export function RefundPaymentRecordDialogForm(props: DialogProps<DialogPayload, void>) {
  const { open, onClose, payload } = props;

  const { order, paymentRecordId, recordNo, maxAmount, callback } = payload;

  const schema = createRefundPaymentRecordFormSchema(maxAmount || 0);

  const defaultValues: RefundPaymentRecordFormSchemaType = {
    amount: maxAmount || 0,
    reason: '',
  };

  const methods = useForm<RefundPaymentRecordFormSchemaType>({
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (open && maxAmount) {
      reset({ amount: undefined, reason: '' });
    }
  }, [open, maxAmount, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await API.AppRentalOrderLessor.AppRentalOrderLessorControllerRefundPaymentRecordV1(
        { id: order.id },
        {
          paymentRecordId,
          amount: data.amount,
          reason: data.reason,
        },
        { fetchOptions: { useApiMessage: true } }
      );

      reset();
      callback?.();
      onClose();
    } catch (error) {
      console.error('申请退款失败:', error);
      callback?.();
    }
  });

  const handleClose = useCallback(() => {
    reset();
    onClose?.();
  }, [reset, onClose]);

  return (
    <FormDialog
      open={open}
      methods={methods}
      onSubmit={onSubmit}
      onClose={handleClose}
      dialogTitle="申请退款"
      okButtonText="确定退款"
      okButtonProps={{
        color: 'error',
      }}
    >
      <FormDialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Box
            sx={(theme) => ({
              p: 2,
              borderRadius: 1.5,
              bgcolor: theme.palette.info.lighter,
              border: `1px solid ${theme.palette.info.light}`,
            })}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {recordNo}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 1 }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                可退金额
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                ¥{maxAmount}
              </Typography>
            </Stack>
          </Box>

          <Field.Text
            name="amount"
            label="退款金额（元）"
            placeholder="请输入退款金额"
            helperText={`退款金额不能超过可退金额 ¥${maxAmount}`}
          />

          <Field.Text
            name="reason"
            label="退款原因（选填）"
            placeholder="请说明退款原因"
            multiline
            minRows={2}
            slotProps={{
              input: { inputProps: { maxLength: 200 } },
            }}
          />
        </Stack>
      </FormDialogContent>
    </FormDialog>
  );
}
