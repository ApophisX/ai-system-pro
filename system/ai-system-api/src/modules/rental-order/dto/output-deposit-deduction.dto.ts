import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { DepositDeductionEntity } from '../entities';
import { OutputDepositEvidenceDto } from './output-deposit.dto';
import { OutputUserDto } from '@/modules/base/user/dto';

/**
 * 押金扣款记录输出 DTO
 */
export class OutputDepositDeductionDto extends OmitType(DepositDeductionEntity, [
  'evidence',
  'userResponseEvidence',
  'lessor',
  'lessee',
]) {
  @Expose()
  @ApiProperty({ description: '状态标签' })
  statusLabel: string;

  @ApiProperty({ description: '关联证据', type: () => OutputDepositEvidenceDto })
  @Type(() => OutputDepositEvidenceDto)
  @Expose()
  evidence: OutputDepositEvidenceDto;

  @ApiProperty({ description: '承租方响应凭证', type: () => OutputDepositEvidenceDto })
  @Type(() => OutputDepositEvidenceDto)
  @Expose()
  userResponseEvidence: OutputDepositEvidenceDto;

  @ApiProperty({ description: '出租方', type: () => OutputUserDto })
  @Type(() => OutputUserDto)
  @Expose()
  lessor: OutputUserDto;

  @ApiProperty({ description: '承租方', type: () => OutputUserDto })
  @Type(() => OutputUserDto)
  @Expose()
  lessee: OutputUserDto;
}
