import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { AssetInventoryEntity } from '../entities/asset-inventory.entity';
import { IsOptional, IsString, Max, Min, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * 创建资产实例请求 DTO
 */
export class CreateAssetInventoryDto extends PickType(AssetInventoryEntity, [
  'assetId',
  'instanceCode',
  'instanceName',
  'longitude',
  'latitude',
  'attributes',
  'status',
  'images',
]) {
  /**
   * 批量创建的数量
   */
  @ApiPropertyOptional({ description: '批量创建的数量', default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @Min(1)
  @Max(100)
  quantity?: number;

  /**
   * 是否是批量创建
   */
  @ApiPropertyOptional({ description: '是否是批量创建', default: false })
  @IsOptional()
  @Transform(({ value }) => (value ? Boolean(value) : false))
  isBatchCreate?: boolean;

  /**
   * 实例编号前缀（批量创建时与序列号组成唯一编号，如 INV 得到 INV1、INV2）
   */
  @ApiPropertyOptional({ description: '实例编号前缀，批量创建时使用', default: 'INV' })
  @IsOptional()
  @IsString()
  @MaxLength(6)
  codePrefix?: string;
}
