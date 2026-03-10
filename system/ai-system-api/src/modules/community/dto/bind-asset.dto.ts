import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

/**
 * 绑定资产到社区请求 DTO
 */
export class BindAssetDto {
  @ApiProperty({ description: '资产 ID' })
  @IsNotEmpty()
  @IsUUID()
  assetId: string;

  @ApiPropertyOptional({ description: '在社区内的排序权重', default: 0 })
  @IsOptional()
  sortOrder?: number = 0;
}
