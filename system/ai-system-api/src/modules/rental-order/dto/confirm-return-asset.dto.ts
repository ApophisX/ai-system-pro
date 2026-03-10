import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  IsArray,
  ArrayMaxSize,
  IsDateString,
} from 'class-validator';

/**
 * 出租方确认归还资产请求 DTO
 *
 * 出租方在订单归还状态为「已归还待确认」时，对承租方的归还申请进行确认或拒绝。
 */
export class ConfirmReturnAssetDto {
  @ApiProperty({ description: '实际归还时间', example: true })
  @IsDateString()
  @IsNotEmpty({ message: '实际归还时间不能为空' })
  actualReturnedAt: string;

  @ApiProperty({ description: '是否确认归还', example: true })
  @IsBoolean()
  @IsNotEmpty()
  confirmed: boolean;

  @ApiPropertyOptional({
    description: '归还说明（确认归还时可选）',
    example: '资产已确认归还，完好无损',
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500, { message: '归还说明不能超过500个字符' })
  @ValidateIf(o => o.confirmed === false)
  description?: string;

  @ApiPropertyOptional({
    description: '确认凭证图片 URL 列表（确认归还时可选，最多9张）',
    type: [String],
    example: ['https://example.com/confirm1.jpg', 'https://example.com/confirm2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(9, { message: '最多上传9张图片' })
  @ValidateIf(o => o.confirmed === true)
  evidenceUrls?: string[];
}
