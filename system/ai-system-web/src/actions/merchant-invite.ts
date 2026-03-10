import type {} from 'src/sections/my/merchant-invite/types';

import { useQuery } from '@tanstack/react-query';

import API from 'src/services/API';

// ----------------------------------------------------------------------

/** 获取我的邀请码与统计 */
export function useGetMyInviteCode() {
  return useQuery({
    queryKey: ['merchant-invite-code'],
    queryFn: () => API.AppMerchantInvite.AppMerchantInviteControllerGetMyInviteCodeV1(),
    select: (res) => res.data?.data,
  });
}

/** 获取我的邀请列表（分页） */
export function useGetMyInvitations(page: number, pageSize: number = 20) {
  return useQuery({
    queryKey: ['merchant-invitations', page, pageSize],
    queryFn: () =>
      API.AppMerchantInvite.AppMerchantInviteControllerGetMyInvitationsV1({ page, pageSize }),
    select: (res) => ({
      data: res.data?.data ?? [],
      meta: res.data?.meta,
    }),
  });
}

/** 获取我的奖励列表（分页） */
export function useGetMyRewards(params: MyApi.AppMerchantInviteControllerGetMyRewardsV1Params) {
  const { page = 1, pageSize = 20, type, status } = params;
  return useQuery({
    queryKey: ['merchant-invite-rewards', page, pageSize, type, status],
    queryFn: () =>
      API.AppMerchantInvite.AppMerchantInviteControllerGetMyRewardsV1({
        page,
        pageSize,
        type,
        status,
      }),
    select: (res) => ({
      data: res.data?.data ?? [],
      meta: res.data?.meta,
    }),
  });
}

/** 获取拓展排行榜 */
export function useGetMerchantInviteRank(params: MyApi.AppMerchantInviteControllerGetRankV1Params) {
  const { period = 'monthly', year, month, limit = 20 } = params;
  return useQuery({
    queryKey: ['merchant-invite-rank', period, year, month, limit],
    queryFn: () =>
      API.AppMerchantInvite.AppMerchantInviteControllerGetRankV1({
        period,
        year,
        month,
        limit,
      }),
    select: (res) => res.data?.data ?? [],
  });
}
