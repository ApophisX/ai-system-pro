// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 查询举报列表 分页查询举报列表，支持按状态、原因、举报人、资产、时间筛选 GET /api/v1/admin/report/specification */
export async function AdminReportControllerGetListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminReportControllerGetListV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputReportDtoArray>('/api/v1/admin/report/specification', {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',

      ...params,
    },
    ...(options || {}),
  });
}

/** 获取举报详情 根据 ID 获取举报详情 GET /api/v1/admin/report/specification/${param0} */
export async function AdminReportControllerGetByIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminReportControllerGetByIdV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputReportDto>(`/api/v1/admin/report/specification/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 处理举报 审核举报：通过(approve)、驳回(reject)、标记恶意举报(mark_malicious) PUT /api/v1/admin/report/specification/${param0}/handle */
export async function AdminReportControllerHandleV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminReportControllerHandleV1Params,
  body: MyApi.HandleReportDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/admin/report/specification/${param0}/handle`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
