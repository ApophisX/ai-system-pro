import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

/**
 * 创建收藏请求 DTO
 */
export class CreateFavoriteDto {
  @ApiProperty({ description: '资产 ID', example: 'uuid-of-asset' })
  @IsUUID()
  @IsNotEmpty()
  assetId: string;
}
