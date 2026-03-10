import { plainToInstance } from 'class-transformer';
import { Request } from 'express';

import { RequestContext } from '../dtos/request-context.dto';
import { REQUEST_ID_HEADER, TENANT_ID_HEADER } from '@/common/constants/request-header.constant';
import { UserAccessTokenClaims } from '@/modules/base/auth/dto/output-auth.dto';
import { getClientIp } from '@/common/utils/utils';

// Creates a RequestContext object from Request

type Params = {
  user?: UserAccessTokenClaims;
  tenantUser?: unknown;
  tenantUserRoles?: string[];
  tenantUserStores?: string[];
};

export function createRequestContext(request: Request & Params): RequestContext {
  const ctx = new RequestContext();
  ctx.requestId = request.header(REQUEST_ID_HEADER)!;
  ctx.tenantId = (request.headers[TENANT_ID_HEADER] as string | undefined) || '';
  ctx.url = request.url;
  ctx.ipv6 = getClientIp(request);
  ctx.ipv4 = ctx.ipv6.replace('::ffff:', '');
  ctx.tenantUser = request.tenantUser || null;
  ctx.tenantUserRoles = request.tenantUserRoles || [];
  ctx.tenantUserStores = request.tenantUserStores || [];

  // If request.user does not exist, we explicitly set it to null.

  const user = request.user;
  ctx.user = user
    ? plainToInstance(UserAccessTokenClaims, user, {
        excludeExtraneousValues: true,
      })
    : null;

  return ctx;
}
