import { useQuery } from '@tanstack/react-query';

import API from 'src/services/API';

/** 商户邀请所需角色：merchant_inviter（拓展）或 bd（商务） */
const ALLOWED_ROLE_CODES = ['merchant_inviter', 'bd'];

/**
 * 检查当前用户是否有商户邀请权限
 * 基于 ACL 角色：merchant_inviter 或 bd
 */
export function useHasMerchantInvitePermission() {
  const {
    data: roles = [],
    isSuccess,
    isError,
  } = useQuery({
    queryKey: ['acl-me-roles'],
    queryFn: () => API.Acl.AclControllerGetMyRolesV1(),
    select: (res) => (res.data?.data ?? []) as Array<{ code?: string }>,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const hasPermission =
    isSuccess && !isError && roles.some((r) => r?.code && ALLOWED_ROLE_CODES.includes(r.code));

  return { hasPermission, isLoading: !isSuccess && !isError };
}
