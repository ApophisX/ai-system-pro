// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 查询出租方收支明细 查询出租方收支明细，支持分页与按方向/状态/业务类型/时间范围筛选。时间筛选按业务发生时间（businessOccurredAt）过滤。 GET /api/v1/app/finance/lessor */
export async function AppLessorFinanceControllerFindPageListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppLessorFinanceControllerFindPageListV1Params,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputFinanceDtoArray>(
    "/api/v1/app/finance/lessor",
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
