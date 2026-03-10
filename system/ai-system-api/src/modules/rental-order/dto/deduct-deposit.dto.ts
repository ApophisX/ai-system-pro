import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * 证据 DTO
 */
export class DepositEvidenceDto {
  @ApiProperty({
    description: '凭证 URL 地址列表',
    type: [String],
    example: ['https://example.com/evidence1.jpg', 'https://example.com/evidence2.jpg'],
  })
  @IsArray()
  @ArrayMinSize(1, { message: '至少需要上传一个凭证' })
  urls: string[];

  @ApiPropertyOptional({
    description: '说明',
    example: '资产在租赁期间损坏，需要赔偿',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '说明不能超过500个字符' })
  description?: string;
}

/**
 * 扣除押金请求 DTO
 */
export class DeductDepositDto {
  @ApiProperty({ description: '押金 ID', example: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  depositId: string;

  @ApiProperty({ description: '扣款金额（元）', example: 100.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: '扣款原因', example: '资产损坏赔偿' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: '扣款说明', example: '资产在租赁期间损坏，需要赔偿' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: '关联证据',
    type: DepositEvidenceDto,
    example: {
      urls: ['https://example.com/evidence1.jpg', 'https://example.com/evidence2.jpg'],
      description: '资产在租赁期间损坏，需要赔偿',
    },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  evidence?: DepositEvidenceDto;

  @ApiPropertyOptional({ description: '操作人 ID', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  operatorId?: string;

  @ApiPropertyOptional({ description: '操作人名称', example: '管理员' })
  @IsOptional()
  @IsString()
  operatorName?: string;
}
