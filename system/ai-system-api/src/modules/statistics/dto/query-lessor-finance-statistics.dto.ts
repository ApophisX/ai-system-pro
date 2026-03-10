import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

/**
 * 出租方财务统计查询 DTO（时间筛选）
 */
export class QueryLessorFinanceStatisticsDto {
  @ApiPropertyOptional({
    description: '开始日期（按业务发生时间筛选，含当日 00:00:00）',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: '结束日期（按业务发生时间筛选，含当日 23:59:59）',
    example: '2024-12-31',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
