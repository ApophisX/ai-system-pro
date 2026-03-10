// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 社区列表（可发现+已加入） GET /api/v1/app/communities */
export async function AppCommunityControllerGetListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppCommunityControllerGetListV1Params,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputCommunityListItemDtoArray>(
    "/api/v1/app/communities",
    {
      method: "GET",
      params: {
        // pageSize has a default value: 20
        pageSize: "20",

        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 创建社区 POST /api/v1/app/communities */
export async function AppCommunityControllerCreateV1(
  body: MyApi.CreateCommunityDto,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputCommunityDto>(
    "/api/v1/app/communities",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** 社区详情 GET /api/v1/app/communities/${param0} */
export async function AppCommunityControllerGetDetailV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppCommunityControllerGetDetailV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputCommunityDto>(
    `/api/v1/app/communities/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 删除社区 DELETE /api/v1/app/communities/${param0} */
export async function AppCommunityControllerDeleteV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppCommunityControllerDeleteV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(
    `/api/v1/app/communities/${param0}`,
    {
      method: "DELETE",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 加入社区 POST /api/v1/app/communities/${param0}/join */
export async function AppCommunityControllerJoinV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppCommunityControllerJoinV1Params,
  body: MyApi.JoinCommunityDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/v1/app/communities/${param0}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 退出社区 POST /api/v1/app/communities/${param0}/leave */
export async function AppCommunityControllerLeaveV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppCommunityControllerLeaveV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/v1/app/communities/${param0}/leave`, {
    method: "POST",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 重置邀请码 POST /api/v1/app/communities/${param0}/reset-invite-code */
export async function AppCommunityControllerResetInviteCodeV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppCommunityControllerResetInviteCodeV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputCommunityDto>(
    `/api/v1/app/communities/${param0}/reset-invite-code`,
    {
      method: "POST",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 我创建的社区列表 GET /api/v1/app/communities/created */
export async function AppCommunityControllerGetMyCreatedV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppCommunityControllerGetMyCreatedV1Params,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputCommunityDtoArray>(
    "/api/v1/app/communities/created",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 我加入的社区列表 GET /api/v1/app/communities/my */
export async function AppCommunityControllerGetMyJoinedV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppCommunityControllerGetMyJoinedV1Params,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputCommunityListItemDtoArray>(
    "/api/v1/app/communities/my",
    {
      method: "GET",
      params: {
        // pageSize has a default value: 10
        pageSize: "10",

        ...params,
      },
      ...(options || {}),
    }
  );
}
