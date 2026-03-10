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

const approveSchema = zod.object({
  auditRemark: zod.string().max(500, '审核说明不能超过 500 字符').optional(),
});

const rejectSchema = zod.object({
  auditRemark: zod
    .string()
    .min(1, '拒绝时请填写审核意见')
    .max(500, '审核意见不能超过 500 字符'),
});

type ApproveFormValues = zod.infer<typeof approveSchema>;
type RejectFormValues = zod.infer<typeof rejectSchema>;

type AuditDialogPayload = {
  item: MyApi.OutputAssetAdminListItemDto;
  onSuccess?: () => void;
};

/** 审核通过对话框 */
export function AdminAssetAuditApproveDialog(props: DialogProps<AuditDialogPayload, void>) {
  const { open, onClose, payload } = props;
  const { item, onSuccess } = payload || {};

  const methods = useForm<ApproveFormValues>({
    resolver: zodResolver(approveSchema) as Resolver<ApproveFormValues>,
    defaultValues: { auditRemark: '' },
  });

  const handleClose = useCallback(() => {
    methods.reset();
    onClose?.();
  }, [methods, onClose]);

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!item) return;
    await API.AdminAsset.AdminAssetControllerAuditV1(
      { id: item.id },
      { action: 'approve', auditRemark: data.auditRemark || undefined },
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
      dialogTitle="审核通过"
      okButtonText="通过审核"
      okButtonProps={{ color: 'success' }}
      slotProps={{
        paper: { sx: { border: (t) => `1px solid ${t.vars.palette.divider}` } },
      }}
    >
      <FormDialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Alert severity="info">
            通过后资产将对外展示，用户可浏览和下单。资产名称：{item.name}
          </Alert>
          <Field.Text
            name="auditRemark"
            label="审核说明（选填）"
            placeholder="请输入审核说明"
            multiline
            minRows={2}
            slotProps={{ input: { inputProps: { maxLength: 500 } } }}
          />
        </Stack>
      </FormDialogContent>
    </FormDialog>
  );
}

/** 审核拒绝对话框 */
export function AdminAssetAuditRejectDialog(props: DialogProps<AuditDialogPayload, void>) {
  const { open, onClose, payload } = props;
  const { item, onSuccess } = payload || {};

  const methods = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema) as Resolver<RejectFormValues>,
    defaultValues: { auditRemark: '' },
  });

  const handleClose = useCallback(() => {
    methods.reset();
    onClose?.();
  }, [methods, onClose]);

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!item) return;
    await API.AdminAsset.AdminAssetControllerAuditV1(
      { id: item.id },
      { action: 'reject', auditRemark: data.auditRemark },
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
      dialogTitle="审核拒绝"
      okButtonText="确认拒绝"
      okButtonProps={{ color: 'error' }}
      slotProps={{
        paper: { sx: { border: (t) => `1px solid ${t.vars.palette.divider}` } },
      }}
    >
      <FormDialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Alert severity="warning">
            拒绝后资产将无法对外展示，出租方将收到审核意见通知。资产名称：{item.name}
          </Alert>
          <Field.Text
            name="auditRemark"
            label="审核意见（必填）"
            placeholder="请说明拒绝原因，将通知出租方"
            multiline
            minRows={3}
            slotProps={{ input: { inputProps: { maxLength: 500 } } }}
          />
        </Stack>
      </FormDialogContent>
    </FormDialog>
  );
}
