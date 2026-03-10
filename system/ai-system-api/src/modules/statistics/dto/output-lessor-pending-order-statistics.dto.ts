import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * 出租方待处理订单统计数据输出 DTO
 *
 * 用于统计出租方待处理的订单数量：
 * - 已支付数量
 * - 取消订单确认数量
 * - 逾期订单数量（包含超时使用）
 * - 已归还待确认数量
 * - 待归还数量
 * - 争议中数量
 */
export class OutputLessorPendingOrderStatisticsDto {
  @ApiProperty({
    description: '已支付数量（待收货）',
    example: 5,
  })
  @Expose()
  paidCount: number;

  @ApiProperty({
    description: '取消订单确认数量',
    example: 2,
  })
  @Expose()
  cancelPendingCount: number;

  @ApiProperty({
    description: '逾期订单数量（包含超时使用）',
    example: 3,
  })
  @Expose()
  overdueCount: number;

  @ApiProperty({
    description: '已归还待确认数量',
    example: 4,
  })
  @Expose()
  returnedPendingCount: number;

  @ApiProperty({
    description: '待归还数量',
    example: 6,
  })
  @Expose()
  waitReturnCount: number;

  @ApiProperty({
    description: '争议中数量',
    example: 1,
  })
  @Expose()
  disputeCount: number;
}
