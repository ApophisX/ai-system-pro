import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Trim } from '@/common/decorators/trim.decorator';
import { CommunityType, CommunityStatus } from '../enums';

/**
 * 社区列表查询 DTO（用户端）
 */
export class QueryCommunityDto {
  @ApiPropertyOptional({ description: '关键字搜索（社区名称、描述）', example: '摄影' })
  @IsOptional()
  @IsString()
  @Trim()
  keyword?: string;

  @ApiPropertyOptional({ description: '页码', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  page?: number = 0;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: '社区类型', enum: CommunityType })
  @IsOptional()
  @IsEnum(CommunityType)
  type?: CommunityType;

  @ApiPropertyOptional({ description: '仅已加入', default: undefined })
  @IsOptional()
  @Type(() => Boolean)
  joined?: boolean;

  @ApiPropertyOptional({ description: '排序字段', enum: ['memberCount', 'assetCount', 'createdAt'] })
  @IsOptional()
  @IsEnum(['memberCount', 'assetCount', 'createdAt'])
  sort?: 'memberCount' | 'assetCount' | 'createdAt' = 'createdAt';

  @ApiPropertyOptional({ description: '排序方向', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}

/**
 * 管理端社区查询 DTO
 */
export class QueryCommunityAdminDto extends QueryCommunityDto {
  @ApiPropertyOptional({ description: '社区状态', enum: CommunityStatus })
  @IsOptional()
  @IsEnum(CommunityStatus)
  status?: CommunityStatus;
}
