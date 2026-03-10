// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 分页查询押金扣款列表 后台分页查询押金扣款记录，可按状态（如待审核）、订单ID、扣款单号、押金单号筛选 GET /api/v1/admin/deposit-deductions */
export async function AdminDepositDeductionControllerGetListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminDepositDeductionControllerGetListV1Params,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputDepositDeductionDtoArray>(
    "/api/v1/admin/deposit-deductions",
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

/** 获取扣款详情 根据扣款记录 ID 获取详情，含关联押金 GET /api/v1/admin/deposit-deductions/${param0} */
export async function AdminDepositDeductionControllerGetByIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminDepositDeductionControllerGetByIdV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputDepositDeductionDto>(
    `/api/v1/admin/deposit-deductions/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 审核争议押金扣除 对状态为【待审核】的扣款进行审核。通过时可指定认定金额（不传则用原申请金额），认定金额不得超过原申请金额与押金可用余额的较小值；通过后扣款立即执行并更新押金与财务。拒绝则仅更新状态与审核说明。 PUT /api/v1/admin/deposit-deductions/${param0}/review */
export async function AdminDepositDeductionControllerReviewV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminDepositDeductionControllerReviewV1Params,
  body: MyApi.ReviewDepositDeductionDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputDepositDeductionDto>(
    `/api/v1/admin/deposit-deductions/${param0}/review`,
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
