// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 获取资产分类列表 获取资产分类列表，支持获取根分类或指定父分类下的子分类 GET /api/v1/app/asset-categories */
export async function AppAssetCategoryControllerGetCategoriesV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetCategoryControllerGetCategoriesV1Params,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseAppOutputAssetCategoryDtoArray>(
    "/api/v1/app/asset-categories",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 获取子分类列表 获取指定分类下的直接子分类 GET /api/v1/app/asset-categories/${param0}/children */
export async function AppAssetCategoryControllerGetChildCategoriesV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetCategoryControllerGetChildCategoriesV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseAppOutputAssetCategoryDtoArray>(
    `/api/v1/app/asset-categories/${param0}/children`,
    {
      method: "GET",
      params: {
        ...queryParams,
      },
      ...(options || {}),
    }
  );
}

/** 根据分类代码获取分类 通过分类代码获取分类详情信息 GET /api/v1/app/asset-categories/code/${param0} */
export async function AppAssetCategoryControllerGetCategoryByCodeV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppAssetCategoryControllerGetCategoryByCodeV1Params,
  options?: { [key: string]: any }
) {
  const { code: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseAppOutputAssetCategoryDto>(
    `/api/v1/app/asset-categories/code/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 获取完整分类树 获取完整的资产分类树形结构，用于分类导航展示 GET /api/v1/app/asset-categories/tree */
export async function AppAssetCategoryControllerGetCategoryTreeV1(options?: {
  [key: string]: any;
}) {
  return request<MyApi.ApiResponseAppOutputAssetCategoryTreeDtoArray>(
    "/api/v1/app/asset-categories/tree",
    {
      method: "GET",
      ...(options || {}),
    }
  );
}
