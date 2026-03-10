import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, IsString, MaxLength, ArrayMaxSize, ArrayMinSize } from 'class-validator';

/**
 * 承租方归还资产请求 DTO
 *
 * 承租方在订单处于「使用中」状态时，可提交归还申请。
 * 提交归还后，订单归还状态进入「已归还待确认」，固定归还时间为承租方提交归还的时间（作为计费停止时间）。
 */
export class ReturnAssetDto {
  @ApiProperty({
    description: '归还凭证图片 URL 列表，至少上传1张图片，最多上传9张图片',
    type: [String],
    example: ['https://example.com/return1.jpg', 'https://example.com/return2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(9, { message: '最多上传9张图片' })
  @ArrayMinSize(1, { message: '至少上传1张图片' })
  evidenceUrls?: string[];

  @ApiPropertyOptional({
    description: '归还说明（选填）',
    example: '资产已归还，完好无损',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '归还说明不能超过500个字符' })
  description?: string;
}
