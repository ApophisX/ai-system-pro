import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsDateString,
  IsArray,
  IsObject,
  MaxLength,
  MinLength,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserType, Gender } from '../enums';

/**
 * 创建用户资料 DTO（内嵌在用户创建中）
 */
export class CreateUserProfileDto {
  @ApiPropertyOptional({
    description: '头像 URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: '头像 URL 最长 500 个字符' })
  avatar?: string;

  @ApiPropertyOptional({
    description: '昵称',
    example: '张三',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: '昵称最长 50 个字符' })
  nickname?: string;

  @ApiPropertyOptional({
    description: '个人简介',
    example: '热爱生活，喜欢分享',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  // ========== 个人用户字段 ==========
  @ApiPropertyOptional({
    description: '真实姓名',
    example: '张三',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: '真实姓名最长 50 个字符' })
  realName?: string;

  @ApiPropertyOptional({
    description: '性别',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({
    description: '生日（YYYY-MM-DD）',
    example: '1990-01-01',
  })
  @IsDateString()
  @IsOptional()
  birthday?: string;

  @ApiPropertyOptional({
    description: '个人地址',
    example: '广东省深圳市南山区xxx',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: '地址最长 500 个字符' })
  address?: string;

  // ========== 企业用户字段 ==========
  @ApiPropertyOptional({
    description: '企业名称',
    example: '深圳市xxx有限公司',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: '企业名称最长 200 个字符' })
  companyName?: string;

  @ApiPropertyOptional({
    description: '法人代表',
    example: '张三',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: '法人代表姓名最长 50 个字符' })
  legalRepresentative?: string;

  @ApiPropertyOptional({
    description: '企业地址',
    example: '广东省深圳市南山区xxx科技园',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: '企业地址最长 500 个字符' })
  companyAddress?: string;

  @ApiPropertyOptional({
    description: '企业联系电话',
    example: '0755-12345678',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: '企业电话最长 20 个字符' })
  companyPhone?: string;

  @ApiPropertyOptional({
    description: '企业邮箱',
    example: 'contact@company.com',
  })
  @IsEmail({}, { message: '企业邮箱格式不正确' })
  @IsOptional()
  @MaxLength(100, { message: '企业邮箱最长 100 个字符' })
  companyEmail?: string;

  // ========== 扩展字段 ==========
  @ApiPropertyOptional({
    description: '标签',
    example: ['优质出租方', '认证企业'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: '个人偏好设置（JSON 对象）',
    example: { theme: 'dark', notifications: true },
  })
  @IsObject()
  @IsOptional()
  preferences?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: '其他设置（JSON 对象）',
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, unknown>;
}

/**
 * 创建用户请求 DTO（手机号注册）
 */
export class CreateUserByPhoneDto {
  @ApiProperty({
    description: '手机号',
    example: '13800138000',
  })
  @IsString()
  @IsNotEmpty({ message: '手机号不能为空' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  @ApiProperty({
    description: '验证码',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty({ message: '验证码不能为空' })
  @MinLength(4, { message: '验证码至少 4 位' })
  @MaxLength(6, { message: '验证码最多 6 位' })
  code: string;

  @ApiPropertyOptional({
    description: '用户类型',
    enum: UserType,
    example: UserType.PERSONAL,
    default: UserType.PERSONAL,
  })
  @IsEnum(UserType)
  @IsOptional()
  userType?: UserType;

  @ApiPropertyOptional({
    description: '昵称',
    example: '新用户xxx',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: '昵称最长 50 个字符' })
  nickname?: string;

  @ApiPropertyOptional({
    description: '头像',
    example: 'https://example.com/avatar.jpg',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: '头像地址最长 255 个字符' })
  avatar?: string;
}

/**
 * 创建用户请求 DTO（邮箱注册）
 */
export class CreateUserByEmailDto {
  @ApiProperty({
    description: '邮箱',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @MaxLength(100, { message: '邮箱最长 100 个字符' })
  email: string;

  @ApiProperty({
    description: '密码',
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(8, { message: '密码至少 8 位' })
  @MaxLength(32, { message: '密码最多 32 位' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/, {
    message: '密码必须包含大小写字母和数字',
  })
  password: string;

  @ApiProperty({
    description: '确认密码',
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty({ message: '确认密码不能为空' })
  confirmPassword: string;

  @ApiPropertyOptional({
    description: '用户类型',
    enum: UserType,
    example: UserType.PERSONAL,
    default: UserType.PERSONAL,
  })
  @IsEnum(UserType)
  @IsOptional()
  userType?: UserType;

  @ApiPropertyOptional({
    description: '用户名',
    example: 'john_doe',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: '用户名最长 50 个字符' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: '用户名只能包含字母、数字和下划线',
  })
  username?: string;

  @ApiPropertyOptional({
    description: '昵称',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: '昵称最长 50 个字符' })
  nickname?: string;
}

/**
 * 完整创建用户请求 DTO（管理端或内部调用）
 */
export class CreateUserDto {
  @ApiPropertyOptional({
    description: '用户名',
    example: 'john_doe',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: '用户名最长 50 个字符' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: '用户名只能包含字母、数字和下划线',
  })
  username?: string;

  @ApiPropertyOptional({
    description: '昵称',
    example: '张三',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: '昵称最长 50 个字符' })
  nickname?: string;

  @ApiPropertyOptional({
    description: '头像',
    example: 'https://example.com/avatar.jpg',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: '头像地址最长 255 个字符' })
  avatar?: string;

  @ApiPropertyOptional({
    description: '手机号',
    example: '13800138000',
  })
  @IsString()
  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiPropertyOptional({
    description: '邮箱',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  @MaxLength(100, { message: '邮箱最长 100 个字符' })
  email?: string;

  @ApiPropertyOptional({
    description: '密码',
    example: 'Password123!',
  })
  @IsString()
  @IsOptional()
  @MinLength(8, { message: '密码至少 8 位' })
  @MaxLength(32, { message: '密码最多 32 位' })
  password?: string;

  @ApiPropertyOptional({
    description: '用户类型',
    enum: UserType,
    example: UserType.PERSONAL,
    default: UserType.PERSONAL,
  })
  @IsEnum(UserType)
  @IsOptional()
  userType?: UserType;

  @ApiPropertyOptional({
    description: '用户资料',
    type: CreateUserProfileDto,
  })
  @ValidateNested()
  @Type(() => CreateUserProfileDto)
  @IsOptional()
  profile?: CreateUserProfileDto;
}
