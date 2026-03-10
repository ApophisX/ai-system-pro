import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsUUID, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '@/common/dtos/base-query.dto';
import { AssetAuditStatus, AssetStatus, RentalType } from '../enums';

/**
 * App 端资产列表查询 DTO
 */
export class AppQueryAssetDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: '纬度',
    example: 22.55,
  })
  @Transform(({ value }) => (value ? parseFloat(value as string) : undefined))
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    description: '经度',
    example: 114.05,
  })
  @Transform(({ value }) => (value ? parseFloat(value as string) : undefined))
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({
    description: '关键字搜索（搜索资产名称、描述）',
    example: '相机',
  })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({
    description: '分类 ID',
    example: 'uuid-of-category',
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: '分类代码',
    example: 'ELECTRONICS',
  })
  @IsString()
  @IsOptional()
  categoryCode?: string;

  @ApiPropertyOptional({
    description: '租赁方式',
    enum: RentalType,
    example: RentalType.DAILY,
  })
  @IsEnum(RentalType)
  @IsOptional()
  rentalType?: RentalType;

  @ApiPropertyOptional({
    description: '最低价格（单位：分）',
    example: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value as string, 10) : undefined))
  minPrice?: number;

  @ApiPropertyOptional({
    description: '最高价格（单位：分）',
    example: 100000,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value as string, 10) : undefined))
  maxPrice?: number;

  @ApiPropertyOptional({
    description: '省份代码',
    example: '440300',
  })
  @IsString()
  @IsOptional()
  provinceCode?: string;

  @ApiPropertyOptional({
    description: '城市代码',
    example: '440300',
  })
  @IsString()
  @IsOptional()
  cityCode?: string;

  @ApiPropertyOptional({
    description: '区县代码',
    example: '440305',
  })
  @IsString()
  @IsOptional()
  districtCode?: string;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'newest',
    enum: ['createdAt', 'publishAt', 'newest', 'price', 'viewCount', 'rentalCount', 'rating', 'recommend', 'nearby'],
  })
  @IsString()
  @IsOptional()
  sortBy?:
    | 'createdAt'
    | 'publishAt'
    | 'newest'
    | 'price'
    | 'viewCount'
    | 'rentalCount'
    | 'rating'
    | 'recommend'
    | 'nearby';

  @ApiPropertyOptional({
    description: '排序方向',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: '出租人 ID',
    example: 'uuid-of-lessor',
  })
  @IsUUID()
  @IsOptional()
  lessorId?: string;
}

/**
 * 我的资产列表查询 DTO（出租方）
 */
export class MyAssetQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: '资产状态',
    enum: AssetStatus,
    example: AssetStatus.AVAILABLE,
  })
  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;

  @ApiPropertyOptional({
    description: '审核状态',
    enum: AssetAuditStatus,
    default: AssetAuditStatus.PENDING,
  })
  @IsEnum(AssetAuditStatus)
  @IsOptional()
  auditStatus?: AssetAuditStatus;

  @ApiPropertyOptional({
    description: '关键字搜索',
    example: '相机',
  })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({
    description: '分类 ID',
    example: 'uuid-of-category',
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
