// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 查询押金列表 查询当前用户的押金记录 GET /api/v1/app/deposit/lessor */
export async function AppLessorDepositControllerQueryDepositsV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppLessorDepositControllerQueryDepositsV1Params,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputDepositDtoArray>(
    "/api/v1/app/deposit/lessor",
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

/** 获取押金详情 根据押金 ID 获取押金详情 GET /api/v1/app/deposit/lessor/${param0} */
export async function AppLessorDepositControllerGetDepositByIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppLessorDepositControllerGetDepositByIdV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputDepositDto>(
    `/api/v1/app/deposit/lessor/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 获取押金扣款记录 获取押金的所有扣款记录 GET /api/v1/app/deposit/lessor/${param0}/deductions */
export async function AppLessorDepositControllerGetDeductionsV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppLessorDepositControllerGetDeductionsV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputDepositDtoArray>(
    `/api/v1/app/deposit/lessor/${param0}/deductions`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 根据订单获取押金 根据订单 ID 获取押金记录 GET /api/v1/app/deposit/lessor/order/${param0} */
export async function AppLessorDepositControllerGetDepositByOrderIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppLessorDepositControllerGetDepositByOrderIdV1Params,
  options?: { [key: string]: any }
) {
  const { orderId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputDepositDto>(
    `/api/v1/app/deposit/lessor/order/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}
