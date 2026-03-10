/**
 * 图形验证码服务
 *
 * 生成和验证图形验证码
 */

import { Injectable, Logger } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';
import { RedisService } from '@/infrastructure/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';
import { IS_DEV } from '@/common/constants/global';

/**
 * 图形验证码结果
 */
export interface CaptchaResult {
  /** 验证码 ID */
  id: string;
  /** SVG 图片数据 */
  svg: string;
}

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);
  private readonly CAPTCHA_TTL = 300; // 5 分钟

  constructor(private readonly redisService: RedisService) {}

  /**
   * 生成图形验证码
   */
  async generate(oldCaptchaId?: string): Promise<CaptchaResult> {
    if (oldCaptchaId) {
      const key = this.getCaptchaKey(oldCaptchaId);
      await this.redisService.del(key);
    }

    const captcha = svgCaptcha.create({
      size: 4, // 验证码长度
      ignoreChars: '0oO1IilLq9', // 忽略容易混淆的字符
      noise: 2, // 干扰线条数量
      color: true, // 彩色
      // background: '#f0f0f0', // 背景色
      // width: 120,
      // height: 40,
      fontSize: 50,
      charPreset: '123456789ABCDEFGHJKLMNPQRSTUVWXYZ', // 字符集
    });

    const id = uuidv4();
    const key = this.getCaptchaKey(id);

    // 存储验证码答案（转为大写，忽略大小写）
    await this.redisService.set(key, captcha.text.toUpperCase(), this.CAPTCHA_TTL);

    this.logger.debug(`Generated captcha: id=${id}`);

    return {
      id,
      svg: captcha.data,
    };
  }

  /**
   * 验证图形验证码
   */
  async verify(id: string, code: string): Promise<boolean> {
    if (IS_DEV) {
      return true;
    }

    if (!id || !code) {
      return false;
    }

    const key = this.getCaptchaKey(id);
    const storedCode = await this.redisService.get(key);

    if (!storedCode) {
      this.logger.warn(`Captcha not found or expired: id=${id}`);
      return false;
    }

    // 验证后删除验证码（一次性使用）
    await this.redisService.del(key);

    // 忽略大小写比较
    const isValid = storedCode.toUpperCase() === code.toUpperCase().trim();

    if (!isValid) {
      this.logger.warn(`Captcha verification failed: id=${id}`);
    }

    return isValid;
  }

  /**
   * 获取验证码 Redis 键
   */
  private getCaptchaKey(id: string): string {
    return `captcha:${id}`;
  }
}
