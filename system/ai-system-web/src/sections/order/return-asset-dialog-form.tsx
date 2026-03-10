import type { DialogProps } from '@toolpad/core/useDialogs';

import { z as zod } from 'zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Stack, Alert, Typography } from '@mui/material';

import { combineImageUrls } from 'src/utils/upload';

import API from 'src/services/API';
import { ossUploader } from 'src/lib/oss-uploader';

import { Field } from 'src/components/hook-form';
import { Scrollbar } from 'src/components/scrollbar';
import { FormDialog, FormDialogContent } from 'src/components/custom/form-dialog';

// ----------------------------------------------------------------------

export type ReturnAssetFormSchemaType = zod.infer<typeof ReturnAssetFormSchema>;

export const ReturnAssetFormSchema = zod.object({
  description: zod.string().max(500, { message: '归还说明不能超过500个字符' }).optional(),
  evidenceImages: zod
    .array(zod.union([zod.instanceof(File), zod.string()]))
    .min(3, { message: '至少上传3张图片' })
    .max(9, { message: '最多9张图片' })
    .default([])
    .optional(),
});

type DialogPayload = {
  orderId: string;
  onSuccess?: () => void;
};

export function ReturnAssetDialogForm(props: DialogProps<DialogPayload, void>) {
  const { open, onClose, payload } = props;

  const { orderId, onSuccess } = payload || {};

  const defaultValues: ReturnAssetFormSchemaType = {
    description: '',
    evidenceImages: [],
  };

  const methods = useForm<ReturnAssetFormSchemaType>({
    resolver: zodResolver(ReturnAssetFormSchema) as any,
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
      // 上传凭证图片到 OSS
      let evidenceUrls: string[] = [];

      if (data.evidenceImages && data.evidenceImages.length > 0) {
        // 分离已上传的 URL 和新文件
        const imageFiles = data.evidenceImages.filter(
          (image: File | string) => image instanceof File
        ) as File[];
        const existingImages = data.evidenceImages.filter(
          (image: File | string) => typeof image === 'string'
        ) as string[];
        const uploadResults = await ossUploader.uploadFiles(imageFiles, {
          uploadPath: '/xuwu/order',
        });
        const combined = combineImageUrls(existingImages, uploadResults);
        setValue('evidenceImages', combined.imageUrls);
        evidenceUrls = [...combined.imagePaths];
      }

      await API.AppRentalOrderLessee.AppRentalOrderLesseeControllerReturnAssetV1(
        { id: orderId },
        {
          evidenceUrls,
          description: data.description,
        }
      );

      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('归还资产失败:', error);
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
      dialogTitle="归还资产"
      okButtonText="提交归还"
      okButtonProps={{
        color: 'primary',
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
            {/* 提示信息 */}
            <Alert severity="info">
              提交归还申请后，订单将进入「已归还待确认」状态，等待出租方确认归还。
            </Alert>

            {/* 凭证图片 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                归还凭证材料
              </Typography>
              <Field.Upload
                helperText="请上传归还凭证材料（如有争议时可用），最多9个文件，单个文件最大10M"
                name="evidenceImages"
                onRemove={handleRemoveImage}
                miniMode
                multiple
                maxFiles={9}
                maxSize={10 * 1024 * 1024}
              />
            </Box>

            {/* 归还说明 */}
            <Field.Text
              name="description"
              label="归还说明（选填）"
              placeholder="请说明资产归还情况，如资产状态、使用情况等"
              multiline
              minRows={4}
              maxRows={8}
              helperText="最多500个字符"
              slotProps={{ input: { inputProps: { maxLength: 500 } } }}
            />
          </Stack>
        </FormDialogContent>
      </Scrollbar>
    </FormDialog>
  );
}
