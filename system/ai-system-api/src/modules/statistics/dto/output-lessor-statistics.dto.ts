import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { OutputLesseeOrderStatisticsDto } from './output-lessee-order-statistics.dto';

/**
 * 出租方统计数据输出 DTO
 *
 * 用于统计出租方相关数据：
 * - 已发布的资产数量
 * - 进行中的订单数量
 * - 待处理订单数量
 * - 累计收入
 */
export class OutputLessorStatisticsDto {
  @ApiProperty({
    description: '已发布的资产数量',
    example: 15,
  })
  @Expose()
  publishedAssetCount: number;

  @ApiProperty({
    description: '总资产数量',
    example: 15,
  })
  @Expose()
  totalAssetCount: number;

  @ApiProperty({
    description: '进行中的订单数量',
    example: 5,
  })
  @Expose()
  inProgressOrderCount: number;

  @ApiProperty({
    description: '待处理订单数量',
    example: 3,
  })
  @Expose()
  pendingOrderCount: number;

  @ApiProperty({
    description: '累计收入（元）',
    example: 50000.0,
  })
  @Expose()
  totalIncome: number;
}

export class OutputLessorOrderStatisticsDto extends OutputLesseeOrderStatisticsDto {}
