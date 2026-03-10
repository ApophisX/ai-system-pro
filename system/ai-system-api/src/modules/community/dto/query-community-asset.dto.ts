import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from '@/common/dtos/base-query.dto';
import { AppQueryAssetDto } from '@/modules/asset/dto';

/**
 * 社区内资产列表查询 DTO
 */
export class QueryCommunityAssetDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: '资产类型：rental 租赁 / mall 电商', enum: ['rental', 'mall'] })
  @IsOptional()
  @IsEnum(['rental', 'mall'])
  assetType?: 'rental' | 'mall';

  @ApiPropertyOptional({ description: '资产分类 code' })
  @IsOptional()
  categoryCode?: string;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'newest',
    enum: ['createdAt', 'publishAt', 'newest', 'price', 'viewCount', 'rentalCount', 'rating', 'recommend', 'nearby'],
  })
  @IsString()
  @IsOptional()
  sortBy?: AppQueryAssetDto['sortBy'];

  @ApiPropertyOptional({ description: '排序方向', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
