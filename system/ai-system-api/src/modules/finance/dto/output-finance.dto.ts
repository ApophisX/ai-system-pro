import { ApiProperty, OmitType } from '@nestjs/swagger';
import { LessorFinanceEntity } from '../entities/lessor-finance.entity';
import { Expose } from 'class-transformer';

/**
 * 出租方财务明细输出 DTO
 * 复用实体字段，仅排除关联关系
 */
export class OutputFinanceDto extends OmitType(LessorFinanceEntity, [
  'lessor',
  'order',
  'payment',
  'paymentRecord',
  'depositDeduction',
  'refundRecord',
  'withdrawalRecord',
  'originalFinance',
  'reversedFinance',
] as const) {
  @Expose()
  @ApiProperty({ description: '账务方向标签' })
  directionLabel: string;

  @Expose()
  @ApiProperty({ description: '收入类型标签' })
  incomeTypeLabel: string;

  @Expose()
  @ApiProperty({ description: '支出类型标签' })
  expenseTypeLabel: string;

  @Expose()
  @ApiProperty({ description: '账务状态标签' })
  statusLabel: string;

  @Expose()
  @ApiProperty({ description: '资金流状态标签' })
  flowStatusLabel: string;

  @Expose()
  @ApiProperty({ description: '币种标签' })
  currencyLabel: string;

  @Expose()
  @ApiProperty({ description: '业务大类标签' })
  businessTypeLabel: string;

  @Expose()
  @ApiProperty({ description: '是否已被冲正' })
  isReversedByOther: boolean;

  @Expose()
  @ApiProperty({ description: '是否为收入' })
  isIncome: boolean;

  @Expose()
  @ApiProperty({ description: '是否为支出' })
  isExpense: boolean;

  @Expose()
  @ApiProperty({ description: '是否已确认入账' })
  isConfirmed: boolean;

  @Expose()
  @ApiProperty({ description: '是否已冲正' })
  isReversed: boolean;

  @Expose()
  @ApiProperty({ description: '是否待入账' })
  isPending: boolean;

  @Expose()
  @ApiProperty({ description: '是否已取消' })
  isCancelled: boolean;
}
