// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 分页查询评价列表 后台分页查询租赁评价，支持按状态（待审核/已通过/已拒绝/已隐藏）、资产、出租方、评分筛选，关键字搜索评论内容 GET /api/v1/admin/rental-review */
export async function AdminRentalReviewControllerGetListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminRentalReviewControllerGetListV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputRentalReviewAdminDtoArray>('/api/v1/admin/rental-review', {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',

      ...params,
    },
    ...(options || {}),
  });
}

/** 审核通过 审核通过评价，更新资产统计并公开展示 PUT /api/v1/admin/rental-review/${param0}/approve */
export async function AdminRentalReviewControllerApproveV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminRentalReviewControllerApproveV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/admin/rental-review/${param0}/approve`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 隐藏评价 隐藏已通过的评价，回滚资产统计 PUT /api/v1/admin/rental-review/${param0}/hide */
export async function AdminRentalReviewControllerHideV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminRentalReviewControllerHideV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/admin/rental-review/${param0}/hide`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 审核拒绝 审核拒绝评价，不展示 PUT /api/v1/admin/rental-review/${param0}/reject */
export async function AdminRentalReviewControllerRejectV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminRentalReviewControllerRejectV1Params,
  body: MyApi.RejectRentalReviewDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/admin/rental-review/${param0}/reject`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
