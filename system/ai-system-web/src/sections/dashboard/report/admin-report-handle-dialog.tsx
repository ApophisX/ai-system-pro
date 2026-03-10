import type { Resolver } from 'react-hook-form';
import type { DialogProps } from '@toolpad/core/useDialogs';
import type { ReportHandleAction, AdminReportListItem } from './types';

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
  remark: zod.string().min(1, '驳回时请填写处理备注').max(500, '备注不能超过 500 字符'),
});

const approveSchema = zod.object({
  remark: zod.string().max(500, '备注不能超过 500 字符').optional(),
});

const markMaliciousSchema = zod.object({
  remark: zod.string().min(1, '标记恶意举报时请填写备注').max(500, '备注不能超过 500 字符'),
});

type RejectFormValues = zod.infer<typeof rejectSchema>;
type ApproveFormValues = zod.infer<typeof approveSchema>;
type MarkMaliciousFormValues = zod.infer<typeof markMaliciousSchema>;

// ----------------------------------------------------------------------

type HandleDialogPayload = {
  item: AdminReportListItem;
  action: ReportHandleAction;
  onSuccess?: () => void;
};

/** 举报处理对话框（通过/驳回/恶意举报） */
export function AdminReportHandleDialog(props: DialogProps<HandleDialogPayload, void>) {
  const { open, onClose, payload } = props;
  const { item, action, onSuccess } = payload || {};

  const isReject = action === 'reject';
  const isApprove = action === 'approve';
  const isMarkMalicious = action === 'mark_malicious';

  const rejectMethods = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema) as Resolver<RejectFormValues>,
    defaultValues: { remark: '' },
  });

  const approveMethods = useForm<ApproveFormValues>({
    resolver: zodResolver(approveSchema) as Resolver<ApproveFormValues>,
    defaultValues: { remark: '' },
  });

  const markMaliciousMethods = useForm<MarkMaliciousFormValues>({
    resolver: zodResolver(markMaliciousSchema) as Resolver<MarkMaliciousFormValues>,
    defaultValues: { remark: '' },
  });

  const methods = isReject
    ? rejectMethods
    : isMarkMalicious
      ? markMaliciousMethods
      : approveMethods;

  const handleClose = useCallback(() => {
    methods.reset();
    onClose?.();
  }, [methods, onClose]);

  const getDialogConfig = () => {
    if (isApprove) {
      return {
        title: '举报成立',
        okText: '确认成立',
        okColor: 'success' as const,
        alert: (
          <Alert severity="info">
            确认后举报将标记为成立，平台将根据规则对相关资产/用户进行处理，举报人将收到通知。
          </Alert>
        ),
        getRemark: () => approveMethods.getValues('remark'),
      };
    }
    if (isReject) {
      return {
        title: '驳回举报',
        okText: '确认驳回',
        okColor: 'error' as const,
        alert: (
          <Alert severity="warning">
            驳回后举报将标记为不成立，举报人将收到通知。请务必填写驳回原因以便留档。
          </Alert>
        ),
        getRemark: () => rejectMethods.getValues('remark'),
      };
    }
    // mark_malicious
    return {
      title: '标记恶意举报',
      okText: '确认标记',
      okColor: 'warning' as const,
      alert: (
        <Alert severity="error">
          标记为恶意举报后，举报人可能受到平台处罚。请确认举报人存在滥用举报功能的行为，并填写详细说明。
        </Alert>
      ),
      getRemark: () => markMaliciousMethods.getValues('remark'),
    };
  };

  const config = getDialogConfig();

  const onSubmit = methods.handleSubmit(async () => {
    if (!item || item.status !== 0) return;

    const remark = config.getRemark?.();
    await API.AdminReport.AdminReportControllerHandleV1(
      { id: item.id },
      { action, remark: remark?.trim() || undefined },
      { fetchOptions: { useApiMessage: true } }
    );
    onSuccess?.();
    handleClose();
  });

  if (!item) return null;

  if (item.status !== 0) {
    return (
      <FormDialog
        open={open}
        onClose={handleClose}
        methods={methods}
        onSubmit={handleClose}
        scroll="paper"
        dialogTitle="无法处理"
        okButtonText="关闭"
        slotProps={{
          paper: { sx: { border: (t) => `1px solid ${t.vars.palette.divider}` } },
        }}
      >
        <FormDialogContent sx={{ p: 3 }}>
          <Alert severity="warning">该举报已处理，无法重复操作。</Alert>
        </FormDialogContent>
      </FormDialog>
    );
  }

  const showRemarkField = isReject || isMarkMalicious;

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      methods={methods}
      onSubmit={onSubmit}
      scroll="paper"
      dialogTitle={config.title}
      okButtonText={config.okText}
      okButtonProps={{ color: config.okColor }}
      slotProps={{
        paper: { sx: { border: (t) => `1px solid ${t.vars.palette.divider}` } },
      }}
    >
      <FormDialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {config.alert}
          {showRemarkField && (
            <Field.Text
              name="remark"
              label={isReject ? '驳回原因（必填）' : '说明（必填）'}
              placeholder={isReject ? '请说明驳回原因' : '请说明为何判定为恶意举报'}
              multiline
              minRows={3}
              slotProps={{ input: { inputProps: { maxLength: 500 } } }}
            />
          )}
          {isApprove && (
            <Field.Text
              name="remark"
              label="处理备注（选填）"
              placeholder="可填写补充说明"
              multiline
              minRows={2}
              slotProps={{ input: { inputProps: { maxLength: 500 } } }}
            />
          )}
        </Stack>
      </FormDialogContent>
    </FormDialog>
  );
}
