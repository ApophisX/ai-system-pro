import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsUrl, MaxLength, ArrayMinSize } from 'class-validator';

/**
 * 结束订单请求 DTO
 *
 * 用于出租方结束订单时提交凭证数据
 */
export class EndOrderDto {
  @ApiPropertyOptional({
    description: '凭证 URL 列表（支持多个凭证）',
    type: [String],
    example: ['https://example.com/evidence1.jpg', 'https://example.com/evidence2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: '至少需要上传一个凭证' })
  @IsUrl({}, { each: true, message: '凭证 URL 格式不正确' })
  evidenceUrls?: string[];

  @ApiPropertyOptional({ description: '凭证描述', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: '凭证描述不能超过1000个字符' })
  description?: string;
}
