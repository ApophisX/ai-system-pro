import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AssetCategoryEntity } from '../entities';

/**
 * 资产分类输出 DTO（基础信息）
 */
export class OutputAssetCategoryDto {
  @ApiProperty({ description: '分类 ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: '分类代码' })
  @Expose()
  code: string;

  @ApiProperty({ description: '分类名称' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: '分类描述' })
  @Expose()
  description?: string;

  @ApiPropertyOptional({ description: '分类图标' })
  @Expose()
  icon?: string;

  @ApiProperty({ description: '排序权重' })
  @Expose()
  sortOrder: number;

  @ApiPropertyOptional({ description: '分类属性' })
  @Expose()
  attributes?: Record<string, unknown>;

  @ApiProperty({ description: '是否有效' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: '创建时间' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @Expose()
  updatedAt: Date;
}

/**
 * 资产分类树形输出 DTO（包含子分类）
 */
export class OutputAssetCategoryTreeDto extends OutputAssetCategoryDto {
  @ApiPropertyOptional({
    description: '子分类列表',
    type: [OutputAssetCategoryTreeDto],
  })
  @Expose()
  @Type(() => OutputAssetCategoryTreeDto)
  children?: OutputAssetCategoryTreeDto[];
}

/**
 * 资产分类详情输出 DTO（后台管理用，包含更多字段）
 */
export class OutputAssetCategoryDetailDto extends OutputAssetCategoryDto {
  @ApiPropertyOptional({
    description: '父分类信息',
    type: OutputAssetCategoryDto,
  })
  @Expose()
  @Type(() => OutputAssetCategoryDto)
  parent?: OutputAssetCategoryDto;

  @ApiPropertyOptional({
    description: '子分类列表',
    type: [OutputAssetCategoryDto],
  })
  @Expose()
  @Type(() => OutputAssetCategoryDto)
  children?: OutputAssetCategoryDto[];

  @ApiPropertyOptional({ description: '创建者' })
  @Expose()
  createdBy?: string;

  @ApiPropertyOptional({ description: '更新者' })
  @Expose()
  updatedBy?: string;

  @ApiPropertyOptional({ description: '备注' })
  @Expose()
  remark?: string;
}

/**
 * App 端分类列表项 DTO（精简信息）
 */
export class AppOutputAssetCategoryDto extends PickType(AssetCategoryEntity, [
  'id',
  'code',
  'name',
  'icon',
  'sortOrder',
  'description',
  'attributes',
  'displayOnHome',
]) {
  @ApiPropertyOptional({ description: '是否有子分类' })
  @Expose()
  hasChildren?: boolean;
}

/**
 * App 端分类树形输出 DTO
 */
export class AppOutputAssetCategoryTreeDto extends AppOutputAssetCategoryDto {
  @ApiPropertyOptional({
    description: '子分类列表',
    type: [AppOutputAssetCategoryTreeDto],
  })
  @Expose()
  @Type(() => AppOutputAssetCategoryTreeDto)
  children?: AppOutputAssetCategoryTreeDto[];
}
