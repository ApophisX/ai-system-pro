import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * 承租方财务统计数据输出 DTO
 *
 * 用于展示承租方的财务统计信息：
 * - 累计结算：已完成订单的累计支付金额（扣除退款）
 * - 可提现余额：退款成功但未使用的余额
 * - 待入账金额：已支付但订单还未完成的金额
 */
export class OutputLesseeFinanceStatisticsDto {
  @ApiProperty({
    description: '累计结算（元）',
    example: 5000.0,
  })
  @Expose()
  totalSettledAmount: number;

  @ApiProperty({
    description: '可提现余额（元）',
    example: 500.0,
  })
  @Expose()
  withdrawableBalance: number;

  @ApiProperty({
    description: '待入账金额（元）',
    example: 2000.0,
  })
  @Expose()
  pendingAmount: number;
}
