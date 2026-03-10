import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EvidenceAuditStatus } from '../enums';

/**
 * 更新租赁订单凭证请求 DTO
 *
 * 主要用于审核凭证
 */
export class UpdateRentalOrderEvidenceDto {
  @ApiPropertyOptional({ description: '审核状态', enum: EvidenceAuditStatus })
  @IsEnum(EvidenceAuditStatus)
  @IsOptional()
  auditStatus?: EvidenceAuditStatus;

  @ApiPropertyOptional({ description: '审核意见（审核拒绝时填写）', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '审核意见不能超过500个字符' })
  auditRemark?: string;
}
