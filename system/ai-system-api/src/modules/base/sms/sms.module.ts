/**
 * SMS 模块
 *
 * 提供短信验证码发送和验证功能
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';
import { RedisModule } from '@/infrastructure/redis/redis.module';
import { CaptchaModule } from '../captcha/captcha.module';
import { smsConfig, SMS_CONFIG_KEY } from '@/config';

@Module({
  imports: [ConfigModule.forFeature(smsConfig), RedisModule, CaptchaModule],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
