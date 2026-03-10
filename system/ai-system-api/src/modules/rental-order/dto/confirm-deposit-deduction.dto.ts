import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsObject,
  ValidateIf,
  ArrayMinSize,
  IsArray,
  IsUrl,
  MaxLength,
  ValidateNested,
  IsUUID,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DepositEvidenceDto } from './deduct-deposit.dto';

/**
 * 承租方响应类型枚举
 */
export enum DepositDeductionResponseType {
  /**
   * 同意
   */
  APPROVED = 'approved',
  /**
   * 拒绝
   */
  REJECTED = 'rejected',
}

/**
 * 确认押金扣款申请 DTO
 *
 * 承租方对押金扣款申请进行确认
 * - 同意：记录承租方同意信息，状态自动标记为平台已审核，审核原因填写用户同意说明
 * - 拒绝：必须提交拒绝说明或凭证，状态标记为【用户拒绝】
 */
export class ConfirmDepositDeductionDto {
  @ApiProperty({
    description: '押金扣款申请 ID',
    example: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  deductionId: string;

  @ApiProperty({
    description: '响应类型（同意/拒绝）',
    enum: DepositDeductionResponseType,
    example: DepositDeductionResponseType.APPROVED,
  })
  @IsNotEmpty()
  @IsEnum(DepositDeductionResponseType)
  responseType: DepositDeductionResponseType;

  @ApiPropertyOptional({
    description: '响应说明（同意或拒绝的说明）',
    example: '我同意此扣款申请',
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500, { message: '响应说明不能超过500个字符' })
  @ValidateIf(o => o.responseType === DepositDeductionResponseType.REJECTED)
  description?: string;

  @ApiPropertyOptional({
    description: '响应凭证（拒绝时必填，同意时可选）',
    example: {
      urls: ['https://example.com/evidence1.jpg'],
      description: '资产完好无损',
    },
  })
  @ValidateIf(o => o.responseType === DepositDeductionResponseType.REJECTED)
  @IsNotEmpty({ message: '拒绝时必须提供凭证' })
  @IsArray()
  @ArrayMinSize(1, { message: '至少需要上传一个凭证' })
  @ArrayMaxSize(9, { message: '最多可以上传9个凭证' })
  evidenceUrls?: string[];
}
