import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '@/common/dtos/base-query.dto';
import { UserType, VerificationStatus, EnterpriseVerificationStatus, AccountStatus, RiskLevel } from '../enums';

/**
 * 查询用户列表 DTO（管理端）
 */
export class QueryUserDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: '关键字搜索（搜索用户名、昵称、手机号、邮箱）',
    example: '张三',
  })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({
    description: '用户类型',
    enum: UserType,
    example: UserType.PERSONAL,
  })
  @IsEnum(UserType)
  @IsOptional()
  userType?: UserType;

  @ApiPropertyOptional({
    description: '实名认证状态',
    enum: VerificationStatus,
    example: VerificationStatus.VERIFIED,
  })
  @IsEnum(VerificationStatus)
  @IsOptional()
  verificationStatus?: VerificationStatus;

  @ApiPropertyOptional({
    description: '企业认证状态（用于筛选待审核列表）',
    enum: EnterpriseVerificationStatus,
    example: EnterpriseVerificationStatus.PENDING,
  })
  @IsEnum(EnterpriseVerificationStatus)
  @IsOptional()
  enterpriseVerificationStatus?: EnterpriseVerificationStatus;

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

  @ApiPropertyOptional({
    description: '注册开始时间',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: '注册结束时间',
    example: '2024-12-31',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'createdAt',
    enum: ['createdAt', 'lastLoginAt', 'creditScore'],
  })
  @IsString()
  @IsOptional()
  sortBy?: 'createdAt' | 'lastLoginAt' | 'creditScore';

  @ApiPropertyOptional({
    description: '排序方向',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 企业用户申请列表查询 DTO（管理端分页）
 * 仅用于 GET /admin/user/enterprise-applications，固定为 userType=ENTERPRISE
 */
export class QueryEnterpriseApplicationDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: '关键字搜索（用户名、手机、邮箱、企业名称、法人）',
    example: '某某科技',
  })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({
    description: '企业认证状态，不传默认查待审核（pending）',
    enum: EnterpriseVerificationStatus,
    example: EnterpriseVerificationStatus.PENDING,
  })
  @IsEnum(EnterpriseVerificationStatus)
  @IsOptional()
  enterpriseVerificationStatus?: EnterpriseVerificationStatus;

  @ApiPropertyOptional({ description: '申请/注册开始时间', example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: '申请/注册结束时间', example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: '排序字段',
    enum: ['createdAt', 'lastLoginAt', 'creditScore'],
  })
  @IsString()
  @IsOptional()
  sortBy?: 'createdAt' | 'lastLoginAt' | 'creditScore';

  @ApiPropertyOptional({ description: '排序方向', enum: ['ASC', 'DESC'] })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 搜索用户 DTO（App 端，用于搜索其他用户）
 */
export class SearchUserDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: '关键字搜索（搜索昵称、用户名）',
    example: '张三',
  })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({
    description: '用户类型',
    enum: UserType,
    example: UserType.PERSONAL,
  })
  @IsEnum(UserType)
  @IsOptional()
  userType?: UserType;

  @ApiPropertyOptional({
    description: '只显示已认证用户',
    example: 'true',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  verifiedOnly?: boolean;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'creditScore',
    enum: ['createdAt', 'creditScore'],
  })
  @IsString()
  @IsOptional()
  sortBy?: 'createdAt' | 'creditScore';

  @ApiPropertyOptional({
    description: '排序方向',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
