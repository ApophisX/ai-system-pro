/**
 * 图形验证码控制器
 *
 * 提供图形验证码生成接口
 */

import { Controller, Get, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { CaptchaService } from './captcha.service';
import { OutputCaptchaDto } from './dto/output-captcha.dto';
import { Cookies } from '@/common/decorators/cookie.decorator';
import { CAPTCHA_COOKIE_NAME } from './captcha.constant';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { IS_DEV } from '@/common/constants/global';

/**
 * 图形验证码控制器
 */
@ApiTags('Captcha')
@Controller('captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  /**
   * 生成图形验证码
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '生成图形验证码' })
  @SwaggerApiResponse(OutputCaptchaDto)
  async generate(@Cookies(CAPTCHA_COOKIE_NAME) oldCaptchaId: string): PromiseApiResponse<OutputCaptchaDto> {
    const result = await this.captchaService.generate(oldCaptchaId);
    return {
      data: {
        id: result.id,
        svg: result.svg,
      },
    };
  }

  /**
   * 获取图形验证码 SVG（直接返回 SVG）
   */
  @Get('svg')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取图形验证码 SVG' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSvg(@Res() res: Response, @Cookies(CAPTCHA_COOKIE_NAME) oldCaptchaId: string) {
    // 注意：这个接口主要用于直接返回 SVG，实际使用中通常使用 generate 接口
    const captcha = await this.captchaService.generate(oldCaptchaId);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.type('image/svg+xml');
    res.setHeader(CAPTCHA_COOKIE_NAME, captcha.id);
    res.cookie(CAPTCHA_COOKIE_NAME, captcha.id, {
      httpOnly: true,
      maxAge: 3 * 60 * 1000,
      domain: IS_DEV ? 'localhost' : undefined,
      path: '/',
    });
    res.send(captcha.svg);
  }
}
