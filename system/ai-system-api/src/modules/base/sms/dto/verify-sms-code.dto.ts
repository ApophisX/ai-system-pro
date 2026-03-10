/**
 * 验证短信验证码请求 DTO
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMobilePhone, IsEnum, Length } from 'class-validator';
import { SmsScene } from '../enums';
import { Trim } from '@/common/decorators/trim.decorator';

/**
 * 验证短信验证码请求
 */
export class VerifySmsCodeDto {
  @ApiProperty({
    description: '手机号',
    example: '13800138000',
  })
  @IsMobilePhone('zh-CN', {}, { message: '手机号格式不正确' })
  @IsNotEmpty({ message: '手机号不能为空' })
  @Trim()
  phone: string;

  @ApiProperty({
    description: '验证码场景',
    enum: SmsScene,
    example: SmsScene.REGISTER,
  })
  @IsEnum(SmsScene, { message: '验证码场景不正确' })
  @IsNotEmpty({ message: '验证码场景不能为空' })
  scene: SmsScene;

  @ApiProperty({
    description: '短信验证码',
    example: '123456',
  })
  @IsString({ message: '验证码必须为字符串' })
  @IsNotEmpty({ message: '验证码不能为空' })
  @Length(6, 6, { message: '验证码长度为 6 位' })
  @Trim()
  code: string;
}
