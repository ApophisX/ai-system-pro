import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQueryDto } from '@/common/dtos/base-query.dto';
import { AssetAuditStatus, AssetStatus } from '../enums';

/**
 * 后台查询资产列表 DTO（管理员）
 *
 * 支持按商家、资产状态、审核状态、分类、关键字等筛选
 */
export class QueryAssetAdminDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: '出租方/商家 ID',
    example: 'uuid-of-owner',
  })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({
    description: '资产状态',
    enum: AssetStatus,
  })
  @IsOptional()
  @IsEnum(AssetStatus)
  @Type(() => String)
  status?: AssetStatus;

  @ApiPropertyOptional({
    description: '审核状态',
    enum: AssetAuditStatus,
  })
  @IsOptional()
  @IsEnum(AssetAuditStatus)
  @Type(() => String)
  auditStatus?: AssetAuditStatus;

  @ApiPropertyOptional({
    description: '分类 ID',
    example: 'uuid-of-category',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  // keyword 继承自 BaseQueryDto，用于搜索资产名称、描述
}
