import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * 出租方财务统计数据输出 DTO
 *
 * 用于展示出租方的财务统计信息：
 * - 累计结算：已提现的金额
 * - 可提现余额：已结算但未提现的金额
 * - 待入账金额：已支付但订单还未完成的金额
 */
export class OutputLessorFinanceStatisticsDto {
  @ApiProperty({
    description: '累计结算（元）',
    example: 50000.0,
  })
  @Expose()
  totalSettledAmount: number;

  @ApiProperty({
    description: '可提现余额（元）',
    example: 5000.0,
  })
  @Expose()
  withdrawableBalance: number;

  @ApiProperty({
    description: '待入账金额（元）',
    example: 20000.0,
  })
  @Expose()
  pendingAmount: number;
}
