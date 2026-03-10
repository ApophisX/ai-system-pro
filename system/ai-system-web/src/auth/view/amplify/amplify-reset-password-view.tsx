import type { RHFCaptchaFieldRef } from 'src/components/hook-form/rhf-captcha';

import * as z from 'zod';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { endpoints } from 'src/lib/axios';
import { CONFIG } from 'src/global-config';
import { PasswordIcon } from 'src/assets/icons';
import { SmsScene } from 'src/constants/global-constant';

import { Form, Field } from 'src/components/hook-form';

import { sendCode } from 'src/auth/context/jwt';

import { FormHead } from '../../components/form-head';
import { FormReturnLink } from '../../components/form-return-link';

// ----------------------------------------------------------------------

export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;

export const ResetPasswordSchema = z.object({
  phoneNumber: z
    .string()
    .nonempty('请输入手机号')
    .regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
  captchaCode: z
    .string()
    .min(1, { message: '请输入验证码!' })
    .min(4, { message: '验证码格式不正确!' }),
});

// ----------------------------------------------------------------------

type AmplifyResetPasswordViewProps = {
  showReturnLink?: boolean;
};
export function AmplifyResetPasswordView({ showReturnLink = true }: AmplifyResetPasswordViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get('phoneNumber');
  const defaultValues: ResetPasswordSchemaType = {
    phoneNumber: phoneNumber ?? '',
    captchaCode: '',
  };
  const captchaRef = useRef<RHFCaptchaFieldRef>(null);

  const methods = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const createRedirectPath = (query: string) => {
    const queryString = new URLSearchParams({ phoneNumber: query }).toString();
    if (!showReturnLink) {
      return `${paths.auth.embedded.updatePassword}?${queryString}`;
    }
    return `${paths.auth.amplify.updatePassword}?${queryString}`;
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await sendCode({
        phoneNumber: data.phoneNumber,
        scene: SmsScene.RESET_PASSWORD,
        captchaCode: data.captchaCode,
      });
      const redirectPath = createRedirectPath(data.phoneNumber);
      router.push(redirectPath);
    } catch (error) {
      captchaRef.current?.refreshCaptcha();
      console.error(error);
    }
  });

  const { watch } = methods;
  const values = watch();

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text
        autoFocus
        name="phoneNumber"
        label="手机号"
        placeholder="请输入手机号"
        slotProps={{
          input: {
            inputProps: {
              maxLength: 11,
            },
          },
          inputLabel: { shrink: true },
        }}
      />

      <Field.Captcha
        ref={captchaRef}
        smsEndpoint={endpoints.sms.send}
        captchaEndpoint={endpoints.captcha.svg}
        sendCodeOptions={{
          useSendCode: false,
          scene: SmsScene.RESET_PASSWORD,
          phoneOrEmail: values.phoneNumber,
        }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="发送中..."
      >
        发送验证码
      </Button>
    </Box>
  );

  return (
    <>
      <FormHead
        icon={<PasswordIcon />}
        title="忘记密码?"
        description="请输入您的手机号,我们将向您发送一条包含验证码的短信。"
      />

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

      {showReturnLink && <FormReturnLink href={paths.auth.jwt.signIn} />}
    </>
  );
}
