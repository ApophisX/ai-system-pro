import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsMobilePhone,
  IsOptional,
  ValidateIf,
  Length,
  MaxLength,
} from 'class-validator';
import { AuthLoginType } from '../enums';
import { Transform } from 'class-transformer';
import { Trim } from '@/common/decorators/trim.decorator';

/**
 * 登录请求 DTO
 */
export class LoginDto {
  @IsMobilePhone('zh-CN', {}, { message: '用户名必须为手机号' })
  @IsNotEmpty({ message: '手机号不能为空' })
  phoneOrEmail: string;

  @ApiProperty({
    title: '验证码',
    example: '12AD34',
    description: '登录失败超过3次后，需要输入验证码才能登录',
  })
  @ValidateIf((o: LoginDto) => o.type === AuthLoginType.PASSWORD)
  @IsString({ message: '验证码必须为字符串' })
  @IsNotEmpty({ message: '验证码不能为空' })
  @Trim()
  captchaCode: string;

  @ValidateIf((o: LoginDto) => o.type === AuthLoginType.SMS)
  @IsString({ message: '验证码必须为字符串' })
  @IsNotEmpty({ message: '验证码不能为空' })
  @Trim()
  @Length(6, 6, { message: '无效的验证码' })
  code: string;

  @ValidateIf((o: LoginDto) => o.type === AuthLoginType.PASSWORD)
  @IsString({ message: '密码必须为字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度至少为6位' })
  password: string;

  @IsOptional()
  @Transform(({ value }) => value || AuthLoginType.PASSWORD)
  type?: AuthLoginType = AuthLoginType.PASSWORD;

  @ApiProperty({
    description: '邀请码（登录即注册时可选，支持商户邀请/用户推广等）',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  @Trim()
  inviteCode?: string;
}

/**
 * 小程序登录请求 DTO
 */
export class LoginByMiniProgramDto {
  @IsNotEmpty()
  @IsString()
  @IsNotEmpty({ message: 'encryptedData不能为空' })
  encryptedData: string;

  @IsString()
  @IsNotEmpty({ message: 'sign不能为空' })
  sign: string;

  @IsString()
  @IsNotEmpty({ message: 'authCode不能为空' })
  authCode: string;
}

export class WechatMiniProgramSignInDto {
  @IsNotEmpty()
  @ApiProperty({
    description: '微信小程序 login code',
    example: 'code',
  })
  jsCode: string;

  @IsNotEmpty()
  @ApiProperty({
    description: '微信小程序 getPhoneNumber code',
    example: 'code',
  })
  code: string;

  @ApiProperty({
    description: '邀请码（登录即注册时可选，支持商户邀请/用户推广等）',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  inviteCode?: string;
}

export class WechatMiniProgramSignInByCodeDto {
  @IsNotEmpty()
  @IsString()
  @IsNotEmpty({ message: 'code不能为空' })
  @ApiProperty({
    description: '微信小程序 code',
    example: 'code',
  })
  code: string;
}
