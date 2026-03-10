import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { PaginationQueryDto } from '@/common/dtos/base-query.dto';
import { FinanceDirection, FinanceStatus, BusinessType } from '../enums';

/**
 * 出租方财务明细查询 DTO（分页 + 筛选）
 */
export class QueryFinanceDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: '账务方向：收入/支出',
    enum: FinanceDirection,
  })
  @IsEnum(FinanceDirection)
  @IsOptional()
  direction?: FinanceDirection;

  @ApiPropertyOptional({
    description: '账务状态',
    enum: FinanceStatus,
  })
  @IsEnum(FinanceStatus)
  @IsOptional()
  status?: FinanceStatus;

  @ApiPropertyOptional({
    description: '业务大类',
    enum: BusinessType,
  })
  @IsEnum(BusinessType)
  @IsOptional()
  businessType?: BusinessType;

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
