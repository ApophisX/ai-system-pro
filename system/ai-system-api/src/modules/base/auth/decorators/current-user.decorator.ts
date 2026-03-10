import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestContext } from '@/common/dtos/request-context.dto';
import { UserAccessTokenClaims } from '../dto/output-auth.dto';

/**
 * 当前用户装饰器
 * 用于从请求中提取当前认证用户
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserAccessTokenClaims | null => {
    const request: RequestContext = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
