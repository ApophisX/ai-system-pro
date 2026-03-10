import { z as zod } from 'zod';
import { useState } from 'react';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';

import { usePlatform } from 'src/hooks/use-platform';

import { isUrl } from 'src/utils';
import API from 'src/services/API';
import { navigateBack } from 'src/lib/bridge';
import { ossUploader } from 'src/lib/oss-uploader';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const CreateCommunitySchema = zod.object({
  name: zod.string().min(1, '请填写社区名称').max(100, '社区名称不能超过100个字符'),
  description: zod.string().max(500, '社区描述不能超过500个字符').optional().or(zod.literal('')),
  coverImage: zod
    .union([zod.instanceof(File), zod.string()])
    .optional()
    .nullable(),
  type: zod.enum(['public', 'private'], {
    message: '请选择社区类型',
  }),
});

export type CreateCommunityFormSchemaType = zod.infer<typeof CreateCommunitySchema>;

const defaultValues: CreateCommunityFormSchemaType = {
  name: '',
  description: '',
  coverImage: null,
  type: 'public',
};

// ----------------------------------------------------------------------

export function CreateCommunityFormContent() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isInWeChatMiniProgram } = usePlatform();

  const methods = useForm<CreateCommunityFormSchemaType>({
    resolver: zodResolver(CreateCommunitySchema),
    defaultValues,
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const handleClearCoverImage = () => {
    setValue('coverImage', null, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);

      let coverImageUrl: string | undefined;

      if (data.coverImage) {
        if (data.coverImage instanceof File) {
          const result = await ossUploader.uploadFile(data.coverImage, {
            uploadPath: '/xuwu/community',
          });
          coverImageUrl = result.path;
          setValue('coverImage', ossUploader.getSignatureUrl(result.path));
        } else {
          coverImageUrl = isUrl(data.coverImage)
            ? new URL(data.coverImage).pathname
            : data.coverImage;
        }
      }

      await API.AppCommunity.AppCommunityControllerCreateV1({
        name: data.name,
        description: data.description || undefined,
        coverImage: coverImageUrl,
        type: data.type,
      });
      router.back();
    } catch (err) {
      console.error(err);
      setErrorMessage('创建失败，请稍后重试');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        {/* 基本信息 */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: (theme) => theme.vars.customShadows.card,
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
            基本信息
          </Typography>
          <Stack spacing={2.5}>
            <Field.Text
              name="name"
              label="社区名称"
              placeholder="请输入社区名称"
              slotProps={{
                input: {
                  inputProps: { maxLength: 100 },
                },
              }}
            />

            <Field.Text
              name="description"
              label="社区描述"
              placeholder="简要描述社区主题和内容（选填）"
              multiline
              rows={4}
              slotProps={{
                input: {
                  inputProps: { maxLength: 500 },
                },
              }}
            />

            <Box>
              <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                封面图（选填）
              </Typography>
              <Field.Upload
                name="coverImage"
                onDelete={handleClearCoverImage}
                slotProps={{
                  wrapper: { sx: { minHeight: 200 } },
                }}
              />
            </Box>
          </Stack>
        </Paper>

        {/* 社区类型 */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: (theme) => theme.vars.customShadows.card,
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
            社区类型
          </Typography>
          <Field.RadioGroup
            name="type"
            options={[
              { value: 'public', label: '公开社区 - 任何用户可直接加入，无需邀请码' },
              { value: 'private', label: '私密社区 - 需输入邀请码才能加入，创建后自动生成邀请码' },
            ]}
            row={false}
          />
        </Paper>

        {/* 提示信息 */}
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          社区创建后将进入待审核状态，审核通过后即可被其他用户发现和加入。
        </Alert>

        {/* 错误提示 */}
        {!!errorMessage && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {/* 提交按钮 */}
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          color="primary"
          variant="contained"
          loading={isSubmitting}
          loadingIndicator="创建中..."
          startIcon={<Save size={20} />}
          sx={{ borderRadius: 2 }}
        >
          创建社区
        </LoadingButton>
      </Stack>
    </Form>
  );
}
