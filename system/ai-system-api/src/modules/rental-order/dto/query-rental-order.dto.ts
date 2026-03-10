import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseQueryDto } from '@/common/dtos/base-query.dto';
import {
  RentalOrderStatus,
  RentalOrderPayStatus,
  RentalOrderRefundStatus,
  RentalOrderUsageStatus,
  RentalOrderOverdueStatus,
} from '../enums';
import { Expose } from 'class-transformer';

/**
 * 查询订单请求 DTO
 */
export class QueryRentalOrderDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description:
      '订单状态/使用状态/逾期状态：created、pending_receipt、received、completed、dispute、in_use、overdue、overdue_use、overdue_fee_paid、wait_return',
    enum: [
      RentalOrderStatus.CREATED,
      RentalOrderStatus.PENDING_RECEIPT,
      RentalOrderStatus.RECEIVED,
      RentalOrderStatus.COMPLETED,
      RentalOrderStatus.DISPUTE,
      RentalOrderUsageStatus.IN_USE,
      RentalOrderOverdueStatus.OVERDUE,
      RentalOrderOverdueStatus.OVERDUE_USE,
      RentalOrderOverdueStatus.OVERDUE_FEE_PAID,
      RentalOrderUsageStatus.WAIT_RETURN,
    ],
  })
  @IsEnum(
    [
      RentalOrderStatus.CREATED,
      RentalOrderStatus.PENDING_RECEIPT,
      RentalOrderStatus.RECEIVED,
      RentalOrderStatus.COMPLETED,
      RentalOrderStatus.DISPUTE,
      RentalOrderUsageStatus.IN_USE,
      RentalOrderOverdueStatus.OVERDUE,
      RentalOrderOverdueStatus.OVERDUE_USE,
      RentalOrderOverdueStatus.OVERDUE_FEE_PAID,
      RentalOrderUsageStatus.WAIT_RETURN,
    ],
    {
      message:
        '订单状态必须是以下状态之一：created、pending_receipt、received、completed、dispute、in_use、overdue、overdue_use、overdue_fee_paid、wait_return',
    },
  )
  @IsOptional()
  @Expose()
  status?: any;

  @ApiPropertyOptional({
    description: '支付状态',
    enum: RentalOrderPayStatus,
  })
  @IsEnum(RentalOrderPayStatus)
  @IsOptional()
  @Expose()
  paymentStatus?: RentalOrderPayStatus;

  @ApiPropertyOptional({
    description: '退款状态',
    enum: RentalOrderRefundStatus,
  })
  @IsEnum(RentalOrderRefundStatus)
  @IsOptional()
  @Expose()
  refundStatus?: RentalOrderRefundStatus;

  @ApiPropertyOptional({ description: '资产 ID' })
  @IsUUID()
  @IsOptional()
  @Expose()
  assetId?: string;

  @ApiPropertyOptional({ description: '订单号' })
  @IsString()
  @IsOptional()
  @Expose()
  orderNo?: string;
}
