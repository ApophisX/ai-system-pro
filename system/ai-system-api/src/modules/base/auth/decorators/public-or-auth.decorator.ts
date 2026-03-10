import { CustomDecorator, SetMetadata } from '@nestjs/common';

/** 可选认证的元数据 key：有 token 则解析并设置 user，无 token 也放行 */
export const IS_PUBLIC_OR_AUTH_KEY = 'publicOrAuth';

/**
 * 可选认证装饰器
 *
 * 用于「公开但支持登录态」的路由：
 * - 无 token 或 token 无效：放行，request.user 为 undefined
 * - 有有效 token：放行，request.user 为当前用户
 *
 * 需配合控制器级的 @UseGuards(JwtAuthGuard) 使用
 */
export const PublicOrAuth = (): CustomDecorator<string> => {
  return SetMetadata(IS_PUBLIC_OR_AUTH_KEY, true);
};
