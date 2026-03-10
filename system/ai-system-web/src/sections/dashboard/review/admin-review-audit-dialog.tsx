import type { Resolver } from 'react-hook-form';
import type { DialogProps } from '@toolpad/core/useDialogs';
import type { AdminRentalReviewListItem } from './types';

import { z as zod } from 'zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Stack, Alert } from '@mui/material';

import API from 'src/services/API';

import { Field } from 'src/components/hook-form';
import { FormDialog, FormDialogContent } from 'src/components/custom/form-dialog';

// ----------------------------------------------------------------------

const rejectSchema = zod.object({
  rejectReason: zod.string().min(1, '拒绝时请填写拒绝原因').max(500, '拒绝原因不能超过 500 字符'),
});

type RejectFormValues = zod.infer<typeof rejectSchema>;

type RejectDialogPayload = {
  item: AdminRentalReviewListItem;
  onSuccess?: () => void;
};

/** 审核拒绝对话框 */
export function AdminReviewRejectDialog(props: DialogProps<RejectDialogPayload, void>) {
  const { open, onClose, payload } = props;
  const { item, onSuccess } = payload || {};

  const methods = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema) as Resolver<RejectFormValues>,
    defaultValues: { rejectReason: '' },
  });

  const handleClose = useCallback(() => {
    methods.reset();
    onClose?.();
  }, [methods, onClose]);

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!item) return;
    await API.AdminRentalReview.AdminRentalReviewControllerRejectV1(
      { id: item.id },
      { rejectReason: data.rejectReason },
      { fetchOptions: { useApiMessage: true } }
    );
    onSuccess?.();
    handleClose();
  });

  if (!item) return null;

  const contentPreview = item.content
    ? item.content.length > 50
      ? `${item.content.slice(0, 50)}...`
      : item.content
    : '（无文字内容）';

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
            拒绝后评价将不对外展示，用户不会收到通知。评价内容：{contentPreview}
          </Alert>
          <Field.Text
            name="rejectReason"
            label="拒绝原因（必填）"
            placeholder="请说明拒绝原因"
            multiline
            minRows={3}
            slotProps={{ input: { inputProps: { maxLength: 500 } } }}
          />
        </Stack>
      </FormDialogContent>
    </FormDialog>
  );
}

// ----------------------------------------------------------------------

type ApproveDialogPayload = {
  item: AdminRentalReviewListItem;
  onSuccess?: () => void;
};

const emptyForm = zod.object({});
type EmptyFormValues = zod.infer<typeof emptyForm>;

/** 审核通过确认对话框 */
export function AdminReviewApproveDialog(props: DialogProps<ApproveDialogPayload, void>) {
  const { open, onClose, payload } = props;
  const { item, onSuccess } = payload || {};

  const methods = useForm<EmptyFormValues>({
    resolver: zodResolver(emptyForm) as Resolver<EmptyFormValues>,
    defaultValues: {},
  });

  const handleConfirm = useCallback(async () => {
    if (!item) return;
    await API.AdminRentalReview.AdminRentalReviewControllerApproveV1(
      { id: item.id },
      { fetchOptions: { useApiMessage: true } }
    );
    onSuccess?.();
    onClose?.();
  }, [item, onSuccess, onClose]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  if (!item) return null;

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      methods={methods}
      onSubmit={methods.handleSubmit(handleConfirm)}
      scroll="paper"
      dialogTitle="审核通过"
      okButtonText="通过审核"
      okButtonProps={{ color: 'success' }}
      slotProps={{
        paper: { sx: { border: (t) => `1px solid ${t.vars.palette.divider}` } },
      }}
    >
      <FormDialogContent sx={{ p: 3 }}>
        <Alert severity="info">通过后评价将公开展示，并更新资产评价统计。</Alert>
      </FormDialogContent>
    </FormDialog>
  );
}

// ----------------------------------------------------------------------

type HideDialogPayload = {
  item: AdminRentalReviewListItem;
  onSuccess?: () => void;
};

/** 隐藏评价确认对话框 */
export function AdminReviewHideDialog(props: DialogProps<HideDialogPayload, void>) {
  const { open, onClose, payload } = props;
  const { item, onSuccess } = payload || {};

  const methods = useForm<EmptyFormValues>({
    resolver: zodResolver(emptyForm) as Resolver<EmptyFormValues>,
    defaultValues: {},
  });

  const handleConfirm = useCallback(async () => {
    if (!item) return;
    await API.AdminRentalReview.AdminRentalReviewControllerHideV1(
      { id: item.id },
      { fetchOptions: { useApiMessage: true } }
    );
    onSuccess?.();
    onClose?.();
  }, [item, onSuccess, onClose]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  if (!item) return null;

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      methods={methods}
      onSubmit={methods.handleSubmit(handleConfirm)}
      scroll="paper"
      dialogTitle="隐藏评价"
      okButtonText="确认隐藏"
      okButtonProps={{ color: 'warning' }}
      slotProps={{
        paper: { sx: { border: (t) => `1px solid ${t.vars.palette.divider}` } },
      }}
    >
      <FormDialogContent sx={{ p: 3 }}>
        <Alert severity="warning">隐藏后评价将不再对外展示，资产评价统计将回滚。</Alert>
      </FormDialogContent>
    </FormDialog>
  );
}
