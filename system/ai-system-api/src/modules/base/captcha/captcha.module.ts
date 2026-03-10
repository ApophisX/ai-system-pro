/**
 * 图形验证码模块
 *
 * 提供图形验证码生成和验证功能
 */

import { Module } from '@nestjs/common';
import { CaptchaController } from './captcha.controller';
import { CaptchaService } from './captcha.service';
import { RedisModule } from '@/infrastructure/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [CaptchaController],
  providers: [CaptchaService],
  exports: [CaptchaService],
})
export class CaptchaModule {}
