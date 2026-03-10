import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGY_LOCAL } from '../constants/strategy.constant';

/**
 * 本地认证守卫
 *
 * 用于保护需要用户名密码认证的路由（如登录接口）
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard(STRATEGY_LOCAL) {}
