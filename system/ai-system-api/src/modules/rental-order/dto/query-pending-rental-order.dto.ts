import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BaseQueryDto } from '@/common/dtos/base-query.dto';
import { RentalOrderUsageStatus, RentalOrderStatus, RentalOrderOverdueStatus } from '../enums';
import { Expose } from 'class-transformer';

/**
 * 查询待处理订单请求 DTO
 * 逾期状态 overdue/overdue_use/overdue_fee_paid 通过 overdueStatus 查询
 */
export class QueryPendingRentalOrderDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: '订单状态（可选，仅限待处理状态）',
    enum: [
      RentalOrderStatus.CANCEL_PENDING,
      RentalOrderStatus.DISPUTE,
      RentalOrderOverdueStatus.OVERDUE,
      RentalOrderOverdueStatus.OVERDUE_USE,
      RentalOrderOverdueStatus.OVERDUE_FEE_PAID,
      RentalOrderStatus.PENDING_RECEIPT,
      RentalOrderUsageStatus.RETURNED_PENDING,
      RentalOrderUsageStatus.WAIT_RETURN,
    ],
    example: RentalOrderStatus.CANCEL_PENDING,
  })
  @IsEnum(
    [
      RentalOrderStatus.CANCEL_PENDING,
      RentalOrderStatus.DISPUTE,
      RentalOrderOverdueStatus.OVERDUE,
      RentalOrderOverdueStatus.OVERDUE_USE,
      RentalOrderOverdueStatus.OVERDUE_FEE_PAID,
      RentalOrderStatus.PENDING_RECEIPT,
      RentalOrderUsageStatus.RETURNED_PENDING,
      RentalOrderUsageStatus.WAIT_RETURN,
    ],
    {
      message:
        '订单状态必须是待处理状态之一：cancel_pending、dispute、overdue、overdue_use、overdue_fee_paid、pending_receipt、returned_pending、wait_return',
    },
  )
  @IsOptional()
  @Expose()
  status?: any;
}
