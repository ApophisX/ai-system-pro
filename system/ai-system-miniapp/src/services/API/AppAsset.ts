// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 获取资产列表 获取可租赁的资产列表，支持分页、搜索、筛选、排序 GET /api/v1/app/asset */
export async function AppAssetControllerGetAssetListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetControllerGetAssetListV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputAssetListItemDtoArray>('/api/v1/app/asset', {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',

      ...params,
    },
    ...(options || {}),
  });
}

/** 创建资产 创建新的资产，可选择直接发布或保存为草稿 POST /api/v1/app/asset */
export async function AppAssetControllerCreateAssetV1(body: MyApi.CreateAssetDto, options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseString>('/api/v1/app/asset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取资产详情 获取资产详情信息，包含租赁方案、分类、标签等 GET /api/v1/app/asset/${param0} */
export async function AppAssetControllerGetAssetDetailV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetControllerGetAssetDetailV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputAssetDetailDto>(`/api/v1/app/asset/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取我的资产详情 获取当前用户发布的资产详情 GET /api/v1/app/asset/my/${param0} */
export async function AppAssetControllerGetMyAssetDetailV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetControllerGetMyAssetDetailV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputAssetDetailDto>(`/api/v1/app/asset/my/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新资产 更新资产信息 PUT /api/v1/app/asset/my/${param0} */
export async function AppAssetControllerUpdateAssetV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetControllerUpdateAssetV1Params,
  body: MyApi.UpdateAssetDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputAssetDetailDto>(`/api/v1/app/asset/my/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除资产 删除资产 DELETE /api/v1/app/asset/my/${param0} */
export async function AppAssetControllerDeleteAssetV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetControllerDeleteAssetV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/app/asset/my/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 下架资产 将资产状态改为下架 POST /api/v1/app/asset/my/${param0}/offline */
export async function AppAssetControllerOfflineAssetV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetControllerOfflineAssetV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputAssetListItemDto>(`/api/v1/app/asset/my/${param0}/offline`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 上架资产 将资产状态改为可租赁 POST /api/v1/app/asset/my/${param0}/publish */
export async function AppAssetControllerPublishAssetV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetControllerPublishAssetV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputAssetListItemDto>(`/api/v1/app/asset/my/${param0}/publish`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取资产创建统计信息 获取当前用户的资产创建数量统计，用于判断是否可以继续创建资产 GET /api/v1/app/asset/my/creation-stats */
export async function AppAssetControllerGetCreationStatsV1(options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseOutputAssetCreationStatsDto>('/api/v1/app/asset/my/creation-stats', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取我的资产列表 获取当前用户发布的资产列表 GET /api/v1/app/asset/my/list */
export async function AppAssetControllerGetMyAssetsV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetControllerGetMyAssetsV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputMyAssetListItemDtoArray>('/api/v1/app/asset/my/list', {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',

      // auditStatus has a default value: pending
      auditStatus: 'pending',

      ...params,
    },
    ...(options || {}),
  });
}
