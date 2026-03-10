import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * 承租方统计数据输出 DTO
 *
 * 用于"我的"页面展示承租方相关统计信息
 */
export class OutputLesseeStatisticsDto {
  @ApiProperty({
    description: '订单总数',
    example: 10,
  })
  @Expose()
  orderCount: number;

  @ApiProperty({
    description: '待支付订单数量',
    example: 2,
  })
  @Expose()
  pendingPaymentOrderCount: number;

  @ApiProperty({
    description: '押金总金额（元）',
    example: 5000.0,
  })
  @Expose()
  totalDepositAmount: number;

  @ApiProperty({
    description: '收藏的资产数量',
    example: 15,
  })
  @Expose()
  favoriteAssetCount: number;

  @ApiProperty({
    description: '已支付待收货订单数量',
    example: 3,
  })
  @Expose()
  paidPendingReceiveOrderCount: number;
}
