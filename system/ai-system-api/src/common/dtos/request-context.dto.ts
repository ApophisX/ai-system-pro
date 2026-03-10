import { UserAccessTokenClaims } from '@/modules/base/auth/dto/output-auth.dto';

export class RequestContext {
  public requestId: string;

  public url: string;

  public ipv6: string;
  public ipv4: string;

  // TODO : Discuss with team if this import is acceptable or if we should move UserAccessTokenClaims to shared.
  public user: UserAccessTokenClaims | null;

  public tenantId: string;

  public tenantUser: unknown;

  public tenantUserRoles: string[];

  public tenantUserStores: string[];

  get isTenantAdmin(): boolean {
    return this.tenantUserRoles.includes('admin') || this.user?.isAdmin || false;
  }
}
