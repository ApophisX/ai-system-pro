// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 审核提现 审核通过或拒绝，通过时扣减 available、增加 frozen，拒绝时无余额变动 POST /api/v1/admin/withdraw/${param0}/review */
export async function AdminWithdrawControllerReviewV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminWithdrawControllerReviewV1Params,
  body: MyApi.ReviewWithdrawDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputWithdrawOrderDto>(
    `/api/v1/admin/withdraw/${param0}/review`,
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
