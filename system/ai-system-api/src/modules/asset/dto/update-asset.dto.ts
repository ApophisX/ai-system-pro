import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { CreateAssetDto, CreateAssetRentalPlanDto } from './create-asset.dto';
import { AssetStatus } from '../enums';
import { Type } from 'class-transformer';

/**
 * 更新租赁方案 DTO（内嵌在资产更新中）
 */
export class UpdateAssetRentalPlanDto extends CreateAssetRentalPlanDto {
  @IsNotEmpty()
  @ApiPropertyOptional({ description: '租赁方案 ID' })
  id: number;
}

/**
 * 更新资产请求 DTO
 */
export class UpdateAssetDto extends PartialType(
  OmitType(CreateAssetDto, ['rentalPlans', 'availableQuantity', 'isBuyable', 'isMallProduct']),
) {
  @IsNotEmpty()
  @IsArray()
  @Type(() => UpdateAssetRentalPlanDto)
  @ApiProperty({ type: [UpdateAssetRentalPlanDto], description: '租赁计划' })
  rentalPlans: UpdateAssetRentalPlanDto[];
}

/**
 * 资产上架/下架 DTO
 */
export class ToggleAssetStatusDto {
  @ApiPropertyOptional({
    description: '目标状态',
    enum: [AssetStatus.AVAILABLE, AssetStatus.OFFLINE],
  })
  @IsEnum([AssetStatus.AVAILABLE, AssetStatus.OFFLINE])
  @IsOptional()
  status?: AssetStatus.AVAILABLE | AssetStatus.OFFLINE;
}
