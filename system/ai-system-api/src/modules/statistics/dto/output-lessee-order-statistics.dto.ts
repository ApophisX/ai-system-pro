import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * 承租方订单统计输出 DTO
 *
 * 用于统计承租方各个状态的订单数量
 */
export class OutputLesseeOrderStatisticsDto {
  @ApiProperty({
    description: '待支付订单数量',
    example: 2,
  })
  @Expose()
  pendingPaymentCount: number;

  @ApiProperty({
    description: '使用中订单数量',
    example: 3,
  })
  @Expose()
  inUseCount: number;

  @ApiProperty({
    description: '已逾期订单数量',
    example: 1,
  })
  @Expose()
  overdueCount: number;

  @ApiProperty({
    description: '已完成订单数量',
    example: 10,
  })
  @Expose()
  completedCount: number;

  @ApiProperty({
    description: '售后中（争议中）订单数量',
    example: 1,
  })
  @Expose()
  disputeCount: number;

  @ApiProperty({
    description: '已支付待收货订单数量',
    example: 3,
  })
  @Expose()
  paidPendingReceiveOrderCount: number;
}
