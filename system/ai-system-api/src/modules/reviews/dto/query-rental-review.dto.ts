import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { BaseQueryDto } from '@/common/dtos/base-query.dto';
import { RentalReviewStatus } from '../enums';

/**
 * 评分筛选枚举
 */
export enum ScoreRangeFilter {
  /** 全部 */
  ALL = 'all',
  /** 好评 4-5 */
  GOOD = 'good',
  /** 中评 3 */
  MEDIUM = 'medium',
  /** 差评 1-2 */
  BAD = 'bad',
  /** 有图 */
  WITH_IMAGE = 'withImage',
}

/**
 * 查询租赁评价请求 DTO
 */
export class QueryRentalReviewDto extends BaseQueryDto {
  @ApiProperty({ description: '资产 ID', example: 'uuid-of-asset' })
  @IsUUID()
  assetId: string;

  @ApiPropertyOptional({
    description: '状态（公开接口固定为 approved）',
    enum: RentalReviewStatus,
  })
  @IsOptional()
  @IsEnum(RentalReviewStatus)
  status?: RentalReviewStatus;

  @ApiPropertyOptional({
    description: '评分筛选：all-全部 / good-好评(4-5) / medium-中评(3) / bad-差评(1-2) / withImage-有图',
    enum: ScoreRangeFilter,
  })
  @IsOptional()
  @IsEnum(ScoreRangeFilter)
  scoreRange?: ScoreRangeFilter = ScoreRangeFilter.ALL;
}
