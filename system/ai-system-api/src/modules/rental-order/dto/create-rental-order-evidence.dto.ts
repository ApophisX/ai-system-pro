import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { EvidenceSubmitterType, EvidenceType, RentalOrderStatus } from '../enums';

/**
 * 创建租赁订单凭证请求 DTO
 */
export class CreateRentalOrderEvidenceDto {
  @ApiProperty({ description: '租赁订单 ID' })
  @IsUUID()
  @IsNotEmpty()
  rentalOrderId: string;

  @ApiProperty({ description: '提交者类型：lessor（出租方）/ lessee（承租方）', enum: EvidenceSubmitterType })
  @IsEnum(EvidenceSubmitterType)
  @IsNotEmpty()
  submitterType: EvidenceSubmitterType;

  @ApiProperty({
    description: '凭证 URL 列表（支持多个凭证）',
    type: [String],
    example: ['https://example.com/evidence1.jpg', 'https://example.com/evidence2.jpg'],
  })
  @IsArray()
  @ArrayMinSize(1, { message: '至少需要上传一个凭证' })
  @IsUrl({}, { each: true, message: '凭证 URL 格式不正确' })
  @IsNotEmpty()
  evidenceUrls: string[];

  @ApiPropertyOptional({ description: '凭证描述', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: '凭证描述不能超过1000个字符' })
  description?: string;

  @ApiPropertyOptional({
    description: '凭证类型',
    enum: EvidenceType,
  })
  @IsOptional()
  @IsEnum(EvidenceType)
  evidenceType?: EvidenceType;

  @ApiPropertyOptional({
    description: '关联的订单状态（可选，用于标识是在哪个状态变化时提交的）',
    enum: RentalOrderStatus,
  })
  @IsOptional()
  @IsEnum(RentalOrderStatus)
  relatedOrderStatus?: RentalOrderStatus;
}
