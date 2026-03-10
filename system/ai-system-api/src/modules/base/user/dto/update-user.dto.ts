import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  IsObject,
  MaxLength,
  MinLength,
  Matches,
  ArrayMinSize,
  ArrayMaxSize,
  Min,
  Max,
} from 'class-validator';
import { UserType, Gender, AccountStatus, RiskLevel } from '../enums';
import { CreateUserProfileDto } from './create-user.dto';
import { PASSWORD_INVALID_MESSAGE, PASSWORD_REG } from '@/common/constants';

/**
 * 更新用户基础信息 DTO（App 端用户自己更新）
 */
export class UpdateUserBasicDto {
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
}

/**
 * 更新用户资料 DTO
 */
export class UpdateUserProfileDto extends PartialType(CreateUserProfileDto) {}

/**
 * 更新密码 DTO
 */
export class UpdatePasswordDto {
  @ApiProperty({
    description: '旧密码',
    example: 'OldPassword123!',
  })
  @IsString()
  @IsNotEmpty({ message: '旧密码不能为空' })
  oldPassword: string;

  @ApiProperty({
    description: '新密码',
    example: 'NewPassword123!',
  })
  @IsString()
  @IsNotEmpty({ message: '新密码不能为空' })
  @MinLength(8, { message: '密码至少 8 位' })
  @MaxLength(32, { message: '密码最多 32 位' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/, {
    message: '密码必须包含大小写字母和数字',
  })
  newPassword: string;

  @ApiProperty({
    description: '确认新密码',
    example: 'NewPassword123!',
  })
  @IsString()
  @IsNotEmpty({ message: '确认密码不能为空' })
  confirmPassword: string;
}

/**
 * 重置密码 DTO（通过验证码）
 */
export class ResetPasswordDto {
  @ApiProperty({
    description: '手机号或邮箱',
    example: '13800138000',
  })
  @IsString()
  @IsNotEmpty({ message: '手机号或邮箱不能为空' })
  account: string;

  @ApiProperty({
    description: '验证码',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty({ message: '验证码不能为空' })
  @MinLength(4, { message: '验证码至少 4 位' })
  @MaxLength(6, { message: '验证码最多 6 位' })
  code: string;

  @ApiProperty({
    description: '新密码',
    example: 'NewPassword123!',
  })
  @IsString()
  @IsNotEmpty({ message: '新密码不能为空' })
  @MinLength(6, { message: '密码至少 6 位' })
  @MaxLength(18, { message: '密码最多 18 位' })
  @Matches(PASSWORD_REG, {
    message: PASSWORD_INVALID_MESSAGE,
  })
  newPassword: string;

  @ApiPropertyOptional({
    description: '确认新密码',
    example: 'NewPassword123!',
  })
  @IsOptional()
  @IsString()
  confirmPassword?: string;
}

/**
 * 绑定手机号 DTO
 */
export class BindPhoneDto {
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
}

/**
 * 绑定邮箱 DTO
 */
export class BindEmailDto {
  @ApiProperty({
    description: '邮箱',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @MaxLength(100, { message: '邮箱最长 100 个字符' })
  email: string;

  @ApiProperty({
    description: '验证码',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty({ message: '验证码不能为空' })
  @MinLength(4, { message: '验证码至少 4 位' })
  @MaxLength(6, { message: '验证码最多 6 位' })
  code: string;
}

/**
 * 实名认证请求 DTO（个人用户）
 */
export class PersonalVerificationDto {
  @ApiProperty({
    description: '真实姓名',
    example: '张三',
  })
  @IsString()
  @IsNotEmpty({ message: '真实姓名不能为空' })
  @MaxLength(50, { message: '真实姓名最长 50 个字符' })
  realName: string;

  @ApiProperty({
    description: '身份证号',
    example: '440305199001011234',
  })
  @IsString()
  @IsNotEmpty({ message: '身份证号不能为空' })
  @Matches(/^\d{17}[\dXx]$/, { message: '身份证号格式不正确' })
  idCard: string;

  @ApiPropertyOptional({
    description: '身份证照片地址（正反面）',
    example: ['https://example.com/idcard-front.jpg', 'https://example.com/idcard-back.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  idCardPhotoUrls?: string[];
}

/**
 * 实名认证请求 DTO（企业用户）
 */
export class EnterpriseVerificationDto {
  @ApiProperty({
    description: '企业名称',
    example: '深圳市xxx有限公司',
  })
  @IsString()
  @IsNotEmpty({ message: '企业名称不能为空' })
  @MaxLength(200, { message: '企业名称最长 200 个字符' })
  companyName: string;

  @ApiProperty({
    description: '统一社会信用代码',
    example: '91440300MA5XXXXXX',
  })
  @IsString()
  @IsNotEmpty({ message: '统一社会信用代码不能为空' })
  @MaxLength(50, { message: '统一社会信用代码最长 50 个字符' })
  businessLicense: string;

  @ApiProperty({
    description: '法人代表姓名',
    example: '张三',
  })
  @IsString()
  @IsNotEmpty({ message: '法人代表姓名不能为空' })
  @MaxLength(50, { message: '法人代表姓名最长 50 个字符' })
  legalRepresentative: string;

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

  @ApiProperty({
    description: '营业执照照片（必须）',
    example: ['https://example.com/business-license.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: '请上传至少一张营业执照照片' })
  @ArrayMaxSize(5, { message: '营业执照照片最多 5 张' })
  businessLicensePhotoUrls: string[];

  @ApiPropertyOptional({
    description: '附件材料（可选，如补充证明材料等）',
    example: ['https://example.com/attachment1.pdf', 'https://example.com/attachment2.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayMaxSize(10, { message: '附件材料最多 10 个' })
  attachmentUrls?: string[];
}

/**
 * 拒绝企业认证 DTO（管理员审核）
 */
export class RejectEnterpriseVerificationDto {
  @ApiPropertyOptional({
    description: '拒绝原因（可选，用于通知用户）',
    example: '营业执照模糊，请重新上传',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: '拒绝原因最长 500 个字符' })
  reason?: string;
}

/**
 * 更新用户资料 DTO（App 端用户自己编辑资料）
 */
export class UpdateUserProfileInfoDto {
  @ApiPropertyOptional({
    description: '头像',
    example: 'https://example.com/avatar.jpg',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: '头像地址最长 500 个字符' })
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
    description: '性别',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({
    description: '个人简介',
    example: '热爱生活，喜欢分享',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: '个人简介最长 500 个字符' })
  bio?: string;
}

/**
 * 更新用户 DTO（管理端基础更新）
 */
export class UpdateUserDto {
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
    description: '用户类型',
    enum: UserType,
    example: UserType.PERSONAL,
  })
  @IsEnum(UserType)
  @IsOptional()
  userType?: UserType;

  @ApiPropertyOptional({
    description: '账户状态',
    enum: AccountStatus,
    example: AccountStatus.ACTIVE,
  })
  @IsEnum(AccountStatus)
  @IsOptional()
  status?: AccountStatus;

  @ApiPropertyOptional({
    description: '风险等级',
    enum: RiskLevel,
    example: RiskLevel.LOW,
  })
  @IsEnum(RiskLevel)
  @IsOptional()
  riskLevel?: RiskLevel;
}

/**
 * 管理端更新用户 DTO
 * 在 UpdateUserDto 基础上增加信用评分、资产数量限制等管理字段
 */
export class AdminUpdateUserDto extends UpdateUserDto {
  @ApiPropertyOptional({
    description: '信用评分（0-1000）',
    example: 600,
    minimum: 0,
    maximum: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '信用评分不能小于 0' })
  @Max(1000, { message: '信用评分不能大于 1000' })
  creditScore?: number;

  @ApiPropertyOptional({
    description: '每天最多可创建的资产数量',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '每天最多可创建的资产数量不能为负' })
  maxDailyAssetCreationCount?: number;

  @ApiPropertyOptional({
    description: '总资产数量限制（0 表示不限制）',
    example: 50,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '总资产数量限制不能为负' })
  maxTotalAssetCount?: number;

  @ApiPropertyOptional({
    description: '最多可创建的资产实例数量',
    example: 200,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '资产实例数量限制不能为负' })
  maxTotalAssetInventoryCount?: number;
}
