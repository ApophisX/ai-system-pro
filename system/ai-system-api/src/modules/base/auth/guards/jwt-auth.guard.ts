import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { STRATEGY_JWT_AUTH, STRATEGY_JWT_AUTH_FOR_PUBLIC } from '../constants/strategy.constant';
import { IS_PUBLIC_API_KEY } from '@/common/decorators/no-auth.decorator';
import { IS_PUBLIC_OR_AUTH_KEY } from '../decorators/public-or-auth.decorator';
import { firstValueFrom, isObservable } from 'rxjs';

/**
 * JWT 认证守卫（公开）
 *
 * 用于保护需要 JWT 认证的路由（公开）
 * 如果提供了有效的 JWT token，会设置 request.user
 * 如果没有 token 或 token 无效，不会阻止请求，但 request.user 为 undefined
 */
@Injectable()
export class JwtAuthGuardForPublic extends AuthGuard(STRATEGY_JWT_AUTH_FOR_PUBLIC) {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 尝试执行 JWT 认证
    // 如果成功，会将用户信息设置到 request.user
    // 如果失败（没有 token 或 token 无效），捕获异常并允许请求继续
    try {
      const result = super.canActivate(context);

      if (typeof result === 'boolean') {
        return result;
      } else if (isObservable(result)) {
        return await firstValueFrom(result);
      } else if (result instanceof Promise) {
        return await result;
      }

      return true;
    } catch {
      // 认证失败（没有 token 或 token 无效）不影响请求继续
      // request.user 保持为 undefined
      return true;
    }
  }
}

/**
 * JWT 认证守卫
 *
 * 用于保护需要 JWT 认证的路由
 * - @NoAuth()：完全公开，不做认证
 * - @PublicOrAuth()：可选认证，有 token 则解析 user，无 token 也放行
 * - 无装饰器：必须认证
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard(STRATEGY_JWT_AUTH) {
  constructor(
    private reflector: Reflector,
    // private jwtAuthGuardForPublic: JwtAuthGuardForPublic,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否有 @NoAuth() 装饰器（完全公开）
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_API_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // 检查是否有 @PublicOrAuth() 装饰器（可选认证）
    const isPublicOrAuth = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_OR_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublicOrAuth) {
      // return this.jwtAuthGuardForPublic.canActivate(context);
      return true;
    }

    const result = super.canActivate(context);

    if (typeof result === 'boolean') {
      return result;
    } else if (isObservable(result)) {
      return await firstValueFrom(result);
    } else if (result instanceof Promise) {
      return await result;
    }

    return false;
  }
}
