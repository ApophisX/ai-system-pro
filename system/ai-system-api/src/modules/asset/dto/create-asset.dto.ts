import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { AssetEntity } from '../entities';
import { AssetRentalPlanEntity } from '../entities/asset-rental-plan.entity';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * 创建租赁方案 DTO（内嵌在资产创建中）
 */
export class CreateAssetRentalPlanDto extends PickType(AssetRentalPlanEntity, [
  'deposit',
  'rentalPeriod',
  'rentalType',
  'price',
  'penaltyFee',
  'overdueFee',
  'overdueFeeUnit',
  'transferOwnershipAfterRental',
  'isInstallment',
  'sortOrder',
  'minPeriod',
  'name',
  'attributes',
]) {
  // @IsOptional()
  // @ApiPropertyOptional({ description: '租赁方案 ID' })
  // id?: number;
}

/**
 * 创建资产请求 DTO
 */
export class CreateAssetDto extends PickType(AssetEntity, [
  'name',
  'availableQuantity',
  'deliveryMethods',
  'deliveryFee',
  'description',
  'notes',
  'images',
  'detailImages',
  'coverImage',
  'deposit',
  'requireRealName',
  'specifications',
  'attributes',
  'sortOrder',
  'isActive',
  'categoryId',
  'creditFreeDeposit',
  'isBuyable',
  'isMallProduct',
  'autoDelivery',
]) {
  @IsOptional()
  @ApiPropertyOptional({ description: '是否发布，默认发布', default: true })
  publish: boolean = true;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ description: '自定义标签' })
  tags?: string[];

  @IsNotEmpty()
  @ApiProperty({ description: '联系人 ID' })
  contactId: string;

  @IsNotEmpty()
  @IsArray()
  @Type(() => CreateAssetRentalPlanDto)
  @ApiProperty({ type: [CreateAssetRentalPlanDto], description: '租赁计划' })
  rentalPlans: CreateAssetRentalPlanDto[];

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: '社区 ID，传入则创建成功后自动关联该社区' })
  communityId?: string;
}
