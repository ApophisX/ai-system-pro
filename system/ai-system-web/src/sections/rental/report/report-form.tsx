import { z as zod } from 'zod';
import { m } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Stack, Alert, Button, MenuItem, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { combineImageUrls } from 'src/utils/upload';

import API from 'src/services/API';
import { ossUploader } from 'src/lib/oss-uploader';

import { FadeInPaper } from 'src/components/custom';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type ReportFormSchemaType = zod.infer<typeof ReportFormSchema>;

export const ReportFormSchema = zod.object({
  reason: zod.string().min(1, { message: '请选择举报原因' }),
  description: zod
    .string()
    .min(10, { message: '请详细描述违规情况，至少10个字符' })
    .max(500, { message: '描述不能超过500个字符' }),
  contact: zod
    .string()
    .optional()
    .refine((val) => !val || /^1[3-9]\d{9}$/.test(val), { message: '请输入正确的手机号码' }),
  images: zod
    .array(zod.union([zod.instanceof(File), zod.string()]))
    .min(1, { message: '请至少上传一张违规图片' })
    .max(3, { message: '最多上传3张图片' }),
});

// 举报原因选项
const REPORT_REASONS = [
  { value: 'fraud', label: '虚假信息/欺诈' },
  { value: 'illegal', label: '违法违规内容' },
  { value: 'spam', label: '垃圾信息/广告' },
  { value: 'inappropriate', label: '不当内容' },
  { value: 'duplicate', label: '重复发布' },
  { value: 'price_mismatch', label: '价格/联系方式与描述不符' },
  { value: 'copyright', label: '侵犯版权/盗用图片' },
  { value: 'privacy', label: '侵犯隐私/盗用他人信息' },
  { value: 'prohibited', label: '违禁物品出租' },
  { value: 'safety', label: '安全隐患/危险物品' },
  { value: 'harassment', label: '骚扰/威胁' },
  { value: 'other', label: '其他' },
] as const;

// ----------------------------------------------------------------------

type Props = {
  assetId: string;
};

export function ReportForm({ assetId }: Props) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: ReportFormSchemaType = {
    reason: '',
    description: '',
    contact: '',
    images: [],
  };

  const methods = useForm({
    resolver: zodResolver(ReportFormSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    getValues,
  } = methods;

  //
  const handleRemoveImage = useCallback(
    (inputFile: File | string) => {
      const images = getValues('images');
      const filtered = images && images?.filter((file) => file !== inputFile);
      setValue('images', filtered);
    },
    [setValue, getValues]
  );

  const onSubmit = handleSubmit(
    async (data) => {
      try {
        setErrorMessage(null);

        const rawImages = data.images ?? [];
        const newFiles = rawImages.filter((x): x is File => x instanceof File);
        const existing = rawImages.filter((x): x is string => typeof x === 'string');

        const uploadResults = await ossUploader.uploadFiles(newFiles, {
          uploadPath: '/xuwu/report',
        });
        const { imagePaths, imageUrls } = combineImageUrls(existing, uploadResults);
        setValue('images', imageUrls);

        const body: MyApi.CreateReportDto = {
          assetId,
          reason: data.reason as MyApi.CreateReportDto['reason'],
          description: data.description.trim(),
          images: imagePaths.length > 0 ? imagePaths : undefined,
        };

        await API.AppReport.AppReportControllerCreateV1(body, {
          fetchOptions: { useApiMessage: true },
        });

        router.replace(paths.rental.report.success(assetId));
      } catch (error) {
        console.error(error);
        setErrorMessage('提交失败，请稍后重试');
      }
    },
    () => {
      setErrorMessage('请检查表单后重试');
    }
  );

  return (
    <FadeInPaper>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            举报违规信息
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            如果您发现该资产信息存在违规行为，请填写以下信息进行举报。我们会认真处理您的举报。
          </Typography>
        </Stack>

        {errorMessage && (
          <Alert severity="error" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Field.Select name="reason" label="举报原因" placeholder="请选择举报原因">
              {REPORT_REASONS.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Text
              name="description"
              label="详细描述"
              placeholder="请详细描述违规情况，包括具体的时间、地点、行为等（至少10个字符）"
              multiline
              minRows={4}
              maxRows={8}
              slotProps={{
                input: {
                  inputProps: {
                    maxLength: 500,
                  },
                },
              }}
            />

            <Stack spacing={1}>
              <Field.Text
                name="contact"
                type="tel"
                label="联系方式（选填）"
                placeholder="请输入您的手机号码，方便我们联系您"
                helperText="如需要，可留下您的联系方式，我们会及时与您沟通处理结果"
                slotProps={{
                  input: {
                    inputProps: {
                      maxLength: 11,
                    },
                  },
                }}
              />
            </Stack>

            <Box>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                违规图片
              </Typography>
              <Field.Upload
                accept={{ 'image/*': [] }}
                helperText="最多上传3张图片，单张图片最大10M"
                name="images"
                onRemove={handleRemoveImage}
                miniMode
                multiple
                maxFiles={3}
                maxSize={10 * 1024 * 1024}
              />
            </Box>

            <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button
                component={m.button}
                whileTap={{ scale: 0.98 }}
                type="submit"
                variant="contained"
                color="error"
                fullWidth
                disabled={isSubmitting}
                sx={{
                  fontWeight: 600,
                }}
              >
                {isSubmitting ? '提交中...' : '提交举报'}
              </Button>
            </Stack>
          </Stack>
        </Form>
      </Stack>
    </FadeInPaper>
  );
}
