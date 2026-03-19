import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy, JwtStrategyForPublic } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAuthGuard, JwtAuthGuardForPublic } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { STRATEGY_JWT_AUTH } from './constants/strategy.constant';
import { AUTH_CONFIG_KEY, AuthConfig } from '@/config';
import { UserModule } from '../user/user.module';
import { UserRepository } from '../user/repositories';
import { CaptchaModule } from '../captcha/captcha.module';
import { SmsModule } from '../sms/sms.module';
import { WeappAuthController } from './controllers/weapp-auth.controller';
import { WeappAuthService } from './services/weapp-auth.service';

/**
 * 认证模块
 *
 * 负责用户认证、授权、JWT 令牌管理
 */
@Module({
  imports: [
    UserModule,
    SmsModule,
    CaptchaModule,
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule.register({ defaultStrategy: STRATEGY_JWT_AUTH }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const authConfig = configService.get<AuthConfig>(AUTH_CONFIG_KEY);
        if (!authConfig) {
          throw new Error('Auth config not found');
        }
        return {
          secret: authConfig.jwt.secret,
          signOptions: {
            expiresIn: Number(authConfig.jwt.expiresIn),
          },
        };
      },
    }),
  ],
  controllers: [AuthController, WeappAuthController],
  providers: [
    AuthService,
    WeappAuthService,
    JwtStrategy,
    JwtStrategyForPublic,
    LocalStrategy,
    JwtAuthGuard,
    JwtAuthGuardForPublic,
    LocalAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard, JwtAuthGuardForPublic, LocalAuthGuard],
})
export class AuthModule {}
