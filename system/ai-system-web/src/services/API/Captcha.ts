// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 生成图形验证码 GET /api/v1/captcha */
export async function CaptchaControllerGenerateV1(options?: {
  [key: string]: any;
}) {
  return request<MyApi.ApiResponseOutputCaptchaDto>("/api/v1/captcha", {
    method: "GET",
    ...(options || {}),
  });
}

/** 获取图形验证码 SVG GET /api/v1/captcha/svg */
export async function CaptchaControllerGetSvgV1(options?: {
  [key: string]: any;
}) {
  return request<any>("/api/v1/captcha/svg", {
    method: "GET",
    ...(options || {}),
  });
}
