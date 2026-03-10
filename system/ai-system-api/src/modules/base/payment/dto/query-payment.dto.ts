import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQueryDto } from '@/common/dtos/base-query.dto';
import { PaymentProvider, PaymentStatus, PaymentType } from '../enums';

/**
 * 查询支付记录请求 DTO
 */
export class QueryPaymentDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: '订单 ID' })
  @IsUUID()
  @IsOptional()
  orderId?: string;

  @ApiPropertyOptional({ description: '订单号' })
  @IsString()
  @IsOptional()
  orderNo?: string;

  @ApiPropertyOptional({ description: '支付状态', enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiPropertyOptional({ description: '支付类型', enum: PaymentType })
  @IsEnum(PaymentType)
  @IsOptional()
  paymentType?: PaymentType;

  @ApiPropertyOptional({ description: '支付提供商', enum: PaymentProvider })
  @IsEnum(PaymentProvider)
  @IsOptional()
  provider?: PaymentProvider;
}
