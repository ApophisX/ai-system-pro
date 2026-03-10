import type { SignInSchemaType } from 'src/auth/schema/sign-in-schema';
import type { RHFCaptchaFieldRef } from 'src/components/hook-form/rhf-captcha';

import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Tab, Tabs } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { endpoints } from 'src/lib/axios';
import { CONFIG } from 'src/global-config';
import { SmsScene, AuthLoginType } from 'src/constants/global-constant';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { SignInSchema } from 'src/auth/schema/sign-in-schema';

import { signIn } from '../../context/jwt';
import { useAuthContext } from '../../hooks';
import { getErrorMessage } from '../../utils';
import { FormHead } from '../../components/form-head';

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get('phoneNumber');
  const showPassword = useBoolean();

  const captchaRef = useRef<RHFCaptchaFieldRef>(null);

  const { checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: SignInSchemaType = {
    phoneOrEmail: phoneNumber ? phoneNumber : CONFIG.isDev ? '17372631107' : '',
    captchaCode: '',
    password: CONFIG.isDev ? '123123aa' : '',
    type: AuthLoginType.PASSWORD,
    code: '',
  };
  const [loginType, setLoginType] = useState(1);

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signIn(data);
      await checkUserSession?.();
      router.refresh();
    } catch (error) {
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
      captchaRef.current?.refreshCaptcha();
    }
  });

  useEffect(() => {
    window.history.replaceState(null, '', `${paths.auth.jwt.signIn}`);
  }, [phoneNumber]);

  const values = watch();

  const renderForm = () => (
    <>
      <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
        <Field.Text
          name="phoneOrEmail"
          label="手机号"
          placeholder="请输入"
          slotProps={{
            input: {
              inputProps: {
                maxLength: 11,
              },
            },
            inputLabel: { shrink: true },
          }}
        />

        {loginType === 1 && (
          <Field.Text
            name="password"
            label="密码"
            placeholder="请输入"
            type={showPassword.value ? 'text' : 'password'}
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                inputProps: {
                  maxLength: 50,
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={showPassword.onToggle} edge="end" tabIndex={-1}>
                      <Iconify
                        icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        )}

        <Field.Captcha
          smsEndpoint={endpoints.sms.send}
          captchaEndpoint={endpoints.captcha.svg}
          ref={captchaRef}
          sendCodeOptions={{
            useSendCode: loginType === AuthLoginType.SMS,
            scene: SmsScene.LOGIN,
            phoneOrEmail: values.phoneOrEmail,
          }}
        />
      </Box>
      <Stack spacing={3} sx={{ mt: 2 }}>
        <Link
          component={RouterLink}
          href={`${paths.auth.amplify.resetPassword}?phoneNumber=${defaultValues.phoneOrEmail}`}
          variant="body2"
          color="inherit"
          sx={{ alignSelf: 'flex-end', visibility: loginType === 1 ? 'visible' : 'hidden' }}
          tabIndex={-1}
        >
          忘记密码?
        </Link>

        <Button
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          loadingIndicator="正在登录中..."
        >
          登录
        </Button>
      </Stack>
    </>
  );

  return (
    <>
      <FormHead title="登录您的账号" sx={{ textAlign: { xs: 'center', md: 'center' } }} />

      <Box>
        <Tabs
          variant="standard"
          value={loginType}
          centered
          onChange={(_, newValue) => {
            setValue('type', newValue);
            setValue('code', '');
            setValue('password', '');
            setLoginType(newValue);
          }}
          sx={{ mb: 4 }}
        >
          <Tab label="密码登录" value={AuthLoginType.PASSWORD} />
          <Tab label="验证码登录" value={AuthLoginType.SMS} />
        </Tabs>
      </Box>

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>
    </>
  );
}
