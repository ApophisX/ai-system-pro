import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentProvider } from '@/modules/base/payment/enums';
import { DepositFreeType } from '../enums';

/**
 * 支付押金请求 DTO
 */
export class PayDepositDto {
  @ApiProperty({
    description: '支付方式（如果使用免押，则不需要）',
    enum: PaymentProvider,
    example: PaymentProvider.ALIPAY,
  })
  @IsNotEmpty()
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;
}
