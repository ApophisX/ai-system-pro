import { useCallback } from 'react';
import { Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Stack, Button, Typography } from '@mui/material';

import { combineImageUrls } from 'src/utils/upload';

import API from 'src/services/API';
import { ossUploader } from 'src/lib/oss-uploader';

import { Form, Field } from 'src/components/hook-form';

import { CreateReviewFormSchema, type CreateReviewFormValues } from './schema/create-review-schema';

// ----------------------------------------------------------------------

type Props = {
  orderId: string;
  orderNo?: string;
  assetName?: string;
  onSuccess?: () => void;
};

export function CreateRentalReviewFormContent({ orderId, orderNo, assetName, onSuccess }: Props) {
  const methods = useForm<CreateReviewFormValues>({
    resolver: zodResolver(CreateReviewFormSchema),
    defaultValues: {
      score: 5,
      content: '',
      images: [],
    },
  });

  const { setValue, getValues, watch, formState } = methods;
  const contentLength = (watch('content') ?? '').length;

  const handleRemoveImage = useCallback(
    (file: File | string) => {
      const images = getValues('images') ?? [];
      setValue(
        'images',
        images.filter((f) => f !== file)
      );
    },
    [getValues, setValue]
  );

  const onSubmit = methods.handleSubmit(async (data) => {
    let imagePaths: string[] = [];

    if (data.images && data.images.length > 0) {
      const newFiles = data.images.filter((f): f is File => f instanceof File);
      const existing = data.images.filter((f): f is string => typeof f === 'string');
      const uploadResults = await ossUploader.uploadFiles(newFiles, {
        uploadPath: '/xuwu/rental-review',
      });
      const combined = combineImageUrls(existing, uploadResults);
      imagePaths = combined.imagePaths;
      setValue('images', combined.imageUrls);
    }

    await API.AppRentalReview.AppRentalReviewControllerCreateV1(
      {
        orderId,
        score: data.score,
        content: data.content?.trim() || undefined,
        images: imagePaths.length > 0 ? imagePaths : undefined,
      },
      { fetchOptions: { useApiMessage: true } }
    );
    onSuccess?.();
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        {assetName && (
          <Typography variant="body2" color="text.secondary">
            评价订单：{orderNo || orderId} · {assetName}
          </Typography>
        )}

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            评分 <span style={{ color: 'var(--mui-palette-error-main)' }}>*</span>
          </Typography>
          <Field.Rating
            name="score"
            slotProps={{
              icon: <Star size={28} fill="currentColor" />,
            }}
            sx={{
              '& .MuiRating-iconFilled': { color: 'warning.main' },
              '& .MuiRating-iconHover': { color: 'warning.dark' },
            }}
          />
        </Box>

        <Field.Text
          name="content"
          label="评价内容（选填）"
          placeholder="分享您的使用体验，帮助其他用户更好地选择..."
          multiline
          minRows={4}
          maxRows={8}
          slotProps={{ input: { inputProps: { maxLength: 500 } } }}
          helperText={`${contentLength}/500`}
        />

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            上传图片（选填）
          </Typography>
          <Field.Upload
            name="images"
            accept={{ 'image/*': [] }}
            multiple
            maxFiles={9}
            maxSize={10 * 1024 * 1024}
            onRemove={handleRemoveImage}
            miniMode
            helperText="最多9张图片，单张最大10M"
          />
        </Box>
      </Stack>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        <Button variant="contained" type="submit" loading={formState.isSubmitting}>
          提交评价
        </Button>
      </Box>
    </Form>
  );
}
