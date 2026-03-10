import type { DialogProps } from '@toolpad/core/useDialogs';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useMemo, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Stack, Alert, Typography } from '@mui/material';

import { splitFiles, combineImageUrls } from 'src/utils/upload';

import API from 'src/services/API';
import { ossUploader } from 'src/lib/oss-uploader';

import { Field } from 'src/components/hook-form';
import { Scrollbar } from 'src/components/scrollbar';
import { FormDialog, FormDialogContent } from 'src/components/custom/form-dialog';

// ----------------------------------------------------------------------

const createConfirmDepositDeductionSchema = (responseType: 'approved' | 'rejected') => {
  const base = zod.object({
    description: zod
      .string()
      .min(1, '请填写响应说明')
      .max(500, '响应说明不能超过500个字符'),
    evidenceUrls: zod
      .array(zod.union([zod.instanceof(File), zod.string()]))
      .default([])
      .optional(),

  });

  if (responseType === 'rejected') {
    return base.extend({
      evidenceUrls: zod
        .array(zod.union([zod.instanceof(File), zod.string()]))
        .min(1, '拒绝时请至少上传一张凭证')
        .default([]),
    });
  }

  return base.refine((data) => {
    if (responseType === 'approved') {
      return data.description.trim() === '我同意扣款';
    }
    return true;
  }, {
    path: ['description'],
    message: '响应说明必须为 “我同意扣款”',
  });
};

export type ConfirmDepositDeductionFormSchemaType = zod.infer<
  ReturnType<typeof createConfirmDepositDeductionSchema>
>;

type DialogPayload = {
  orderId: string;
  deductionId: string;
  responseType: 'approved' | 'rejected';
  onSuccess?: () => void;
};

export function ConfirmDepositDeductionDialogForm(props: DialogProps<DialogPayload, void>) {
  const { open, onClose, payload } = props;

  const { orderId, deductionId, responseType, onSuccess } = payload || {};

  const schema = useMemo(
    () => createConfirmDepositDeductionSchema(responseType ?? 'approved'),
    [responseType]
  );

  const defaultValues: ConfirmDepositDeductionFormSchemaType = {
    description: '',
    evidenceUrls: [],

  };

  const methods = useForm<ConfirmDepositDeductionFormSchemaType>({
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, getValues, setValue } = methods;

  const handleRemoveFile = useCallback(
    (inputFile: File | string) => {
      const files = getValues('evidenceUrls') || [];
      const filtered = files.filter((file) => file !== inputFile);
      setValue('evidenceUrls', filtered);
    },
    [setValue, getValues]
  );

  const onSubmit = handleSubmit(async (data) => {
    try {


      let evidenceUrls: string[] = [];
      if (responseType === 'rejected' && data.evidenceUrls && data.evidenceUrls.length > 0) {
        const { existingFiles, newFiles } = splitFiles(data.evidenceUrls);
        const uploadResults = await ossUploader.uploadFiles(newFiles, {
          uploadPath: '/xuwu/order',
        });
        const combinedResult = combineImageUrls(existingFiles, uploadResults)
        setValue('evidenceUrls', combinedResult.imageUrls);
        evidenceUrls = [...combinedResult.imagePaths];
      }

      await API.AppRentalOrderLessee.AppRentalOrderLesseeControllerConfirmDepositDeductionV1(
        { id: orderId! },
        {
          deductionId: deductionId!,
          responseType,
          description: data.description,
          evidenceUrls,
        },
        { fetchOptions: { useApiMessage: true } }
      );
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('确认押金扣款失败:', error);
    }
  });

  const handleClose = useCallback(() => {
    reset();
    onClose?.();
  }, [reset, onClose]);

  const isApproved = responseType === 'approved';

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      methods={methods}
      onSubmit={onSubmit}
      scroll="paper"
      dialogTitle={isApproved ? '同意扣款' : '拒绝扣款'}
      okButtonText={isApproved ? '同意扣款' : '提交拒绝'}
      okButtonProps={{
        color: isApproved ? 'success' : 'error',
      }}
      slotProps={{
        paper: {
          sx: {
            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
          },
        },
      }}
    >
      <Scrollbar sx={{ maxHeight: '70vh' }}>
        <FormDialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Alert severity={isApproved ? 'info' : 'warning'}>
              {isApproved
                ? '确认后您将同意此次押金扣款，平台将按申请金额执行扣款操作。请确保信息无误。'
                : '拒绝后，本次扣款申请将提交平台进行审核。如有异议，请务必上传相关凭证材料以便进一步核查。'}
            </Alert>

            <Field.Text
              name="description"
              label={isApproved ? '响应说明（必填）' : '拒绝原因（必填）'}
              placeholder={
                isApproved
                  ? '请输入 “我同意扣款” 作为响应说明'
                  : '请说明拒绝本次扣款的原因'
              }
              multiline
              minRows={3}
              maxRows={6}
              helperText={isApproved ? undefined : '最多500个字符'}
              slotProps={{
                input: { inputProps: { maxLength: 500 } },
              }}
            />

            {responseType === 'rejected' && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  凭证图片
                </Typography>
                <Field.Upload
                  accept={{ 'image/*': [], 'video/*': [] }}
                  helperText="拒绝时请至少上传1张凭证，最多9张，支持图片和视频，单个文件最大10M"
                  name="evidenceUrls"
                  onRemove={handleRemoveFile}
                  miniMode
                  multiple
                  maxFiles={9}
                  maxSize={10 * 1024 * 1024}
                />
              </Box>
            )}
          </Stack>
        </FormDialogContent>
      </Scrollbar>
    </FormDialog>
  );
}
