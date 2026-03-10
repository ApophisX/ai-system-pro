import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * 承租方押金汇总 DTO
 *
 * 用于前端展示当前用户的押金数据概览
 */
export class OutputLesseeDepositSummaryDto {
  @ApiProperty({
    description: '当前冻结押金总额（元）',
    example: 500.0,
  })
  @Expose()
  frozenDepositTotal: number;

  @ApiProperty({
    description: '当前已扣除总额（元）',
    example: 100.0,
  })
  @Expose()
  deductedTotal: number;

  @ApiProperty({
    description: '累计退还金额（元）',
    example: 800.0,
  })
  @Expose()
  refundedTotal: number;

  @ApiProperty({
    description: '可释放金额（元）- 资产已归还未退还的押金',
    example: 200.0,
  })
  @Expose()
  releasableAmount: number;

  @ApiProperty({
    description: '订单数量（押金已冻结/已支付/部分扣除的订单数）',
    example: 5,
  })
  @Expose()
  orderCount: number;
}
