// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 获取我的邀请码与统计 GET /api/v1/app/merchant-invite/my/code */
export async function AppMerchantInviteControllerGetMyInviteCodeV1(options?: {
  [key: string]: any;
}) {
  return request<MyApi.ApiResponseOutputMyInviteCodeDto>(
    "/api/v1/app/merchant-invite/my/code",
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

/** 我的邀请列表 GET /api/v1/app/merchant-invite/my/invitations */
export async function AppMerchantInviteControllerGetMyInvitationsV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppMerchantInviteControllerGetMyInvitationsV1Params,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputMerchantInviteRelationDtoArray>(
    "/api/v1/app/merchant-invite/my/invitations",
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

/** 我的奖励列表 GET /api/v1/app/merchant-invite/my/rewards */
export async function AppMerchantInviteControllerGetMyRewardsV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppMerchantInviteControllerGetMyRewardsV1Params,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputMerchantInviteRewardDtoArray>(
    "/api/v1/app/merchant-invite/my/rewards",
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

/** 拓展排行榜 GET /api/v1/app/merchant-invite/rank */
export async function AppMerchantInviteControllerGetRankV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppMerchantInviteControllerGetRankV1Params,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputInviteRankItemDtoArray>(
    "/api/v1/app/merchant-invite/rank",
    {
      method: "GET",
      params: {
        // period has a default value: monthly
        period: "monthly",

        // limit has a default value: 20
        limit: "20",
        ...params,
      },
      ...(options || {}),
    }
  );
}
