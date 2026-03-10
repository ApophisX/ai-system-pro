import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsArray,
  MaxLength,
  MinLength,
  ArrayMaxSize,
  IsOptional,
  Matches,
  IsIn,
  ArrayMinSize,
} from 'class-validator';
import { REPORT_REASON_VALUES } from '../enums';
import { REPORT_DESCRIPTION_MIN_LENGTH, REPORT_IMAGES_MAX_COUNT } from '../constants/report.constant';

/**
 * 创建举报请求 DTO
 */
export class CreateReportDto {
  @ApiProperty({ description: '被举报资产 ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty({ message: '资产 ID 不能为空' })
  assetId: string;

  @ApiProperty({
    description: '举报原因',
    example: 'fraud',
    enum: REPORT_REASON_VALUES,
  })
  @IsIn(REPORT_REASON_VALUES, { message: '举报原因不合法' })
  @IsNotEmpty({ message: '举报原因必选' })
  reason: string;

  @ApiProperty({
    description: '举报说明（不少于 10 字）',
    example: '价格与页面展示不一致，存在诱导行为',
    minLength: REPORT_DESCRIPTION_MIN_LENGTH,
  })
  @IsString()
  @IsNotEmpty({ message: '举报说明不能为空' })
  @MinLength(REPORT_DESCRIPTION_MIN_LENGTH, {
    message: `举报说明不少于 ${REPORT_DESCRIPTION_MIN_LENGTH} 字`,
  })
  @MaxLength(500, { message: '举报说明不能超过 500 字' })
  description: string;

  @ApiPropertyOptional({
    description: '图片 URL 数组（需先通过 OSS 上传获取，最多 9 张）',
    example: ['xxx/xxx/1.png'],
    maxItems: REPORT_IMAGES_MAX_COUNT,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(REPORT_IMAGES_MAX_COUNT, { message: `图片最多 ${REPORT_IMAGES_MAX_COUNT} 张` })
  @ArrayMinSize(1, { message: '图片至少 1 张' })
  @IsString({ each: true })
  images?: string[];
}
