// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 企业认证（提交后待审核） POST /api/v1/auth/enterprise-auth */
export async function AuthControllerEnterpriseAuthV1(
  body: MyApi.EnterpriseVerificationDto,
  options?: { [key: string]: any },
) {
  return request<any>('/api/v1/auth/enterprise-auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 用户登出 POST /api/v1/auth/logout */
export async function AuthControllerLogoutV1(options?: { [key: string]: any }) {
  return request<any>('/api/v1/auth/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 获取当前用户信息 GET /api/v1/auth/me */
export async function AuthControllerGetCurrentUserV1(options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseOutputUserDetailDto>('/api/v1/auth/me', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 实名认证 POST /api/v1/auth/real-name-auth */
export async function AuthControllerRealNameAuthV1(body: MyApi.RealNameAuthDto, options?: { [key: string]: any }) {
  return request<any>('/api/v1/auth/real-name-auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 刷新访问令牌 POST /api/v1/auth/refresh */
export async function AuthControllerRefreshV1(body: MyApi.RefreshTokenDto, options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseAuthTokenOutput>('/api/v1/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 短信验证码重置密码 PATCH /api/v1/auth/reset-password */
export async function AuthControllerResetPasswordV1(body: MyApi.ResetPasswordDto, options?: { [key: string]: any }) {
  return request<any>('/api/v1/auth/reset-password', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 用户登录 POST /api/v1/auth/sign-in */
export async function AuthControllerSignInV1(body: MyApi.LoginDto, options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseOutputAuthDto>('/api/v1/auth/sign-in', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 用户注册 POST /api/v1/auth/sign-up */
export async function AuthControllerSignUpV1(body: MyApi.RegisterDto, options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseOutputAuthDto>('/api/v1/auth/sign-up', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
