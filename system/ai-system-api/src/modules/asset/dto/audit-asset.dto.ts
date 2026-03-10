import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 资产审核结果
 */
export enum AssetAuditAction {
  /** 审核通过 */
  APPROVE = 'approve',
  /** 审核拒绝 */
  REJECT = 'reject',
}

/**
 * 资产审核请求 DTO
 */
export class AuditAssetDto {
  @ApiProperty({
    description: '审核操作：approve（通过）/ reject（拒绝）',
    enum: AssetAuditAction,
  })
  @IsEnum(AssetAuditAction)
  @IsNotEmpty()
  action: AssetAuditAction;

  @ApiPropertyOptional({
    description: '审核意见/备注，拒绝时建议填写',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  auditRemark?: string;
}
