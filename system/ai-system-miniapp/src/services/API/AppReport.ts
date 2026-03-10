// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 查询我的举报记录 分页查询当前用户的举报列表，支持按状态、原因、资产筛选 GET /api/v1/app/report/specification */
export async function AppReportControllerGetMyListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppReportControllerGetMyListV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputReportDtoArray>('/api/v1/app/report/specification', {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',

      ...params,
    },
    ...(options || {}),
  });
}

/** 提交举报 用户对资产规格信息（价格、图片、描述等）进行举报 POST /api/v1/app/report/specification */
export async function AppReportControllerCreateV1(body: MyApi.CreateReportDto, options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseOutputReportDto>('/api/v1/app/report/specification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
