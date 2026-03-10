import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  IsArray,
  IsUrl,
  ArrayMinSize,
} from 'class-validator';

/**
 * 出租方同意/拒绝取消订单请求 DTO
 */
export class ApproveCancelOrderDto {
  @ApiProperty({ description: '是否同意取消', example: true })
  @IsBoolean()
  @IsNotEmpty()
  approved: boolean;

  @ApiPropertyOptional({ description: '拒绝原因（当 approved 为 false 时）', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @ValidateIf((object: ApproveCancelOrderDto) => object.approved === false)
  reason?: string;

  @ApiPropertyOptional({
    description: '凭证图片 URL 列表（当拒绝时可选，用于提供拒绝理由的凭证）',
    type: [String],
    example: ['https://example.com/evidence1.jpg', 'https://example.com/evidence2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsOptional()
  evidenceUrls?: string[];
}
