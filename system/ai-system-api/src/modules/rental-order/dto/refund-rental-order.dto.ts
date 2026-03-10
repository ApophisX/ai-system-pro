import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 退款订单请求 DTO
 */
export class RefundRentalOrderDto {
  @ApiProperty({ description: '订单 ID' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiPropertyOptional({ description: '退款金额（分），不传则全额退款' })
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ description: '退款原因' })
  @IsString()
  @IsOptional()
  reason?: string;
}
