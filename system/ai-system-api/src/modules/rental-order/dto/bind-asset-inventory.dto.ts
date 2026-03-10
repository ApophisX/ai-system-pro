import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * 绑定资产实例 DTO（出租方为订单绑定资产实例）
 *
 * 前置条件：订单状态为「待收货」(PAID)，资产实例状态为「可用」
 */
export class BindAssetInventoryDto {
  @ApiProperty({ description: '资产实例 ID', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  @IsUUID()
  @IsNotEmpty({ message: '请选择要绑定的资产实例' })
  inventoryId: string;

  @ApiPropertyOptional({
    description: '绑定资产时拍摄的照片，支持多个凭证',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  })
  @IsOptional()
  @IsArray()
  evidenceUrls?: string[];

  @ApiPropertyOptional({ description: '凭证描述', example: '凭证描述' })
  @IsOptional()
  @IsString()
  description?: string;
}
