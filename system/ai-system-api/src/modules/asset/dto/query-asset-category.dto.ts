import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '@/common/dtos/base-query.dto';
import { TransformBoolean } from '@/common/decorators/trasform.decorator';

/**
 * 查询资产分类请求 DTO（后台管理用）
 */
export class QueryAssetCategoryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: '关键字搜索（搜索分类名称或代码）',
    example: '电子',
  })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({
    description: '父分类 ID（传 "root" 或不传表示查询根分类）',
    example: 'uuid-of-parent-category',
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({
    description: '是否只查询有效的分类',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;
}

/**
 * App 端获取分类列表请求 DTO
 */
export class AppQueryAssetCategoryDto {
  @ApiPropertyOptional({
    description: '父分类 ID（不传表示获取根分类）',
    example: 'uuid-of-parent-category',
  })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({
    description: '是否包含子分类',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @TransformBoolean()
  includeChildren?: boolean;

  @ApiPropertyOptional({
    description: '子分类深度（当 includeChildren 为 true 时有效，默认为全部深度）',
    example: 2,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value as string, 10) : undefined))
  depth?: number;

  @ApiPropertyOptional({
    description: '是否显示在首页',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @TransformBoolean()
  displayOnHome?: boolean;
}
