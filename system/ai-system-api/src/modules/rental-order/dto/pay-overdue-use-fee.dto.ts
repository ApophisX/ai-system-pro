import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentProvider } from '@/modules/base/payment/enums';

/**
 * 支付超时使用费用请求 DTO
 *
 * 仅适用于：先付后用、非分期订单，且订单处于超时使用状态（overdueStatus = OVERDUE_USE）。
 * overdueStatus = OVERDUE_FEE_PAID 时不可再次支付（已付清）。
 * 先用后付订单、分期订单的逾期不在此接口，分别走逾期账单或分期账单支付。
 */
export class PayOverdueUseFeeDto {
  @ApiProperty({ description: '支付提供商', enum: PaymentProvider })
  @IsEnum(PaymentProvider)
  @IsNotEmpty()
  provider: PaymentProvider;
}
