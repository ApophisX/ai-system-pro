// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 社区内资产列表（需已加入） GET /api/v1/app/communities/${param0}/assets */
export async function AppCommunityAssetControllerGetCommunityAssetsV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppCommunityAssetControllerGetCommunityAssetsV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputAssetListItemDtoArray>(
    `/api/v1/app/communities/${param0}/assets`,
    {
      method: "GET",
      params: {
        // pageSize has a default value: 10
        pageSize: "10",

        ...queryParams,
      },
      ...(options || {}),
    }
  );
}

/** 绑定资产到社区 POST /api/v1/app/communities/${param0}/assets */
export async function AppCommunityAssetControllerBindAssetV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppCommunityAssetControllerBindAssetV1Params,
  body: MyApi.BindAssetDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/v1/app/communities/${param0}/assets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 解绑资产 DELETE /api/v1/app/communities/${param0}/assets/${param1} */
export async function AppCommunityAssetControllerUnbindAssetV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppCommunityAssetControllerUnbindAssetV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, assetId: param1, ...queryParams } = params;
  return request<any>(`/api/v1/app/communities/${param0}/assets/${param1}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}
