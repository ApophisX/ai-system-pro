import { Trim } from '@/common/decorators/trim.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsMobilePhone,
  MinLength,
  MaxLength,
  ValidateIf,
  Length,
  IsEnum,
} from 'class-validator';
import { AuthRegisterType } from '../enums';

/**
 * 注册请求 DTO
 */
export class RegisterDto {
  @ApiProperty({
    description: '手机号',
    example: '13800138000',
    required: false,
  })
  @ValidateIf((o: RegisterDto) => o.type === AuthRegisterType.PHONE)
  @IsString()
  @IsMobilePhone('zh-CN', {}, { message: '手机号格式不正确' })
  phone?: string;

  @ApiProperty({
    description: '邮箱',
    example: 'user@example.com',
    required: false,
  })
  @ValidateIf((o: RegisterDto) => o.type === AuthRegisterType.EMAIL)
  @IsString()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiProperty({
    description: '注册类型',
    example: AuthRegisterType.PHONE,
    required: false,
  })
  @IsOptional()
  // @IsEnum(AuthRegisterType)
  // 目前只支持手机号注册
  type: AuthRegisterType = AuthRegisterType.PHONE;

  @ApiProperty({ description: '用户名', example: '张三', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '用户名长度不能超过50个字符' })
  username?: string;

  @ApiProperty({ description: '密码', example: 'password123', minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string;

  @ApiPropertyOptional({ description: '邀请码（可选，支持商户邀请/用户推广等）' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  inviteCode?: string;

  @Expose()
  @Length(6, 6, { message: '无效的验证码' })
  @IsNotEmpty({ message: '验证码不能为空' })
  @ApiProperty({
    description: '短信验证码',
    example: '123456',
    required: false,
  })
  @Trim()
  code: string;
}
