import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { CreditAccountEntity } from '../entities';

export class OutputCreditAccountDto extends OmitType(CreditAccountEntity, ['createdAt', 'updatedAt'] as const) {
  @ApiPropertyOptional({ description: '是否免押（仅承租方有效）' })
  depositFree?: boolean;

  @ApiPropertyOptional({ description: '押金比例 0-1（仅承租方有效）' })
  depositRatio?: number;

  @ApiPropertyOptional({ description: '是否支持分期（仅承租方有效）' })
  installmentAllowed?: boolean;
}
