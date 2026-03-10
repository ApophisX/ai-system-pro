import { ApiProperty, ApiPropertyOptional, OmitType, PickType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AssetInventoryEntity } from '../entities/asset-inventory.entity';
import { OutputUserBriefDto } from '@/modules/base/user/dto';
import { OutputUserForLessorDto } from '@/modules/base/user/dto/output-user.dto';
import { OutputRentalOrderDto } from '@/modules/rental-order/dto';
import { BASE_ENTITY_OMIT_FIELDS } from '@/infrastructure/database';

/**
 * 资产简要信息 DTO（用于关联展示）
 */
export class OutputAssetBriefDto {
  @ApiProperty({ description: '资产 ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: '资产名称' })
  @Expose()
  name?: string;

  @ApiPropertyOptional({ description: '资产封面图' })
  @Expose()
  coverImage?: string;
}

export class SimpleOutputAssetInventoryDto extends PickType(AssetInventoryEntity, [
  'id',
  'instanceCode',
  'images',
  'instanceName',
  'status',
  'latitude',
  'longitude',
  'statusLabel',
  'attributes',
]) {}

/**
 * 资产实例输出 DTO
 */
export class OutputAssetInventoryDto extends OmitType(AssetInventoryEntity, ['asset', 'lessor', 'lessee']) {
  @ApiPropertyOptional({ description: '资产信息', type: OutputAssetBriefDto })
  @Expose()
  @Type(() => OutputAssetBriefDto)
  asset?: OutputAssetBriefDto;

  @ApiPropertyOptional({ description: '出租人信息', type: OutputUserBriefDto })
  @Expose()
  @Type(() => OutputUserBriefDto)
  lessor?: OutputUserBriefDto | null = null;

  @ApiPropertyOptional({ description: '承租人信息', type: OutputUserForLessorDto })
  @Expose()
  @Type(() => OutputUserForLessorDto)
  lessee?: OutputUserForLessorDto | null = null;

  @ApiProperty({ description: '空闲时长（秒）', example: 0 })
  @Expose()
  idleDuration: number;

  @ApiPropertyOptional({ description: '关联订单', type: () => OutputRentalOrderDto })
  @Expose()
  @Type(() => OutputRentalOrderDto)
  order?: OutputRentalOrderDto | null = null;
}

export class OutputAssetInventorySnapshotDto extends OmitType(OutputAssetInventoryDto, [
  'order',
  'asset',
  'lessor',
  'lessee',
  ...BASE_ENTITY_OMIT_FIELDS,
] as const) {}

export class OutputAssetInventoryDtoWithRentalOrder extends OmitType(OutputAssetInventoryDto, ['order']) {}
