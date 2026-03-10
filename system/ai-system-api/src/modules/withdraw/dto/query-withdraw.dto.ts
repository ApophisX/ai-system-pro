import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { PaginationQueryDto } from '@/common/dtos/base-query.dto';
import { WithdrawOrderStatus, WithdrawChannel } from '../enums';

/**
 * 提现订单查询 DTO
 */
export class QueryWithdrawDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: '提现状态筛选',
    enum: WithdrawOrderStatus,
  })
  @IsOptional()
  @IsEnum(WithdrawOrderStatus)
  status?: WithdrawOrderStatus;

  @ApiPropertyOptional({
    description: '提现方式筛选',
    enum: WithdrawChannel,
  })
  @IsOptional()
  @IsEnum(WithdrawChannel)
  withdrawChannel?: WithdrawChannel;
}
