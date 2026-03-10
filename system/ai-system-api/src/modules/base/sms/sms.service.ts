/**
 * SMS 服务
 *
 * 短信验证码发送和验证服务
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
import * as $Util from '@alicloud/tea-util';
import { RedisService } from '@/infrastructure/redis/redis.service';
import { CaptchaService } from '../captcha/captcha.service';
import { SmsScene } from './enums';
import { SmsConfig, SMS_CONFIG_KEY } from '@/config';
import { IS_DEV, IS_PROD } from '@/common/constants/global';
import { SendSmsCodeDto } from './dto/send-sms-code.dto';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly smsClient: Dysmsapi20170525;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly captchaService: CaptchaService,
  ) {
    const smsConfig = this.configService.get<SmsConfig>(SMS_CONFIG_KEY);
    if (!smsConfig) {
      this.logger.warn('SMS config not found');
      return;
    }

    // 初始化阿里云短信客户端
    const config = new $OpenApi.Config({
      accessKeyId: smsConfig.alicloud.accessKeyId,
      accessKeySecret: smsConfig.alicloud.accessKeySecret,
      endpoint: smsConfig.alicloud.endpoint,
    });
    this.smsClient = new Dysmsapi20170525(config);
  }

  /**
   * 发送短信验证码
   */
  async sendCode(params: SendSmsCodeDto): Promise<void> {
    const { phoneNumber: phone, scene, captchaId, captchaCode } = params;
    const smsConfig = this.configService.get(SMS_CONFIG_KEY) as SmsConfig;

    // 1. 验证图形验证码
    const isCaptchaValid = await this.captchaService.verify(captchaId, captchaCode);
    if (!isCaptchaValid) {
      throw new BadRequestException('图形验证码错误或已过期');
    }

    // 2. 检查发送频率限制
    const sendIntervalKey = this.getSendIntervalKey(phone, scene);
    const lastSendTime = await this.redisService.get(sendIntervalKey);
    if (lastSendTime) {
      const elapsed = Date.now() - parseInt(lastSendTime, 10);
      const remaining = smsConfig.sendIntervalSeconds * 1000 - elapsed;
      if (remaining > 0) {
        throw new BadRequestException(`发送过于频繁，请 ${Math.ceil(remaining / 1000)} 秒后再试`);
      }
    }

    // 3. 生成验证码
    const code = this.generateCode(smsConfig.codeLength);
    const codeKey = this.getCodeKey(phone, scene);
    const codeExpireSeconds = smsConfig.codeExpireSeconds;

    // 4. 存储验证码和发送时间
    await Promise.all([
      this.redisService.set(codeKey, code, codeExpireSeconds),
      this.redisService.set(sendIntervalKey, Date.now().toString(), smsConfig.sendIntervalSeconds),
    ]);

    if (IS_PROD) {
      // 5. 发送短信
      await this.sendSms(phone, scene, code, smsConfig);
    }
    this.logger.log(`短信验证码已发送: 手机号=${phone}, 场景=${scene}`);
  }

  /**
   * 验证短信验证码
   */
  async verifyCode(phone: string, scene: SmsScene, code: string): Promise<boolean> {
    // if (IS_DEV) {
    //   return true;
    // }

    const codeKey = this.getCodeKey(phone, scene);
    const storedCode = await this.redisService.get(codeKey);

    if (!storedCode) {
      this.logger.warn(`SMS code not found or expired: phone=${phone}, scene=${scene}`);
      return false;
    }

    // 验证后删除验证码（一次性使用）
    await this.redisService.del(codeKey);

    // 忽略大小写和空格比较
    const isValid = storedCode.trim() === code.trim();

    if (!isValid) {
      this.logger.warn(`SMS code verification failed: phone=${phone}, scene=${scene}`);
    } else {
      this.logger.log(`SMS code verified: phone=${phone}, scene=${scene}`);
    }

    return isValid;
  }

  /**
   * 发送短信（阿里云）
   */
  private async sendSms(phone: string, scene: SmsScene, code: string, smsConfig: SmsConfig): Promise<void> {
    const templateCode = smsConfig.alicloud.templateCode[scene];
    if (!templateCode) {
      throw new BadRequestException(`场景 ${scene} 的短信模板未配置`);
    }

    const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
      phoneNumbers: phone,
      signName: smsConfig.alicloud.signName,
      templateCode,
      templateParam: JSON.stringify({ code }),
    });
    const runtime = new $Util.RuntimeOptions({});
    try {
      const response = await this.smsClient.sendSmsWithOptions(sendSmsRequest, runtime);
      if (response.body?.code !== 'OK') {
        throw new BadRequestException(`短信发送失败: ${response.body?.code} - ${response.body?.message}`);
      }
    } catch (error) {
      this.logger.error(`短信发送失败: ${error.message}, phone=${phone}, scene=${scene}`, error);
      throw new BadRequestException(`短信发送失败: ${error.message}`);
    }
  }

  // -------------------------- private methods --------------------------

  /**
   * 生成随机验证码
   */
  private generateCode(length: number): string {
    if (IS_DEV) {
      return '123456';
    }
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
  }

  /**
   * 获取验证码 Redis 键
   */
  private getCodeKey(phone: string, scene: SmsScene): string {
    return `sms:code:${scene}:${phone}`;
  }

  /**
   * 获取发送间隔限制 Redis 键
   */
  private getSendIntervalKey(phone: string, scene: SmsScene): string {
    return `sms:interval:${scene}:${phone}`;
  }
}
