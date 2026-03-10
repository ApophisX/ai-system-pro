import type { UserRole } from 'src/sections/my/types';

import { useQuery } from '@tanstack/react-query';

import API from 'src/services/API';

// ----------------------------------------------------------------------

/**
 * 获取信用账户（信用分、等级、权益等）
 * @param actorRole 角色维度：lessee 承租方 / lessor 出租方
 */
export function useGetCreditAccount(actorRole: UserRole) {
  return useQuery({
    queryKey: ['credit-account', actorRole],
    queryFn: () => API.AppCredit.AppCreditControllerGetAccountV1({ actorRole }),
    select: (res) => res.data?.data,
  });
}
