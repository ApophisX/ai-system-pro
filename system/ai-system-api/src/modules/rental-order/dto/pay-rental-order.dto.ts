import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { PaymentProvider } from '@/modules/base/payment/enums';

/**
 * 支付订单请求 DTO
 */
export class PayRentalOrderDto {
  @ApiProperty({ description: '订单 ID' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: '支付提供商', enum: PaymentProvider })
  @IsEnum(PaymentProvider)
  @IsNotEmpty()
  provider: PaymentProvider;
}

/**
 * 支付分期账单请求 DTO
 */
export class PayInstallmentDto extends PayRentalOrderDto {
  @ApiProperty({ description: '支付账单 ID' })
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;
}
