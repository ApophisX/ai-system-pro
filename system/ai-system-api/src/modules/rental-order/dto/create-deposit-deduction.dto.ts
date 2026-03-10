import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsObject,
  Min,
  ValidateIf,
  ArrayMinSize,
  IsArray,
  Validate,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DepositEvidenceDto } from './deduct-deposit.dto';

/**
 * 创建押金扣款申请 DTO
 *
 * 出租方发起押金扣款申请
 * - 必须提交扣款说明
 * - 至少提供一项凭证（图片/视频/文件）
 */
export class CreateDepositDeductionDto {
  @ApiProperty({ description: '扣款金额（元）', example: 100.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ description: '扣款原因', example: '资产损坏赔偿' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty({ description: '扣款说明（必填）', example: '资产在租赁期间损坏，需要赔偿' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: '关联证据，必填',
    required: true,
    example: {
      urls: ['https://example.com/evidence1.jpg', 'https://example.com/evidence2.jpg'],
      description: '资产在租赁期间损坏，需要赔偿',
    },
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1, { message: '至少需要上传一个凭证' })
  @ArrayMaxSize(9, { message: '最多可以上传9个凭证' })
  evidenceUrls: string[];
}
