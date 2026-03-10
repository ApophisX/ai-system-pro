import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { JwtPayload } from '../types/jwt-payload.type';
import { AUTH_CONFIG_KEY, AuthConfig } from '@/config';
import { STRATEGY_JWT_AUTH, STRATEGY_JWT_AUTH_FOR_PUBLIC } from '../constants/strategy.constant';
import { OutputUserDto } from '../../user/dto';
import { plainToInstance } from 'class-transformer';

/**
 * JWT 认证策略
 *
 * 用于验证 JWT 访问令牌
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, STRATEGY_JWT_AUTH) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const authConfig = configService.get(AUTH_CONFIG_KEY) as AuthConfig;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwt.secret,
    });
  }

  /**
   * 验证 JWT 载荷并返回用户信息
   */
  async validate(payload: JwtPayload): Promise<OutputUserDto> {
    const user = await this.authService.validateUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    return plainToInstance(OutputUserDto, user, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }
}

/**
 * JWT 认证策略（公开）
 *
 * 用于验证 JWT 访问令牌（公开）
 */
@Injectable()
export class JwtStrategyForPublic extends PassportStrategy(Strategy, STRATEGY_JWT_AUTH_FOR_PUBLIC) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const authConfig = configService.get(AUTH_CONFIG_KEY) as AuthConfig;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwt.secret,
    });
  }

  /**
   * 验证 JWT 载荷并返回用户信息
   */
  async validate(payload: JwtPayload): Promise<OutputUserDto | null> {
    const user = await this.authService.validateUserById(payload.sub);
    return plainToInstance(OutputUserDto, user, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }
}
