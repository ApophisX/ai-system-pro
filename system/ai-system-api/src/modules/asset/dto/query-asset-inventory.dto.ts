import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsUUID, IsNotEmpty } from 'class-validator';
import { PaginationQueryDto } from '@/common/dtos/base-query.dto';
import { AssetInventoryStatus } from '../enums';

/**
 * 查询资产实例列表 DTO
 */
export class QueryAssetInventoryDto extends PaginationQueryDto {
  @ApiProperty({
    description: '资产 ID',
    example: 'uuid-of-asset',
  })
  @IsUUID()
  @IsNotEmpty()
  assetId: string;

  @ApiPropertyOptional({
    description: '实例编号',
    example: 'A001',
  })
  @IsString()
  @IsOptional()
  instanceCode?: string;

  @ApiPropertyOptional({
    description: '实例状态',
    enum: AssetInventoryStatus,
    example: AssetInventoryStatus.AVAILABLE,
  })
  @IsEnum(AssetInventoryStatus)
  @IsOptional()
  status?: AssetInventoryStatus;

  @ApiPropertyOptional({
    description: '关键字搜索（搜索实例编号、实例名称）',
    example: 'A001',
  })
  @IsString()
  @IsOptional()
  keyword?: string;
}
