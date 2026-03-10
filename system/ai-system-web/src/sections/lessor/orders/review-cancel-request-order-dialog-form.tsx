import type { DialogProps } from '@toolpad/core/useDialogs';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useEffect, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Stack, Alert, Typography } from '@mui/material';

import { isUrl } from 'src/utils';
import API from 'src/services/API';
import { ossUploader } from 'src/lib/oss-uploader';

import { Field } from 'src/components/hook-form';
import { Scrollbar } from 'src/components/scrollbar';
import { FormDialog, FormDialogContent } from 'src/components/custom/form-dialog';

// ----------------------------------------------------------------------

export type ReviewCancelRequestFormSchemaType = zod.infer<typeof ReviewCancelRequestFormSchema>;

export const ReviewCancelRequestFormSchema = zod
  .object({
    approved: zod.enum(['true', 'false']),
    reason: zod.string().min(1, '该选项不能为空').max(500, '该选项不能超过500个字符'),
    evidenceUrls: zod
      .array(zod.union([zod.instanceof(File), zod.string()]))
      .default([])
      .optional(),
  })
  .refine(
    (data) => {
      if (data.approved === 'true' && data.reason) {
        return data.reason.trim() === '我同意取消订单';
      }
      return true;
    },
    { message: '输入错误，请输入  “我同意取消订单”  以确认', path: ['reason'] }
  );

type DialogPayload = {
  orderId: string;
  callback?: () => void;
};

export function ReviewCancelRequestDialogForm(props: DialogProps<DialogPayload, void>) {
  const { open, onClose, payload } = props;

  const { orderId, callback } = payload || {};

  const defaultValues: ReviewCancelRequestFormSchemaType = {
    approved: 'true',
    reason: '',
    evidenceUrls: [],
  };

  const methods = useForm<ReviewCancelRequestFormSchemaType>({
    resolver: zodResolver(ReviewCancelRequestFormSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, watch, getValues, setValue, clearErrors } = methods;

  const approvedValue = watch('approved');
  const approved = approvedValue === 'true';

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
      const isApproved = data.approved === 'true';

      // 上传凭证文件到 OSS（仅在拒绝时）
      let evidenceUrls: string[] = [];

      if (!isApproved && data.evidenceUrls && data.evidenceUrls.length > 0) {
        // 分离已上传的 URL 和新文件
        const newFiles = data.evidenceUrls.filter(
          (file: File | string) => file instanceof File
        ) as File[];
        const oldFiles = data.evidenceUrls.filter(
          (file: File | string) => typeof file === 'string'
        ) as string[];

        // 上传新文件
        if (newFiles.length > 0) {
          const uploadResults = await ossUploader.uploadFiles(newFiles, {
            uploadPath: '/xuwu/order',
          });
          const newPaths = uploadResults.map((item) => item.path);
          const signatureUrls = newPaths.map((path) => ossUploader.getSignatureUrl(path));
          // 替换旧文件为签名 URL，以防重复上传
          setValue('evidenceUrls', [...oldFiles, ...signatureUrls]);
          evidenceUrls = [...oldFiles, ...newPaths];
        } else {
          evidenceUrls = oldFiles;
        }
        evidenceUrls = evidenceUrls.map((url) => {
          if (isUrl(url)) {
            return new URL(url).pathname;
          }
          return url;
        });
      }

      // 调用同意/拒绝取消订单 API
      await API.AppRentalOrderLessor.AppRentalOrderLessorControllerApproveCancelOrderV1(
        { id: orderId! },
        {
          approved: isApproved,
          reason: data.reason,
          evidenceUrls: !isApproved && evidenceUrls.length > 0 ? evidenceUrls : undefined,
        },
        { fetchOptions: { useApiMessage: true } }
      );

      reset();
      callback?.();
      onClose();
    } catch (error) {
      console.error('处理取消订单申请失败:', error);
      // 失败后也要调用成功回调，避免页面状态不一致
      callback?.();
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    setValue('reason', '');
    clearErrors('reason');
  }, [approvedValue, setValue, clearErrors]);

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      methods={methods}
      onSubmit={onSubmit}
      scroll="paper"
      dialogTitle="处理取消订单申请"
      okButtonText={approved ? '同意取消' : '拒绝取消'}
      okButtonProps={{
        color: approved ? 'success' : 'error',
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
            <Alert severity="info">
              承租方已发起取消订单申请，请选择是否同意。
              <br />
              同意后，系统将自动退款并解冻押金；
              <Typography component="span" color="error" variant="body2">
                若拒绝，订单将进入平台审核，由平台协助处理后续事宜。
              </Typography>
            </Alert>

            <Field.RadioGroup
              name="approved"
              row
              label="处理方式"
              options={[
                { value: 'true', label: '同意取消' },
                { value: 'false', label: '拒绝取消' },
              ]}
              // helperText="请选择是否同意承租方的取消订单申请"
              slotProps={{
                formLabel: {
                  sx: {
                    fontWeight: 600,
                    mb: 0,
                    color: 'inherit',
                  },
                },
              }}
            />

            {approved ? (
              <Field.Text
                name="reason"
                label="请确认同意"
                placeholder="请输入 “我同意取消订单” 以确认"
                helperText="请在此输入“我同意取消订单”进行确认，系统将为承租方自动退款并解除押金"
              />
            ) : (
              <>
                <Field.Text
                  name="reason"
                  label="拒绝原因（必填）"
                  placeholder="请说明拒绝取消订单的原因"
                  multiline
                  minRows={3}
                  maxRows={6}
                  helperText="拒绝原因可以帮助承租方了解您的决定，最多500个字符"
                />

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    凭证（选填）
                  </Typography>
                  <Field.Upload
                    accept={{ 'image/*': [], 'video/*': [] }}
                    helperText="支持上传图片和视频，最多9个文件，单个文件最大10M"
                    name="evidenceUrls"
                    onRemove={handleRemoveFile}
                    miniMode
                    multiple
                    maxFiles={9}
                    maxSize={50 * 1024 * 1024}
                  />
                </Box>
              </>
            )}
          </Stack>
        </FormDialogContent>
      </Scrollbar>
    </FormDialog>
  );
}
