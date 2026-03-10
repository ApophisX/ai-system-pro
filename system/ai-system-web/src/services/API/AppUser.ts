// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 获取当前用户信息 GET /api/v1/app-user/me */
export async function AppUserControllerGetCurrentUserV1(options?: {
  [key: string]: any;
}) {
  return request<MyApi.ApiResponseOutputUserDto>("/api/v1/app-user/me", {
    method: "GET",
    ...(options || {}),
  });
}

/** 更新用户资料 PUT /api/v1/app-user/profile */
export async function AppUserControllerUpdateProfileV1(
  body: MyApi.UpdateUserProfileInfoDto,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputUserDto>("/api/v1/app-user/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
