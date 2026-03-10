import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 单笔账单退款请求 DTO
 */
export class RefundPaymentRecordDto {
  @ApiProperty({ description: '支付记录 ID（payment_record 表的 ID）' })
  @IsUUID()
  @IsNotEmpty()
  paymentRecordId: string;

  @ApiProperty({ description: '退款金额（元），支持部分退款' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01, { message: '退款金额必须大于0' })
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ description: '退款原因' })
  @IsString()
  @IsOptional()
  reason?: string;
}
