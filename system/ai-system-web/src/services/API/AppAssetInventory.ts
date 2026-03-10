// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 获取资产实例列表 获取资产实例列表，支持按资产ID、状态、关键字筛选 GET /api/v1/app/asset-inventory */
export async function AppAssetInventoryControllerGetListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetInventoryControllerGetListV1Params,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputAssetInventoryDtoArray>(
    "/api/v1/app/asset-inventory",
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

/** 创建资产实例 为指定资产创建可租赁的实例。支持批量创建（quantity 或 isBatchCreate），批量时实例编号为前缀+序列号、名称为名称前缀+序号；用户累计不能创建超过 1000 个实例 POST /api/v1/app/asset-inventory */
export async function AppAssetInventoryControllerCreateV1(
  body: MyApi.CreateAssetInventoryDto,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseBoolean[]>("/api/v1/app/asset-inventory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取资产实例详情 获取资产实例的详细信息 GET /api/v1/app/asset-inventory/${param0} */
export async function AppAssetInventoryControllerGetByIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetInventoryControllerGetByIdV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputAssetInventoryDto>(
    `/api/v1/app/asset-inventory/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 更新资产实例 更新资产实例信息，如数量、状态、位置等 PUT /api/v1/app/asset-inventory/${param0} */
export async function AppAssetInventoryControllerUpdateV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetInventoryControllerUpdateV1Params,
  body: MyApi.UpdateAssetInventoryDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputAssetInventoryDto>(
    `/api/v1/app/asset-inventory/${param0}`,
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

/** 删除资产实例 删除资产实例（软删除），如果存在进行中的租赁则无法删除 DELETE /api/v1/app/asset-inventory/${param0} */
export async function AppAssetInventoryControllerDeleteV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetInventoryControllerDeleteV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(
    `/api/v1/app/asset-inventory/${param0}`,
    {
      method: "DELETE",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 强制解绑资产实例 强制解绑资产实例，如果存在进行中的租赁则无法解绑 PUT /api/v1/app/asset-inventory/${param0}/force-unbind */
export async function AppAssetInventoryControllerForceUnbindV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetInventoryControllerForceUnbindV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(
    `/api/v1/app/asset-inventory/${param0}/force-unbind`,
    {
      method: "PUT",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 根据资产 ID 获取所有实例 获取指定资产的所有实例列表 GET /api/v1/app/asset-inventory/asset/${param0} */
export async function AppAssetInventoryControllerGetByAssetIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetInventoryControllerGetByAssetIdV1Params,
  options?: { [key: string]: any }
) {
  const { assetId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputAssetInventoryDtoArray>(
    `/api/v1/app/asset-inventory/asset/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 根据资产 ID 和实例编号获取实例 承租方展示用，根据资产 ID 和实例编号获取实例详情（图片、名称、状态等） GET /api/v1/app/asset-inventory/inventory-code/${param0} */
export async function AppAssetInventoryControllerGetByInstanceCodeV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetInventoryControllerGetByInstanceCodeV1Params,
  options?: { [key: string]: any }
) {
  const { inventoryCode: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseSimpleOutputAssetInventoryDto>(
    `/api/v1/app/asset-inventory/inventory-code/${param0}`,
    {
      method: "GET",
      params: {
        ...queryParams,
      },
      ...(options || {}),
    }
  );
}
