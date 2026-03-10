import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength, ArrayMinSize } from 'class-validator';

/**
 * 强制关闭在租订单请求 DTO
 *
 * 出租方在特殊场景下强制关闭在租订单，必须提交凭证用于留痕。
 * 适用状态：已收货、使用中（含待归还、已归还待确认）。
 */
export class ForceCloseOrderDto {
  @ApiProperty({
    description: '凭证 URL 列表（必须至少一个，用于留痕）',
    type: [String],
    example: ['https://example.com/evidence1.jpg'],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1, { message: '强制关闭订单必须至少上传一个凭证' })
  evidenceUrls: string[];

  @ApiPropertyOptional({ description: '强制关闭原因说明', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: '原因说明不能超过1000个字符' })
  description?: string;
}
