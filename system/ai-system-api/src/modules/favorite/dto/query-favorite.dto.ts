import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '@/common/dtos/base-query.dto';

/**
 * 查询收藏列表 DTO
 */
export class QueryFavoriteDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: '关键字搜索（搜索资产名称、描述）',
    example: '相机',
  })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({
    description: '资产 ID',
    example: 'uuid-of-asset',
  })
  @IsUUID()
  @IsOptional()
  assetId?: string;
}
