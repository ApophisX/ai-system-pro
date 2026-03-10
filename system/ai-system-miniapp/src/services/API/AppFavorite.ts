// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 获取收藏列表 获取当前用户的收藏列表，支持分页、搜索 GET /api/v1/app/favorite */
export async function AppFavoriteControllerGetListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppFavoriteControllerGetListV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputFavoriteDtoArray>('/api/v1/app/favorite', {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',

      ...params,
    },
    ...(options || {}),
  });
}

/** 创建收藏 收藏指定的资产 POST /api/v1/app/favorite */
export async function AppFavoriteControllerCreateV1(body: MyApi.CreateFavoriteDto, options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseOutputFavoriteDto>('/api/v1/app/favorite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 取消收藏 取消收藏指定的资产 DELETE /api/v1/app/favorite/${param0} */
export async function AppFavoriteControllerRemoveV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppFavoriteControllerRemoveV1Params,
  options?: { [key: string]: any },
) {
  const { assetId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/app/favorite/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 检查是否已收藏 检查当前用户是否已收藏指定资产 GET /api/v1/app/favorite/check/${param0} */
export async function AppFavoriteControllerCheckFavoriteV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppFavoriteControllerCheckFavoriteV1Params,
  options?: { [key: string]: any },
) {
  const { assetId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/app/favorite/check/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取收藏数量 获取当前用户的收藏总数 GET /api/v1/app/favorite/count */
export async function AppFavoriteControllerGetCountV1(options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseNumber>('/api/v1/app/favorite/count', {
    method: 'GET',
    ...(options || {}),
  });
}
