import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { BaseQueryDto } from '@/common/dtos/base-query.dto';
import { EvidenceSubmitterType, EvidenceAuditStatus, EvidenceType, RentalOrderStatus } from '../enums';
import { Expose } from 'class-transformer';

/**
 * 查询租赁订单凭证请求 DTO
 */
export class QueryRentalOrderEvidenceDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: '租赁订单 ID' })
  @IsUUID()
  @IsOptional()
  @Expose()
  rentalOrderId?: string;

  @ApiPropertyOptional({ description: '提交者 ID' })
  @IsUUID()
  @IsOptional()
  @Expose()
  submitterId?: string;

  @ApiPropertyOptional({ description: '提交者类型', enum: EvidenceSubmitterType })
  @IsEnum(EvidenceSubmitterType)
  @IsOptional()
  @Expose()
  submitterType?: EvidenceSubmitterType;

  @ApiPropertyOptional({ description: '审核状态', enum: EvidenceAuditStatus })
  @IsEnum(EvidenceAuditStatus)
  @IsOptional()
  @Expose()
  auditStatus?: EvidenceAuditStatus;

  @ApiPropertyOptional({ description: '凭证类型', enum: EvidenceType })
  @IsEnum(EvidenceType)
  @IsOptional()
  @Expose()
  evidenceType?: EvidenceType;

  @ApiPropertyOptional({ description: '关联的订单状态', enum: RentalOrderStatus })
  @IsEnum(RentalOrderStatus)
  @IsOptional()
  @Expose()
  relatedOrderStatus?: RentalOrderStatus;
}
