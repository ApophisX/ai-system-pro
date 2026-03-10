// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 分页查询资产分类 分页获取资产分类列表，支持关键字搜索和状态过滤 GET /api/v1/admin/asset-category */
export async function AdminAssetCategoryControllerGetListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminAssetCategoryControllerGetListV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputAssetCategoryDtoArray>('/api/v1/admin/asset-category', {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',

      ...params,
    },
    ...(options || {}),
  });
}

/** 创建资产分类 创建新的资产分类，支持设置父分类形成树形结构 POST /api/v1/admin/asset-category */
export async function AdminAssetCategoryControllerCreateV1(
  body: MyApi.CreateAssetCategoryDto,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputAssetCategoryDetailDto>('/api/v1/admin/asset-category', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取分类详情 根据 ID 获取分类详情，包含父分类和子分类信息 GET /api/v1/admin/asset-category/${param0} */
export async function AdminAssetCategoryControllerGetByIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminAssetCategoryControllerGetByIdV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputAssetCategoryDetailDto>(`/api/v1/admin/asset-category/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新资产分类 更新资产分类信息，支持修改父分类 PUT /api/v1/admin/asset-category/${param0} */
export async function AdminAssetCategoryControllerUpdateV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminAssetCategoryControllerUpdateV1Params,
  body: MyApi.UpdateAssetCategoryDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputAssetCategoryDetailDto>(`/api/v1/admin/asset-category/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除资产分类 软删除资产分类，有子分类或关联资产时无法删除 DELETE /api/v1/admin/asset-category/${param0} */
export async function AdminAssetCategoryControllerDeleteV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminAssetCategoryControllerDeleteV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/v1/admin/asset-category/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取子分类列表 获取指定分类下的直接子分类 GET /api/v1/admin/asset-category/${param0}/children */
export async function AdminAssetCategoryControllerGetChildrenV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminAssetCategoryControllerGetChildrenV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputAssetCategoryDtoArray>(`/api/v1/admin/asset-category/${param0}/children`, {
    method: 'GET',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** 批量更新排序 批量更新分类的排序权重 PUT /api/v1/admin/asset-category/batch/sort-order */
export async function AdminAssetCategoryControllerUpdateSortOrderV1(body: string[], options?: { [key: string]: any }) {
  return request<any>('/api/v1/admin/asset-category/batch/sort-order', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取根分类列表 获取所有根级别的资产分类 GET /api/v1/admin/asset-category/roots */
export async function AdminAssetCategoryControllerGetRootsV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminAssetCategoryControllerGetRootsV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputAssetCategoryDtoArray>('/api/v1/admin/asset-category/roots', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取完整分类树 获取完整的资产分类树形结构 GET /api/v1/admin/asset-category/tree */
export async function AdminAssetCategoryControllerGetTreeV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminAssetCategoryControllerGetTreeV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputAssetCategoryTreeDtoArray>('/api/v1/admin/asset-category/tree', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
