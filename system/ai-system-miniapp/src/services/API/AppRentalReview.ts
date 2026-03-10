// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 查询资产评价列表 获取指定资产的已通过审核的评价列表，支持分页、评分筛选 GET /api/v1/app/rental-review */
export async function AppRentalReviewControllerGetListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalReviewControllerGetListV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputRentalReviewDtoArray>('/api/v1/app/rental-review', {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',

      ...params,
    },
    ...(options || {}),
  });
}

/** 提交评价 承租方对已完成的租赁订单提交评价，一单一评，需审核通过后展示 POST /api/v1/app/rental-review */
export async function AppRentalReviewControllerCreateV1(
  body: MyApi.CreateRentalReviewDto,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputRentalReviewDto>('/api/v1/app/rental-review', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 回复评价 出租方对已通过审核的评价进行回复，仅允许回复一次 PUT /api/v1/app/rental-review/${param0}/reply */
export async function AppRentalReviewControllerReplyV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalReviewControllerReplyV1Params,
  body: MyApi.ReplyRentalReviewDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/app/rental-review/${param0}/reply`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 获取资产评价汇总 获取指定资产的评价数量、平均分、星级分布 GET /api/v1/app/rental-review/asset/${param0}/summary */
export async function AppRentalReviewControllerGetSummaryV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalReviewControllerGetSummaryV1Params,
  options?: { [key: string]: any },
) {
  const { assetId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalReviewSummaryDto>(`/api/v1/app/rental-review/asset/${param0}/summary`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
