// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 拓展排行榜（管理端） GET /api/v1/admin/merchant-invite/rank */
export async function AdminMerchantInviteControllerGetRankV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminMerchantInviteControllerGetRankV1Params,
  options?: { [key: string]: any },
) {
  return request<any>('/api/v1/admin/merchant-invite/rank', {
    method: 'GET',
    params: {
      // period has a default value: monthly
      period: 'monthly',

      // limit has a default value: 20
      limit: '20',
      ...params,
    },
    ...(options || {}),
  });
}
