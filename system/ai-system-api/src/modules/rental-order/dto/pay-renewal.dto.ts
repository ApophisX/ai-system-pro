import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { PaymentProvider } from '@/modules/base/payment/enums';

/**
 * 支付续租账单请求 DTO
 */
export class PayRenewalDto {
  @ApiProperty({ description: '续租支付账单 ID' })
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty({ description: '支付提供商', enum: PaymentProvider })
  @IsEnum(PaymentProvider)
  @IsNotEmpty()
  provider: PaymentProvider;
}
