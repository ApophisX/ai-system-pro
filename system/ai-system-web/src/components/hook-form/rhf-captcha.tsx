import type { SmsScene } from 'src/constants/global-constant';

import { useFormContext } from 'react-hook-form';
import React, { useState, useCallback, memo } from 'react';
import { useCountdownSeconds } from 'minimal-shared/hooks';

import { Stack, Button } from '@mui/material';

import axiosInstance from 'src/lib/axios';

import { Image } from 'src/components/image';
import { Field } from 'src/components/hook-form';

type Props = {
  sendCodeOptions?: {
    useSendCode: boolean;
    scene: SmsScene;
    phoneOrEmail: string;
  };
  smsEndpoint: string;
  captchaEndpoint: string;
};

export type RHFCaptchaFieldRef = {
  refreshCaptcha: () => void;
};

export const RHFCaptcha = React.forwardRef<RHFCaptchaFieldRef, Props>((props: Props, ref) => {
  const { useSendCode, phoneOrEmail, scene } = props.sendCodeOptions || {};
  const { smsEndpoint, captchaEndpoint } = props;
  const countdown = useCountdownSeconds(60);

  const [refreshKey, setRefreshKey] = useState(new Date().getTime());

  const { watch } = useFormContext();

  const { captchaCode } = watch();

  const handleResendCode = useCallback(async () => {
    if (!countdown.isCounting) {
      try {
        await axiosInstance.post(
          smsEndpoint,
          { phoneNumber: phoneOrEmail, captchaCode, scene },
          {
            fetchOptions: {
              successMessage: '发送成功',
            },
          }
        );
        countdown.reset();
        countdown.start();
      } catch {
        setRefreshKey(Date.now());
      }
    }
  }, [captchaCode, scene, countdown, phoneOrEmail, smsEndpoint]);

  const renderCaptchaField = () => (
    <Field.Text
      name="captchaCode"
      label="验证码"
      placeholder="请输入"
      tabIndex={1}
      slotProps={{
        input: {
          sx: {
            pr: 1,
          },
          endAdornment: (
            <Image
              onClick={() => setRefreshKey(Date.now())}
              slotProps={{
                img: {
                  crossOrigin: 'use-credentials',
                  sx: {
                    width: 200,
                    cursor: 'pointer',
                    position: 'relative',
                    top: -1,
                  },
                },
              }}
              src={`${axiosInstance.getUri() || ''}${captchaEndpoint}?timestamp=${refreshKey}`}
            />
          ),
          inputProps: {
            maxLength: 4,
          },
        },
        inputLabel: { shrink: true },
      }}
    />
  );

  React.useImperativeHandle(
    ref,
    () => ({
      refreshCaptcha: () => {
        setRefreshKey(Date.now());
      },
    }),
    []
  );

  if (!useSendCode) {
    return renderCaptchaField();
  }

  return (
    <>
      <Stack direction="row" spacing={2}>
        {renderCaptchaField()}
        <Button
          variant="contained"
          sx={{ minWidth: 120, height: 54 }}
          disabled={
            countdown.isCounting ||
            !/^1\d{10}$/.test(phoneOrEmail || '') ||
            captchaCode?.length !== 4
          }
          onClick={handleResendCode}
        >
          {countdown.isCounting ? `${countdown.value}秒后重试` : '发送验证码'}
        </Button>
      </Stack>
      <Field.Code
        name="code"
        autoFocus={false}
        slotProps={{
          helperText: {
            sx: {
              mr: 0,
            },
          },
        }}
      />
    </>
  );
});
