import type { DialogProps } from '@toolpad/core/useDialogs';

import { z as zod } from 'zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Stack, Typography } from '@mui/material';

import { combineImageUrls } from 'src/utils/upload';

import API from 'src/services/API';
import { ossUploader } from 'src/lib/oss-uploader';

import { Field } from 'src/components/hook-form';
import { FormDialog, FormDialogContent } from 'src/components/custom/form-dialog';

// ----------------------------------------------------------------------

export type ApplyCancelOrderFormSchemaType = zod.infer<typeof ApplyCancelOrderFormSchema>;

export const ApplyCancelOrderFormSchema = zod.object({
  reason: zod
    .string()
    .min(1, { message: '请填写取消原因' })
    .max(500, { message: '取消原因不能超过500个字符' }),
  evidenceImages: zod.array(zod.union([zod.instanceof(File), zod.string()])).default([]),
});

type DialogPayload = {
  orderId: string;
  onSuccess?: () => void;
};

export function ApplyCancelOrderDialogForm(props: DialogProps<DialogPayload, void>) {
  const { open, onClose, payload } = props;

  const { orderId, onSuccess } = payload || {};

  const defaultValues: ApplyCancelOrderFormSchemaType = {
    reason: '',
    evidenceImages: [],
  };

  const methods = useForm<ApplyCancelOrderFormSchemaType>({
    resolver: zodResolver(ApplyCancelOrderFormSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, getValues, setValue } = methods;

  const handleRemoveImage = useCallback(
    (inputFile: File | string) => {
      const images = getValues('evidenceImages') || [];
      const filtered = images.filter((file) => file !== inputFile);
      setValue('evidenceImages', filtered);
    },
    [setValue, getValues]
  );

  const onSubmit = handleSubmit(async (data) => {
    try {
      // 上传证据图片到 OSS
      let evidenceUrls: string[] = [];

      if (data.evidenceImages && data.evidenceImages.length > 0) {
        // 分离已上传的 URL 和新文件
        const imageFiles = data.evidenceImages.filter(
          (image: File | string) => image instanceof File
        ) as File[];
        const oldImageFiles = data.evidenceImages.filter(
          (image: File | string) => typeof image === 'string'
        ) as string[];

        const uploadResults = await ossUploader.uploadFiles(imageFiles, {
          uploadPath: '/xuwu/order',
        });
        const combined = combineImageUrls(oldImageFiles, uploadResults);
        setValue('evidenceImages', combined.imageUrls);
        evidenceUrls = [...combined.imagePaths];

        // 上传新文件
        // if (imageFiles.length > 0) {
        //   const uploadResults = await ossUploader.uploadFiles(imageFiles, {
        //     uploadPath: '/xuwu/order',
        //   });
        //   const newEvidenceUrls = uploadResults.map((item) => item.path);
        //   const signatureUrls = newEvidenceUrls.map((item) => ossUploader.getSignatureUrl(item));
        //   setValue('evidenceImages', [...oldImageFiles, ...signatureUrls]);
        //   evidenceUrls = [...oldImageFiles, ...newEvidenceUrls];
        // } else {
        //   evidenceUrls = [...oldImageFiles];
        // }
        // evidenceUrls = evidenceUrls.map((item) => (isUrl(item) ? new URL(item).pathname : item));
      }

      // 调用取消订单 API
      await API.AppRentalOrderLessee.AppRentalOrderLesseeControllerCancelOrderV1(
        { id: orderId! },
        {
          reason: data.reason,
          evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
        },
        { fetchOptions: { useApiMessage: true } }
      );

      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('申请取消订单失败:', error);
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
      dialogTitle="申请取消订单"
      okButtonText="提交申请"
      slotProps={{
        paper: {
          sx: {
            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
          },
        },
      }}
    >
      <FormDialogContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Field.Text
            name="reason"
            label="取消原因"
            placeholder="请详细说明取消订单的原因"
            multiline
            minRows={4}
            maxRows={8}
            required
            helperText="已支付租金和押金的订单需要出租方同意后才能取消。请填写取消原因并上传相关证据。"
          />
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              说明材料（选填）
            </Typography>
            <Field.Upload
              helperText="支持上传图片和视频，最多9个文件，单个文件最大10M"
              name="evidenceImages"
              onRemove={handleRemoveImage}
              miniMode
              multiple
              maxFiles={9}
              maxSize={10 * 1024 * 1024}
            />
          </Box>
        </Stack>
      </FormDialogContent>
    </FormDialog>
  );
}
