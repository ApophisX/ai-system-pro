import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQueryDto } from '@/common/dtos/base-query.dto';
import { RentalReviewStatus } from '../enums';
import { ScoreRangeFilter } from './query-rental-review.dto';

/**
 * 后台查询租赁评价列表 DTO（管理员）
 *
 * 支持按状态、资产、出租方、评分筛选，关键字搜索评论内容
 */
export class QueryRentalReviewAdminDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: '评价状态',
    enum: RentalReviewStatus,
  })
  @IsOptional()
  @IsEnum(RentalReviewStatus)
  @Type(() => String)
  status?: RentalReviewStatus;

  @ApiPropertyOptional({
    description: '资产 ID',
    example: 'uuid-of-asset',
  })
  @IsOptional()
  @IsUUID()
  assetId?: string;

  @ApiPropertyOptional({
    description: '出租方 ID',
    example: 'uuid-of-lessor',
  })
  @IsOptional()
  @IsUUID()
  lessorId?: string;

  @ApiPropertyOptional({
    description: '评分筛选：all-全部 / good-好评(4-5) / medium-中评(3) / bad-差评(1-2) / withImage-有图',
    enum: ScoreRangeFilter,
  })
  @IsOptional()
  @IsEnum(ScoreRangeFilter)
  @Type(() => String)
  scoreRange?: ScoreRangeFilter;

  // keyword 继承自 BaseQueryDto，用于搜索评论内容
}
