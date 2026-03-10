import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 管理员审核争议押金扣除请求 DTO
 *
 * 仅当状态为【待审核】的扣款可被审核；
 * 通过时可选择是否调整扣除金额（不得大于原申请金额与押金可用余额的较小值）。
 */
export class ReviewDepositDeductionDto {
  @ApiProperty({
    description: '是否通过审核',
    example: true,
  })
  @IsBoolean()
  @Type(() => Boolean)
  approved: boolean;

  @ApiPropertyOptional({
    description:
      '审核通过时的认定扣除金额（元）。不传则使用原申请金额；传则必须大于 0，且不超过原申请金额与押金可用余额的较小值',
    example: 100.5,
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01, { message: '认定扣除金额必须大于 0' })
  @Max(999999.99, { message: '认定扣除金额超出范围' })
  @Type(() => Number)
  approvedAmount?: number;

  @ApiPropertyOptional({
    description: '审核说明（通过或拒绝均可填写）',
    example: '经核实证据充分，同意按申请金额扣除。',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  auditDescription?: string;
}
