/**
 * 发送短信验证码请求 DTO
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMobilePhone, IsEnum, Length, IsOptional } from 'class-validator';
import { SmsScene } from '../enums';
import { Trim } from '@/common/decorators/trim.decorator';

/**
 * 发送短信验证码请求
 */
export class SendSmsCodeDto {
  @ApiProperty({
    description: '手机号',
    example: '13800138000',
  })
  @IsMobilePhone('zh-CN', {}, { message: '手机号格式不正确' })
  @IsNotEmpty({ message: '手机号不能为空' })
  @Trim()
  phoneNumber: string;

  @ApiProperty({
    description: '验证码场景',
    enum: SmsScene,
    example: SmsScene.REGISTER,
  })
  @IsEnum(SmsScene, { message: '验证码场景不正确' })
  @IsNotEmpty({ message: '验证码场景不能为空' })
  scene: SmsScene;

  @ApiPropertyOptional({
    description: '图形验证码 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: '图形验证码 ID 必须为字符串' })
  // @IsNotEmpty({ message: '图形验证码 ID 不能为空' })
  @IsOptional()
  @Trim()
  captchaId: string;

  @ApiProperty({
    description: '图形验证码',
    example: 'ABCD',
  })
  @IsString({ message: '图形验证码必须为字符串' })
  @IsNotEmpty({ message: '图形验证码不能为空' })
  @Length(4, 4, { message: '图形验证码长度为 4 位' })
  @Trim()
  captchaCode: string;
}
