import type { Resolver } from 'react-hook-form';
import type { DialogProps } from '@toolpad/core/useDialogs';

import { z as zod } from 'zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Stack, Alert } from '@mui/material';

import API from 'src/services/API';

import { Field } from 'src/components/hook-form';
import { FormDialog, FormDialogContent } from 'src/components/custom/form-dialog';

// ----------------------------------------------------------------------

const schema = zod.object({
  reason: zod
    .string()
    .min(1, '请填写下架原因，将通知出租方')
    .max(500, '下架原因不能超过 500 字符'),
});

type FormValues = zod.infer<typeof schema>;

type ForceOfflineDialogPayload = {
  item: MyApi.OutputAssetAdminListItemDto;
  onSuccess?: () => void;
};

/** 强制下架对话框 */
export function AdminAssetForceOfflineDialog(props: DialogProps<ForceOfflineDialogPayload, void>) {
  const { open, onClose, payload } = props;
  const { item, onSuccess } = payload || {};

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { reason: '' },
  });

  const handleClose = useCallback(() => {
    methods.reset();
    onClose?.();
  }, [methods, onClose]);

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!item) return;
    await API.AdminAsset.AdminAssetControllerForceOfflineV1(
      { id: item.id },
      { reason: data.reason },
      { fetchOptions: { useApiMessage: true } }
    );
    onSuccess?.();
    handleClose();
  });

  if (!item) return null;

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      methods={methods}
      onSubmit={onSubmit}
      scroll="paper"
      dialogTitle="强制下架"
      okButtonText="确认下架"
      okButtonProps={{ color: 'error' }}
      slotProps={{
        paper: { sx: { border: (t) => `1px solid ${t.vars.palette.divider}` } },
      }}
    >
      <FormDialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Alert severity="error">
            强制下架后，资产将立即对用户不可见，出租方将收到下架通知。资产名称：{item.name}
          </Alert>
          <Field.Text
            name="reason"
            label="下架原因（必填）"
            placeholder="请填写下架原因，将通知出租方"
            multiline
            minRows={3}
            slotProps={{ input: { inputProps: { maxLength: 500 } } }}
          />
        </Stack>
      </FormDialogContent>
    </FormDialog>
  );
}
