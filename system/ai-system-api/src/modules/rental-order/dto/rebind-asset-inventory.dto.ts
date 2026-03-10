import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * 换绑资产实例 DTO（出租方将订单从当前实例换绑到新实例）
 *
 * 前置条件：订单状态为「待收货」(PAID)，且订单已绑定过资产实例；
 * 目标实例须属于同一资产且状态为「可用」。
 * 支持上传换绑留痕图片，用于记录与争议追溯。
 */
export class RebindAssetInventoryDto {
  @ApiProperty({ description: '目标资产实例 ID（换绑后绑定的实例）', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  @IsUUID()
  @IsNotEmpty({ message: '请选择要换绑到的资产实例' })
  inventoryId: string;

  @ApiPropertyOptional({ description: '换绑原因/备注', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({
    description: '换绑留痕图片 URL 列表，用于记录与争议追溯，最多 9 张',
    type: [String],
    example: ['https://example.com/rebind1.jpg', 'https://example.com/rebind2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(9, { message: '最多可上传 9 张留痕图片' })
  evidenceUrls?: string[];

  @ApiPropertyOptional({ description: '换绑凭证描述', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
