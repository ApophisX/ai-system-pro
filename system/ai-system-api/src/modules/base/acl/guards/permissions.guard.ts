import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators';
import { AclService } from '../services/acl.service';
import { PermissionResource, PermissionAction } from '../enums';
import { generatePermissionCode } from '../constants';
import { UserAccessTokenClaims } from '../../auth/dto/output-auth.dto';

/**
 * 权限守卫
 *
 * 验证当前用户是否拥有指定的权限
 * 需配合 @Permissions() 装饰器使用
 *
 * @example
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @Permissions('asset:create')
 * async createAsset() {}
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private aclService: AclService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取装饰器中定义的权限要求
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果没有权限要求，直接通过
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 获取当前用户
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserAccessTokenClaims;

    if (!user) {
      this.logger.warn('PermissionsGuard: No user found in request');
      throw new UnauthorizedException('未登录或登录已过期');
    }

    // 检查是否拥有超级管理员权限（拥有所有权限）
    const hasSuperPermission = await this.aclService.hasPermission(
      user.id,
      generatePermissionCode(PermissionResource.ALL, PermissionAction.MANAGE),
    );

    if (hasSuperPermission) {
      return true;
    }

    // 检查用户是否拥有所需权限（任一即可）
    const hasPermission = await this.aclService.hasAnyPermission(user.id, requiredPermissions);

    if (!hasPermission) {
      this.logger.warn(
        `PermissionsGuard: User ${user.id} lacks required permissions: ${requiredPermissions.join(', ')}`,
      );
      throw new ForbiddenException('权限不足，无法执行此操作');
    }

    return true;
  }
}
