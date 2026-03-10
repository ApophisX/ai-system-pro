import type { UserType } from 'src/auth/types';

import * as z from 'zod';
import { isFile } from 'es-toolkit';
import { useForm } from 'react-hook-form';
import React, { useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { Stack, Paper, Button } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import API from 'src/services/API';
import { navigateBack } from 'src/lib/bridge';
import { ossUploader } from 'src/lib/oss-uploader';

import { Field } from 'src/components/hook-form';
import { MobileLayout } from 'src/components/custom/layout';
import { Form } from 'src/components/hook-form/form-provider';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

type Gender = UserType['profile']['gender'];

const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '其他', value: 'unknown' },
];

const ProfileEditSchema = z.object({
  nickname: z
    .string()
    .min(1, { message: '昵称不能为空' })
    .max(20, { message: '昵称不能超过20个字符' }),
  gender: z.enum(
    GENDER_OPTIONS.map((option) => option.value),
    {
      message: '请选择性别',
    }
  ),
  bio: z.string().max(200, { message: '简介不能超过200个字符' }).optional(),
  avatar: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
});

type ProfileEditSchemaType = z.infer<typeof ProfileEditSchema>;

export function ProfileEditView(props: { user: UserType }) {
  const { user } = props;
  const router = useRouter();

  const { checkUserSession } = useAuthContext();

  const methods = useForm<ProfileEditSchemaType>({
    resolver: zodResolver(ProfileEditSchema),
    values: {
      nickname: user?.username || user?.profile?.nickname || '',
      gender: user?.profile?.gender || 'unknown',
      bio: user?.profile?.bio || '',
      avatar: user.avatar || user?.profile.avatar || '',
    },
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  // 删除头像
  const handleRemoveAvatar = useCallback(() => {
    setValue('avatar', null, { shouldValidate: true });
  }, [setValue]);

  const onSubmit = handleSubmit(async (data) => {
    let avatar: string | undefined;
    // 上传头像
    if (isFile(data.avatar)) {
      const result = await ossUploader.uploadFile(data.avatar as File, {
        uploadPath: '/xuwu/avatar',
      });
      avatar = result.path;
    }
    await API.AppUser.AppUserControllerUpdateProfileV1({
      avatar,
      nickname: data.nickname,
      gender: data.gender,
      bio: data.bio,
    });
    await checkUserSession?.();
    // navigateBack('');
  });

  return (
    <MobileLayout appTitle="编辑资料" containerProps={{ maxWidth: 'sm', sx: { py: 3 } }}>
      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          {/* 头像上传 */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Field.UploadAvatar
              name="avatar"
              placeholder="请上传头像"
              onRemove={handleRemoveAvatar}
              maxSize={5 * 1024 * 1024}
              maxFiles={1}
              multiple={false}
            />
          </Paper>

          {/* 表单字段 */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Stack spacing={3}>
              {/* 昵称 */}
              <Field.Text
                name="nickname"
                label="昵称"
                placeholder="请输入昵称"
                slotProps={{ inputLabel: { shrink: true } }}
              />

              {/* 性别 */}
              <Field.RadioGroup
                name="gender"
                row
                label="性别"
                options={GENDER_OPTIONS}
                slotProps={{
                  wrapper: {
                    sx: {
                      flexDirection: 'row',
                      gap: 3,
                      '& .MuiFormLabel-root': {
                        mb: 0,
                        mr: 2,
                      },
                    },
                  },
                }}
              />

              {/* 简介 */}
              <Field.Text
                name="bio"
                label="简介"
                placeholder="介绍一下自己吧（选填）"
                multiline
                rows={4}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
          </Paper>

          {/* 提交按钮 */}
          <Button
            fullWidth
            size="large"
            type="submit"
            color="primary"
            variant="contained"
            loading={isSubmitting}
            loadingIndicator="保存中..."
          >
            保存
          </Button>
        </Stack>
      </Form>
    </MobileLayout>
  );
}
