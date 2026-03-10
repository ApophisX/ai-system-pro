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

function createApproveSchema(maxAmount: number) {
  return zod.object({
    approvedAmount: zod
      .union([zod.number(), zod.string()])
      .optional()
      .transform((v) => {
        if (v === undefined || v === '') return undefined;
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
      })
      .refine(
        (v) => {
          if (v === undefined) return true;
          return v > 0 && v <= maxAmount;
        },
        { message: `认定金额须大于 0 且不超过 ¥${maxAmount.toFixed(2)}` }
      ),
    auditDescription: zod.string().max(500, '审核说明不能超过 500 字符').optional(),
  });
}

const rejectSchema = zod.object({
  auditDescription: zod
    .string()
    .min(1, '拒绝时请填写审核说明')
    .max(500, '审核说明不能超过 500 字符'),
});

type ApproveFormValues = zod.infer<ReturnType<typeof createApproveSchema>>;
type RejectFormValues = { auditDescription: string };

type ApproveDialogPayload = {
  item: MyApi.OutputDepositDeductionDto;
  onSuccess?: () => void;
};

/** 通过审核对话框 */
export function DepositAuditApproveDialog(props: DialogProps<ApproveDialogPayload, void>) {
  const { open, onClose, payload } = props;
  const { item, onSuccess } = payload || {};

  const maxAmount = item?.amount ?? 0;
  const methods = useForm<ApproveFormValues>({
    resolver: zodResolver(createApproveSchema(maxAmount)) as Resolver<ApproveFormValues>,
    defaultValues: { approvedAmount: undefined, auditDescription: '' },
  });

  const handleClose = useCallback(() => {
    methods.reset();
    onClose?.();
  }, [methods, onClose]);

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!item) return;
    await API.AdminDepositDeduction.AdminDepositDeductionControllerReviewV1(
      { id: item.id },
      {
        approved: true,
        approvedAmount: data.approvedAmount,
        auditDescription: data.auditDescription || undefined,
      }
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
      dialogTitle="通过审核"
      okButtonText="通过审核"
      okButtonProps={{ color: 'success' }}
      slotProps={{
        paper: { sx: { border: (t) => `1px solid ${t.vars.palette.divider}` } },
      }}
    >
      <FormDialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Alert severity="info">
            通过后扣款将立即执行。可指定认定金额（不填则使用原申请金额 ¥{item.amount.toFixed(2)}
            ），认定金额不得超过原申请金额。
          </Alert>
          <Field.Text
            name="approvedAmount"
            label="认定金额（元，选填）"
            placeholder="不填则使用原申请金额"
            slotProps={{
              input: {
                type: 'number',
                inputProps: { min: 0, max: maxAmount, step: 0.01 },
              },
            }}
          />
          <Field.Text
            name="auditDescription"
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

type RejectDialogPayload = {
  item: MyApi.OutputDepositDeductionDto;
  onSuccess?: () => void;
};

/** 拒绝审核对话框 */
export function DepositAuditRejectDialog(props: DialogProps<RejectDialogPayload, void>) {
  const { open, onClose, payload } = props;
  const { item, onSuccess } = payload || {};

  const methods = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { auditDescription: '' },
  });

  const handleClose = useCallback(() => {
    methods.reset();
    onClose?.();
  }, [methods, onClose]);

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!item) return;
    await API.AdminDepositDeduction.AdminDepositDeductionControllerReviewV1(
      { id: item.id },
      {
        approved: false,
        auditDescription: data.auditDescription,
      },
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
      dialogTitle="拒绝审核"
      okButtonText="确认拒绝"
      okButtonProps={{ color: 'error' }}
      slotProps={{
        paper: { sx: { border: (t) => `1px solid ${t.vars.palette.divider}` } },
      }}
    >
      <FormDialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Alert severity="warning">
            拒绝后仅更新状态与审核说明，不会执行扣款。审核说明将通知用户。
          </Alert>
          <Field.Text
            name="auditDescription"
            label="审核说明（必填）"
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
