// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 押金明细列表 查询当前承租方的押金记录明细 GET /api/v1/app/deposit/lessee */
export async function AppLesseeDepositControllerQueryDepositsV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppLesseeDepositControllerQueryDepositsV1Params,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputDepositDtoArray>(
    "/api/v1/app/deposit/lessee",
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

/** 获取押金详情 根据押金 ID 获取押金详情 GET /api/v1/app/deposit/lessee/${param0} */
export async function AppLesseeDepositControllerGetDepositByIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppLesseeDepositControllerGetDepositByIdV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputDepositDto>(
    `/api/v1/app/deposit/lessee/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 获取押金扣款记录 获取押金的所有扣款记录 GET /api/v1/app/deposit/lessee/${param0}/deductions */
export async function AppLesseeDepositControllerGetDeductionsV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppLesseeDepositControllerGetDeductionsV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputDepositDtoArray>(
    `/api/v1/app/deposit/lessee/${param0}/deductions`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 根据订单获取押金 根据订单 ID 获取押金记录 GET /api/v1/app/deposit/lessee/order/${param0} */
export async function AppLesseeDepositControllerGetDepositByOrderIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppLesseeDepositControllerGetDepositByOrderIdV1Params,
  options?: { [key: string]: any }
) {
  const { orderId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputDepositDto>(
    `/api/v1/app/deposit/lessee/order/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 当前押金数据 获取当前承租方的押金汇总：冻结押金、已扣除、累计退还、可释放金额 GET /api/v1/app/deposit/lessee/summary */
export async function AppLesseeDepositControllerGetDepositSummaryV1(options?: {
  [key: string]: any;
}) {
  return request<MyApi.ApiResponseOutputLesseeDepositSummaryDto>(
    "/api/v1/app/deposit/lessee/summary",
    {
      method: "GET",
      ...(options || {}),
    }
  );
}
