// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 微信小程序手机号登录登录 POST /api/v1/weapp/auth/sign-in */
export async function WeappAuthControllerSignInV1(
  body: MyApi.WechatMiniProgramSignInDto,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputAuthDto>("/api/v1/weapp/auth/sign-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 微信小程序登录 - 通过 code 获取 access_token POST /api/v1/weapp/auth/signInByCode */
export async function WeappAuthControllerSignInByCodeV1(
  body: MyApi.WechatMiniProgramSignInByCodeDto,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputAuthDto>(
    "/api/v1/weapp/auth/signInByCode",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}
