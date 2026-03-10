import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { AssetEntity } from '../entities';
import { AssetRentalPlanEntity } from '../entities/asset-rental-plan.entity';
import { OutputContactDto } from '@/modules/contact/dto';
import { RenewalPolicyDto } from './output-asset-plan.dto';

/**
 * 租赁方案输出 DTO
 */
export class OutputAssetRentalPlanDto extends OmitType(AssetRentalPlanEntity, ['renewalPolicy']) {
  @ApiProperty({ description: '续租规则' })
  @Expose()
  @Type(() => RenewalPolicyDto)
  renewalPolicy: RenewalPolicyDto;

  @ApiProperty({ description: '逾期费用单位标签' })
  @Expose()
  overdueFeeUnitLabel: string;
}

/**
 * 资产分类简要输出 DTO
 */
export class OutputAssetCategoryBriefDto {
  @ApiProperty({ description: '分类 ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: '分类代码' })
  @Expose()
  code: string;

  @ApiProperty({ description: '分类名称' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: '分类图标' })
  @Expose()
  icon?: string;
}

/**
 * 资产标签简要输出 DTO
 */
export class OutputAssetTagBriefDto {
  @ApiProperty({ description: '标签 ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: '标签名称' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: '标签颜色' })
  @Expose()
  color?: string;
}

/**
 * 出租方简要信息 DTO
 */
export class OutputOwnerBriefDto {
  @ApiProperty({ description: '用户 ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: '用户名' })
  @Expose()
  username: string;

  @ApiPropertyOptional({ description: '昵称' })
  @Expose()
  nickname?: string;

  @ApiPropertyOptional({ description: '头像' })
  @Expose()
  avatar?: string;

  @ApiPropertyOptional({ description: '是否实名认证' })
  @Expose()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: '是否企业认证' })
  @Expose()
  isEnterpriseVerified?: boolean;
}

/**
 * 资产详情输出 DTO（App 端详情页）
 */
export class OutputAssetDetailDto extends OmitType(AssetEntity, [
  'tags',
  'rentalPlans',
  'owner',
  'category',
  'contact',
]) {
  // ========== 关联信息 ==========
  @ApiProperty({ description: '分类列表', type: [OutputAssetCategoryBriefDto] })
  @Expose()
  @Type(() => OutputAssetCategoryBriefDto)
  category?: OutputAssetCategoryBriefDto;

  @ApiProperty({ description: '标签列表', type: [OutputAssetTagBriefDto] })
  @Expose()
  @Type(() => OutputAssetTagBriefDto)
  tags?: OutputAssetTagBriefDto[];

  @ApiProperty({
    description: '租赁方案列表',
    type: [OutputAssetRentalPlanDto],
  })
  @Expose()
  @Type(() => OutputAssetRentalPlanDto)
  @Transform(({ value }) => value.sort((a, b) => a.sortOrder - b.sortOrder))
  rentalPlans?: OutputAssetRentalPlanDto[];

  @ApiProperty({ description: '出租方信息', type: OutputOwnerBriefDto })
  @Expose()
  @Type(() => OutputOwnerBriefDto)
  owner?: OutputOwnerBriefDto;

  @ApiProperty({ description: '联系人信息', type: OutputContactDto })
  @Expose()
  @Type(() => OutputContactDto)
  contact?: OutputContactDto;

  // ========== 扩展字段 ==========
  @ApiPropertyOptional({
    description: '当前用户是否已收藏该资产',
    default: false,
  })
  @Expose()
  @Transform(({ value }) => value ?? false)
  isFavorite?: boolean;

  @ApiProperty({ description: '评论数量', default: 0 })
  @Expose()
  @Transform(({ value }) => value ?? 0)
  reviewCount: number;

  // @ApiProperty({ description: '资产距离', default: 0 })
  // @Expose()
  // @Transform(({ value }) => value ?? 0)
  // assetDistance: number;
}

/**
 * 资产列表项输出 DTO（App 端列表展示）
 */
export class OutputAssetListItemDto extends OmitType(OutputAssetDetailDto, []) {
  //
}

/**
 * 我的资产列表项输出 DTO（出租方管理用）
 */
export class OutputMyAssetListItemDto extends OmitType(OutputAssetDetailDto, []) {
  //
}

/**
 * 资产创建统计信息输出 DTO
 */
export class OutputAssetCreationStatsDto {
  @ApiProperty({ description: '今天已创建的资产数量' })
  @Expose()
  todayCount: number;

  @ApiProperty({ description: '总资产数量' })
  @Expose()
  totalCount: number;

  @ApiProperty({ description: '每天最多可创建的资产数量' })
  @Expose()
  maxDailyCount: number;

  @ApiProperty({ description: '总资产数量限制（0 表示不限制）' })
  @Expose()
  maxTotalCount: number;

  @ApiProperty({ description: '今天是否还可以创建资产' })
  @Expose()
  canCreateToday: boolean;

  @ApiProperty({ description: '是否还可以创建资产（总数量限制）' })
  @Expose()
  canCreateTotal: boolean;

  @ApiProperty({ description: '是否可以创建资产（综合判断）' })
  @Expose()
  canCreate: boolean;

  @ApiProperty({ description: '今天剩余可创建数量' })
  @Expose()
  remainingTodayCount: number;
}
