// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 社区审核列表 GET /api/v1/admin/communities */
export async function AdminCommunityControllerGetListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminCommunityControllerGetListV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputCommunityDtoArray>('/api/v1/admin/communities', {
    method: 'GET',
    params: {
      // pageSize has a default value: 20
      pageSize: '20',

      ...params,
    },
    ...(options || {}),
  });
}

/** 社区详情（管理端） GET /api/v1/admin/communities/${param0} */
export async function AdminCommunityControllerGetDetailV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminCommunityControllerGetDetailV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputCommunityDto>(`/api/v1/admin/communities/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 审核通过 POST /api/v1/admin/communities/${param0}/approve */
export async function AdminCommunityControllerApproveV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminCommunityControllerApproveV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/v1/admin/communities/${param0}/approve`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 强制关闭社区 POST /api/v1/admin/communities/${param0}/force-close */
export async function AdminCommunityControllerForceCloseV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminCommunityControllerForceCloseV1Params,
  body: MyApi.ForceCloseCommunityDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/v1/admin/communities/${param0}/force-close`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 审核拒绝 POST /api/v1/admin/communities/${param0}/reject */
export async function AdminCommunityControllerRejectV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminCommunityControllerRejectV1Params,
  body: MyApi.RejectCommunityDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/v1/admin/communities/${param0}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
