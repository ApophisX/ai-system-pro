import * as z from 'zod';
import wx from 'weixin-js-sdk';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBoolean, useCountdownSeconds } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { usePlatform } from 'src/hooks/use-platform';

import API from 'src/services/API';
import { encryptPhone } from 'src/utils';
import { SentIcon } from 'src/assets/icons';
import { PASSWORD_REG, PASSWORD_HELPER_TEXT, PASSWORD_INVALID_MESSAGE } from 'src/constants/regex';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { FormHead } from '../../components/form-head';
import { FormReturnLink } from '../../components/form-return-link';
import { FormResendCode } from '../../components/form-resend-code';

// ----------------------------------------------------------------------

export type UpdatePasswordSchemaType = z.infer<typeof UpdatePasswordSchema>;

export const UpdatePasswordSchema = z
  .object({
    code: z.string().min(1, { error: '请输入验证码!' }).min(6, { error: '验证码不能少于6位!' }),
    phoneNumber: z.string().min(1, { error: '请输入手机号!' }),
    password: z
      .string()
      .min(1, { message: '请输入新密码!' })
      .min(6, { message: '密码不能少于6位!' })
      .regex(PASSWORD_REG, PASSWORD_INVALID_MESSAGE),
    confirmPassword: z.string().min(1, { message: '请输入确认密码!' }),
  })
  .refine((val) => val.password === val.confirmPassword, {
    error: '两次密码不匹配!',
    path: ['confirmPassword'],
  });

// ----------------------------------------------------------------------

export type AmplifyUpdatePasswordViewProps = {
  showReturnLink?: boolean;
};
export function AmplifyUpdatePasswordView({
  showReturnLink = true,
}: AmplifyUpdatePasswordViewProps) {
  const router = useRouter();

  const searchParams = useSearchParams();

  const { isInWeChatMiniProgram } = usePlatform();

  const phoneNumber = searchParams.get('phoneNumber');

  const showPassword = useBoolean();

  const countdown = useCountdownSeconds(5);

  const defaultValues: UpdatePasswordSchemaType = {
    code: '',
    phoneNumber: phoneNumber || '',
    password: '',
    confirmPassword: '',
  };

  const methods = useForm({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await API.Auth.AuthControllerResetPasswordV1({
        account: data.phoneNumber,
        code: data.code,
        newPassword: data.password,
      });
      if (!showReturnLink) {
        if (isInWeChatMiniProgram) {
          wx.miniProgram.reLaunch({
            url: '/pages/user/index',
          });
          return;
        }
      }
      router.replace(`${paths.auth.jwt.signIn}?phoneNumber=${data.phoneNumber}`);
    } catch (error) {
      console.error(error);
    }
  });

  const handleResendCode = useCallback(async () => {
    if (!showReturnLink) {
      router.replace(`${paths.auth.embedded.resetPassword}?phoneNumber=${phoneNumber}`);
      return;
    }
    router.replace(`${paths.auth.amplify.resetPassword}?phoneNumber=${phoneNumber}`);
  }, [phoneNumber, router, showReturnLink]);

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text
        name="phoneNumber"
        label="手机号"
        placeholder="请输入手机号"
        slotProps={{ inputLabel: { shrink: true } }}
        disabled
        sx={{ display: 'none' }}
      />

      <TextField label="手机号" value={encryptPhone(phoneNumber)} disabled />

      <Field.Code name="code" />

      <Field.Text
        name="password"
        label="新密码"
        placeholder="请输入新密码"
        helperText={PASSWORD_HELPER_TEXT}
        type={showPassword.value ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showPassword.onToggle} edge="end">
                  <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Field.Text
        name="confirmPassword"
        label="确认新密码"
        type={showPassword.value ? 'text' : 'password'}
        placeholder="请输入"
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showPassword.onToggle} edge="end">
                  <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="更新密码中..."
      >
        更新密码
      </Button>
    </Box>
  );

  return (
    <>
      <FormHead
        icon={<SentIcon />}
        title="短信验证码已发送"
        description={`已向您的手机号 ${encryptPhone(phoneNumber)} 发送了 6 位验证码，请在下方输入收到的验证码以完成验证。`}
      />

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

      <FormResendCode
        onResendCode={handleResendCode}
        value={countdown.value}
        disabled={countdown.isCounting}
      />

      {showReturnLink && (
        <FormReturnLink href={`${paths.auth.jwt.signIn}?phoneNumber=${phoneNumber}`} />
      )}
    </>
  );
}
