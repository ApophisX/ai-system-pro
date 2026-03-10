import type { DialogProps } from '@toolpad/core/useDialogs';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Alert, Stack } from '@mui/material';

import API from 'src/services/API';

import { Field } from 'src/components/hook-form';
import { FormDialog, FormDialogContent } from 'src/components/custom/form-dialog';

// ----------------------------------------------------------------------

export const CancelOrderFormSchema = zod.object({
  reason: zod
    .string()
    .min(1, { message: '请填写取消原因' })
    .max(200, { message: '取消原因不能超过200个字符' }),
});

export type CancelOrderFormSchemaType = zod.infer<typeof CancelOrderFormSchema>;

type DialogPayload = {
  orderId: string;
  callback?: () => void;
};

export function CancelOrderDialogForm(props: DialogProps<DialogPayload, void>) {
  const { open, onClose, payload } = props;

  const { orderId, callback } = payload || {};

  const defaultValues: CancelOrderFormSchemaType = {
    reason: '',
  };

  const methods = useForm<CancelOrderFormSchemaType>({
    resolver: zodResolver(CancelOrderFormSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await API.AppRentalOrderLessor.AppRentalOrderLessorControllerCancelByLessorOrderV1(
        { id: orderId! },
        { reason: data.reason },
        { fetchOptions: { useApiMessage: true } }
      );
      reset();
      callback?.();
      onClose();
    } catch (error) {
      console.error('商家取消订单失败:', error);
      // 失败后也要调用成功回调，避免页面状态不一致
      callback?.();
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      methods={methods}
      onSubmit={onSubmit}
      scroll="paper"
      dialogTitle="取消订单"
      okButtonText="确认取消"
      okButtonProps={{ color: 'error' }}
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
          <Alert severity="info">
            订单取消后，租金将按照原支付路径退回，押金将解冻或原路退还，具体到账时间请以支付渠道为准，请及时和用户确认退款情况。
          </Alert>
          <Field.Text
            name="reason"
            label="取消原因"
            placeholder="请说明取消订单的原因"
            multiline
            minRows={4}
            maxRows={8}
            helperText="最多输入200个字符"
            slotProps={{ input: { inputProps: { maxLength: 200, } }, }}
          />
        </Stack>
      </FormDialogContent>
    </FormDialog>
  );
}
