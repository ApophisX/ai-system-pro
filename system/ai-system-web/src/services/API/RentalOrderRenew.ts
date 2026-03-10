// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 支付续租账单 承租方支付续租生成的待支付账单 POST /api/v1/app/rental-order/${param0}/pay-renewal */
export async function RentalOrderRenewControllerPayRenewalV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.RentalOrderRenewControllerPayRenewalV1Params,
  body: MyApi.PayRenewalDto,
  options?: { [key: string]: any }
) {
  const { orderId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputPayRentalOrderResultDto>(
    `/api/v1/app/rental-order/${param0}/pay-renewal`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    }
  );
}

/** 发起续租 承租方在使用中订单发起续租申请，创建续租支付账单 POST /api/v1/app/rental-order/${param0}/renew */
export async function RentalOrderRenewControllerRenewV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.RentalOrderRenewControllerRenewV1Params,
  body: MyApi.RenewRentalOrderDto,
  options?: { [key: string]: any }
) {
  const { orderId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(
    `/api/v1/app/rental-order/${param0}/renew`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    }
  );
}

/** 续租预计算 查询续租价格与新租期结束日期 GET /api/v1/app/rental-order/${param0}/renew-preview */
export async function RentalOrderRenewControllerRenewPreviewV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.RentalOrderRenewControllerRenewPreviewV1Params,
  options?: { [key: string]: any }
) {
  const { orderId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseRenewPreviewDto>(
    `/api/v1/app/rental-order/${param0}/renew-preview`,
    {
      method: "GET",
      params: {
        ...queryParams,
      },
      ...(options || {}),
    }
  );
}
