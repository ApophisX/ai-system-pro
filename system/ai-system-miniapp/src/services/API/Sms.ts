// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 发送短信验证码 POST /api/v1/sms/send */
export async function SmsControllerSendCodeV1(body: MyApi.SendSmsCodeDto, options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseBoolean>('/api/v1/sms/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 验证短信验证码 POST /api/v1/sms/verify */
export async function SmsControllerVerifyCodeV1(body: MyApi.VerifySmsCodeDto, options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseBoolean>('/api/v1/sms/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
