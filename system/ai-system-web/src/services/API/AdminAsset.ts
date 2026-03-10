// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 分页查询资产列表 后台分页查询所有商家的资产，按出租方、资产状态、审核状态、分类、关键字筛选 GET /api/v1/admin/assets */
export async function AdminAssetControllerGetListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminAssetControllerGetListV1Params,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputAssetAdminListItemDtoArray>(
    "/api/v1/admin/assets",
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

/** 获取资产详情 根据资产 ID 获取详情，含出租方、分类、租赁方案等 GET /api/v1/admin/assets/${param0} */
export async function AdminAssetControllerGetByIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminAssetControllerGetByIdV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputAssetAdminDetailDto>(
    `/api/v1/admin/assets/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 审核资产 对状态为【待审核】或【审核中】的资产进行审核。通过则资产可对外展示；拒绝则需填写审核意见，出租方将收到通知。 PUT /api/v1/admin/assets/${param0}/audit */
export async function AdminAssetControllerAuditV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminAssetControllerAuditV1Params,
  body: MyApi.AuditAssetDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputAssetAdminDetailDto>(
    `/api/v1/admin/assets/${param0}/audit`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    }
  );
}

/** 强制下架资产 平台强制下架资产，无论资产当前状态如何。下架后用户端不可见，出租方将收到通知。 PUT /api/v1/admin/assets/${param0}/force-offline */
export async function AdminAssetControllerForceOfflineV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminAssetControllerForceOfflineV1Params,
  body: MyApi.ForceOfflineAssetDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputAssetAdminDetailDto>(
    `/api/v1/admin/assets/${param0}/force-offline`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    }
  );
}
