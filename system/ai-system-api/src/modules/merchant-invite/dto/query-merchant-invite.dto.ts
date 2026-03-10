import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { MerchantInviteRewardType, MerchantInviteRewardStatus } from '../enums';
import { PaginationQueryDto } from '@/common/dtos/base-query.dto';

/** 奖励列表查询 */
export class QueryMerchantInviteRewardDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '奖励类型' })
  @IsOptional()
  @IsEnum(MerchantInviteRewardType)
  type?: MerchantInviteRewardType;

  @ApiPropertyOptional({ description: '奖励状态' })
  @IsOptional()
  @IsEnum(MerchantInviteRewardStatus)
  status?: MerchantInviteRewardStatus;
}

/** 排行榜查询 */
export class QueryInviteRankDto {
  @ApiPropertyOptional({ description: '周期：monthly | quarterly | yearly', default: 'monthly' })
  @IsOptional()
  period?: 'monthly' | 'quarterly' | 'yearly' = 'monthly';

  @ApiPropertyOptional({ description: '年份' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({ description: '月份（period=monthly 时有效）' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month?: number;

  @ApiPropertyOptional({ description: '返回条数', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}
