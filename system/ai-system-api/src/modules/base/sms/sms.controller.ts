/**
 * SMS 控制器
 *
 * 提供短信验证码发送和验证接口
 */

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SmsService } from './sms.service';
import { SendSmsCodeDto } from './dto/send-sms-code.dto';
import { VerifySmsCodeDto } from './dto/verify-sms-code.dto';

import { createSwaggerApiResponse, type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { CAPTCHA_COOKIE_NAME } from '../captcha/captcha.constant';
import { Cookies } from '@/common/decorators/cookie.decorator';

/**
 * SMS 控制器
 */
@ApiTags('Sms')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  /**
   * 发送短信验证码
   */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '发送短信验证码' })
  @ApiResponse({
    status: 200,
    description: '发送成功',
    type: createSwaggerApiResponse(Boolean),
  })
  @ApiResponse({ status: 400, description: '请求参数错误或图形验证码错误' })
  @ApiResponse({ status: 429, description: '发送过于频繁' })
  async sendCode(
    @Body() dto: SendSmsCodeDto,
    @Cookies(CAPTCHA_COOKIE_NAME) captchaId: string,
  ): PromiseApiResponse<boolean> {
    await this.smsService.sendCode({
      ...dto,
      captchaId,
    });
    return {
      message: '验证码已发送',
      data: true,
    };
  }

  /**
   * 验证短信验证码
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证短信验证码' })
  @ApiResponse({
    status: 200,
    description: '验证成功',
    type: createSwaggerApiResponse(Boolean),
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async verifyCode(@Body() dto: VerifySmsCodeDto): PromiseApiResponse<boolean> {
    const isValid = await this.smsService.verifyCode(dto.phone, dto.scene, dto.code);

    if (!isValid) {
      return {
        code: -1,
        message: '验证码错误或已过期',
        data: false,
      };
    }

    return {
      message: '验证码验证成功',
      data: true,
    };
  }
}
