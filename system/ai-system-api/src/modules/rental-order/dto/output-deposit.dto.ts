import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { DepositEntity } from '../entities';
import { OutputDepositDeductionDto } from './output-deposit-deduction.dto';
import { Expose, Transform, Type } from 'class-transformer';

/**
 * 押金输出 DTO
 */
export class OutputDepositDto extends OmitType(DepositEntity, ['deductions'] as const) {
  @ApiProperty({ description: '扣款记录', type: [OutputDepositDeductionDto] })
  @Type(() => OutputDepositDeductionDto)
  @Expose()
  @Transform(({ value }) =>
    (value || []).sort(
      (a: OutputDepositDeductionDto, b: OutputDepositDeductionDto) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  )
  deductions: OutputDepositDeductionDto[] = [];
}

export class OutputDepositEvidenceDto {
  @ApiPropertyOptional({
    description: '凭证 URL 地址列表',
    type: [String],
    example: ['https://example.com/evidence1.jpg', 'https://example.com/evidence2.jpg'],
  })
  @Expose()
  urls?: string[];

  @ApiProperty({ description: '说明', example: '资产在租赁期间损坏，需要赔偿', maxLength: 500 })
  @Expose()
  description: string;
}
