import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { RESOURCE_OWNER_KEY, ResourceOwnerConfig } from '../decorators';
import { AclService } from '../services/acl.service';
import { SystemRoleCode } from '../enums';
import { UserAccessTokenClaims } from '../../auth/dto/output-auth.dto';

/**
 * 资源所有者验证函数类型
 */
export type ResourceOwnerValidator = (resourceId: string, userId: string) => Promise<boolean>;

/**
 * 资源所有者验证器注入令牌
 */
export const RESOURCE_OWNER_VALIDATOR = 'RESOURCE_OWNER_VALIDATOR';

/**
 * 资源所有者守卫
 *
 * 验证当前用户是否为资源的所有者
 * 需配合 @ResourceOwner() 装饰器使用
 *
 * @example
 * @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
 * @ResourceOwner({ resourceIdParam: 'assetId', ownerField: 'createdById' })
 * async updateAsset(@Param('assetId') assetId: string) {}
 */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  private readonly logger = new Logger(ResourceOwnerGuard.name);

  constructor(
    private reflector: Reflector,
    private aclService: AclService,
    private dataSource: DataSource,
    @Inject(RESOURCE_OWNER_VALIDATOR)
    private customValidator?: ResourceOwnerValidator,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取装饰器配置
    const config = this.reflector.getAllAndOverride<ResourceOwnerConfig>(RESOURCE_OWNER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果没有配置，直接通过
    if (!config) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as UserAccessTokenClaims;

    if (!user) {
      this.logger.warn('ResourceOwnerGuard: No user found in request');
      throw new UnauthorizedException('未登录或登录已过期');
    }

    // 检查是否允许管理员绕过
    if (config.allowAdminBypass) {
      const isAdmin = await this.aclService.hasAnyRole(user.id, [
        SystemRoleCode.SUPER_ADMIN,
        SystemRoleCode.PLATFORM_ADMIN,
      ]);

      if (isAdmin) {
        return true;
      }
    }

    // 获取资源 ID
    const resourceId: string | undefined = request.params[config.resourceIdParam || 'id'];

    if (!resourceId) {
      this.logger.warn(`ResourceOwnerGuard: Resource ID param '${config.resourceIdParam}' not found`);
      throw new ForbiddenException('资源 ID 不存在');
    }

    // 如果有自定义验证器，使用自定义验证
    if (this.customValidator) {
      const isOwner = await this.customValidator(resourceId, user.id);
      if (!isOwner) {
        this.logger.warn(`ResourceOwnerGuard: User ${user.id} is not owner of resource ${resourceId}`);
        throw new ForbiddenException('您不是该资源的所有者');
      }
      return true;
    }

    // 默认返回 true，具体验证逻辑由 Service 层实现
    // 这里只做基础框架，实际使用时需要注入具体的验证逻辑
    return true;
  }
}
