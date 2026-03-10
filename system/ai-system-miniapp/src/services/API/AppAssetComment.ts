// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 获取留言列表 获取资产留言列表，支持分页、筛选。可查询顶级留言或指定留言的回复 GET /api/v1/app/asset-comment */
export async function AppAssetCommentControllerGetListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetCommentControllerGetListV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputAssetCommentDtoArray>('/api/v1/app/asset-comment', {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',

      ...params,
    },
    ...(options || {}),
  });
}

/** 创建留言 对资产进行留言，支持回复其他用户的留言 POST /api/v1/app/asset-comment */
export async function AppAssetCommentControllerCreateV1(
  body: MyApi.CreateAssetCommentDto,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputAssetCommentDto>('/api/v1/app/asset-comment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取留言详情 获取指定留言的详细信息 GET /api/v1/app/asset-comment/${param0} */
export async function AppAssetCommentControllerGetByIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetCommentControllerGetByIdV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputAssetCommentDto>(`/api/v1/app/asset-comment/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新留言 更新自己的留言内容 PUT /api/v1/app/asset-comment/${param0} */
export async function AppAssetCommentControllerUpdateV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetCommentControllerUpdateV1Params,
  body: MyApi.UpdateAssetCommentDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputAssetCommentDto>(`/api/v1/app/asset-comment/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除留言 删除留言（软删除）。用户只能删除自己的留言，资产所有者可以删除自己资产下的所有留言 DELETE /api/v1/app/asset-comment/${param0} */
export async function AppAssetCommentControllerDeleteV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetCommentControllerDeleteV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/app/asset-comment/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取资产的留言数量 获取指定资产的留言总数 GET /api/v1/app/asset-comment/asset/${param0}/count */
export async function AppAssetCommentControllerGetCommentCountByAssetIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetCommentControllerGetCommentCountByAssetIdV1Params,
  options?: { [key: string]: any },
) {
  const { assetId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseNumber>(`/api/v1/app/asset-comment/asset/${param0}/count`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
