// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 提现订单列表 分页查询商家的提现订单 GET /api/v1/app/withdraw */
export async function AppWithdrawControllerListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppWithdrawControllerListV1Params,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputWithdrawOrderDtoArray>(
    "/api/v1/app/withdraw",
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

/** 申请提现 商家申请提现，支持微信/支付宝（银行卡预留）。需实名认证，校验余额、风控限制 POST /api/v1/app/withdraw */
export async function AppWithdrawControllerApplyV1(
  body: MyApi.CreateWithdrawDto,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputWithdrawOrderDto>(
    "/api/v1/app/withdraw",
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

/** 提现单详情 GET /api/v1/app/withdraw/${param0} */
export async function AppWithdrawControllerGetByIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppWithdrawControllerGetByIdV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputWithdrawOrderDto>(
    `/api/v1/app/withdraw/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 取消提现 商户在待审核/审核中时主动取消 POST /api/v1/app/withdraw/${param0}/cancel */
export async function AppWithdrawControllerCancelV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppWithdrawControllerCancelV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputWithdrawOrderDto>(
    `/api/v1/app/withdraw/${param0}/cancel`,
    {
      method: "POST",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 获取商家账户余额 获取可提现余额、冻结余额、总余额（同步 LessorFinance 后） GET /api/v1/app/withdraw/account */
export async function AppWithdrawControllerGetAccountV1(options?: {
  [key: string]: any;
}) {
  return request<MyApi.ApiResponseOutputMerchantAccountDto>(
    "/api/v1/app/withdraw/account",
    {
      method: "GET",
      ...(options || {}),
    }
  );
}
