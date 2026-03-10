import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';
import { STRATEGY_LOCAL } from '../constants/strategy.constant';
import { plainToInstance } from 'class-transformer';
import { UserAccessTokenClaims } from '../dto/output-auth.dto';

/**
 * 本地认证策略（用户名密码）
 *
 * 用于验证用户名和密码登录
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, STRATEGY_LOCAL) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'phoneOrEmail', // 使用 phoneOrEmail 字段作为用户名
      passwordField: 'password',
    });
  }

  /**
   * 验证用户凭证
   */
  async validate(phoneOrEmail: string, password: string): Promise<UserAccessTokenClaims> {
    const user = await this.authService.validateUser(phoneOrEmail, password);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return plainToInstance(UserAccessTokenClaims, user);
  }
}
