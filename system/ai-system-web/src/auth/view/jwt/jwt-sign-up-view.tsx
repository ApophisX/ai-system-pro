import type { RHFCaptchaFieldRef } from 'src/components/hook-form/rhf-captcha';

import * as z from 'zod';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { endpoints } from 'src/lib/axios';
import { SmsScene } from 'src/constants/global-constant';

import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { signUp } from '../../context/jwt';
import { useAuthContext } from '../../hooks';
import { getErrorMessage } from '../../utils';
import { FormHead } from '../../components/form-head';
import { SignUpTerms } from '../../components/sign-up-terms';

// ----------------------------------------------------------------------

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;

/** 注册表单校验：目前支持手机号，后续兼容邮箱（email 字段已预留） */
export const SignUpSchema = z
  .object({
    /** 手机号（当前必填） */
    phone: schemaUtils.phoneNumber({
      error: { required: '请输入手机号', invalid: '请输入有效的手机号' },
    }),
    /** TODO: 后续支持邮箱注册时启用 */
    // email: schemaUtils.email({ error: { required: '请输入邮箱', invalid: '请输入有效的邮箱地址' } }).optional(),
    password: z.string().min(1, { message: '请输入密码' }).min(6, { message: '密码至少 6 位字符' }),
    captchaCode: z.string().optional(),
    /** 短信验证码 */
    code: z.string().optional(),
    /** 同意服务条款（必选） */
    agreeTerms: z.boolean().refine((v) => v === true, { message: '请先阅读并同意服务条款和隐私政策' }),
  })
  .superRefine((data, ctx) => {
    if (!data.captchaCode || data.captchaCode.length !== 4) {
      ctx.addIssue({
        code: 'custom',
        path: ['captchaCode'],
        message: !data.captchaCode ? '请输入图形验证码' : '图形验证码为4位',
      });
    }
    if (!data.code || data.code.length !== 6) {
      ctx.addIssue({
        code: 'custom',
        path: ['code'],
        message: !data.code ? '请输入短信验证码' : '请输入6位短信验证码',
      });
    }
  });

// ----------------------------------------------------------------------

export function JwtSignUpView() {
  const router = useRouter();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('inviteCode') ?? undefined;

  const showPassword = useBoolean();
  const captchaRef = useRef<RHFCaptchaFieldRef>(null);

  const { checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: SignUpSchemaType = {
    phone: '',
    password: '',
    captchaCode: '',
    code: '',
    agreeTerms: false,
  };

  const methods = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signUp({
        phone: data.phone,
        password: data.password,
        code: data.code,
        inviteCode,
      });
      await checkUserSession?.();

      router.refresh();
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
      captchaRef.current?.refreshCaptcha();
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text
        name="phone"
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
          useSendCode: true,
          scene: SmsScene.REGISTER,
          phoneOrEmail: values.phone,
        }}
      />

      <Field.Text
        name="password"
        label="密码"
        placeholder="至少 6 位字符"
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

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="注册中..."
      >
        注册
      </Button>
    </Box>
  );

  return (
    <>
      {inviteCode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          您正在使用商户邀请码 <Chip label={inviteCode} size="small" sx={{ mx: 0.5 }} />
          注册，注册成功后将绑定邀请关系。
        </Alert>
      )}
      <FormHead
        title="免费注册"
        description={
          <>
            已有账号？
            <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2">
              去登录
            </Link>
          </>
        }
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
        <SignUpTerms name="agreeTerms" />
      </Form>
    </>
  );
}
