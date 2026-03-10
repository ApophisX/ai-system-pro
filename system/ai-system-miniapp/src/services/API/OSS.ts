// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 获取 OSS 临时上传凭证 GET /api/v1/oss/credentials */
export async function OssControllerGetUploadCredentialsV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.OssControllerGetUploadCredentialsV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputOssCredentialsDto>('/api/v1/oss/credentials', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
