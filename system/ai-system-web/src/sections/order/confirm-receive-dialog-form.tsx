import type { DialogProps } from '@toolpad/core/useDialogs';

import { z as zod } from 'zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Stack, Alert, Divider, Typography } from '@mui/material';

import { combineImageUrls } from 'src/utils/upload';

import API from 'src/services/API';
import { ossUploader } from 'src/lib/oss-uploader';

import { Field } from 'src/components/hook-form';
import { Scrollbar } from 'src/components/scrollbar';
import { FormDialog, FormDialogContent } from 'src/components/custom/form-dialog';

import { AssetInventoryBindInfoCard } from '../lessor/assets/components';

// ----------------------------------------------------------------------

export type ConfirmReceiveFormSchemaType = zod.infer<typeof ConfirmReceiveFormSchema>;

export const ConfirmReceiveFormSchema = zod.object({
  confirmText: zod
    .string()
    .min(1, { message: '请输入"我已确认收货"以确认您已收到物品' })
    .refine((value) => value === '我已确认收货', {
      message: '请输入"我已确认收货"以确认您已收到物品"',
    }),
  description: zod
    .string()
    .max(500, { message: '确认收货说明不能超过500个字符' })
    .optional(),
  // 最多9张图片，单张图片最大10M
  evidenceImages: zod
    .array(zod.union([zod.instanceof(File), zod.string()]))
    .max(9, { message: '最多9张图片' })
    .default([])
    .optional()
});

type DialogPayload = {
  order: MyApi.OutputRentalOrderDto;
  onSuccess?: () => void;
};

export function ConfirmReceiveDialogForm(props: DialogProps<DialogPayload, void>) {
  const { open, onClose, payload } = props;

  const { order, onSuccess } = payload || {};

  const defaultValues: ConfirmReceiveFormSchemaType = {
    confirmText: '',
    description: '',
    evidenceImages: [],
  };

  const methods = useForm<ConfirmReceiveFormSchemaType>({
    resolver: zodResolver(ConfirmReceiveFormSchema) as any,
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
      await API.AppRentalOrderLessee.AppRentalOrderLesseeControllerConfirmReceiptV1({ id: order.id }, {
        confirmedReceipt: true,
        evidenceUrls,
        description: data.description,
      })
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('确认收货失败:', error);
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  // 实例信息
  const inventory = order?.inventory;

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      methods={methods}
      onSubmit={onSubmit}
      scroll="paper"
      dialogTitle="确认收货"
      okButtonText="确认收货"
      okButtonProps={{
        color: 'success',
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
              请仔细检查收到的物品是否与订单信息一致。确认收货后，订单将进入使用中状态。
            </Alert>

            {/* 实例信息 */}
            {inventory && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  实例信息
                </Typography>
                <AssetInventoryBindInfoCard inventory={inventory} />
              </Box>
            )}

            <Divider />

            {/* 确认文本 */}
            <Field.Text
              name="confirmText"
              label="确认收货"
              placeholder='请输入"我已确认收货"'
              required
              helperText='请输入"我已确认收货"以确认您已收到物品'
            />

            {/* 确认收货说明 */}
            <Field.Text
              name="description"
              label="确认收货说明（选填）"
              placeholder="请说明收到的物品是否完好，是否与订单信息一致等"
              multiline
              minRows={4}
              maxRows={8}
              helperText="最多500个字符"
              slotProps={{ input: { inputProps: { maxLength: 500, } } }}
            />

            {/* 凭证材料 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                凭证材料（选填）
              </Typography>
              <Field.Upload
                accept={{ 'image/*': [] }}
                helperText="请请凭证材料（如有争议时可用），最多9张，单个文件最大10M"
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
      </Scrollbar>
    </FormDialog>
  );
}
