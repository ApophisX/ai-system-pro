import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 创建退款请求 DTO
 */
export class CreateRefundDto {
  @ApiProperty({ description: '支付 ID' })
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty({ description: '退款金额' })
  @Type(() => Number)
  @Min(1)
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ description: '退款原因' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}
