import { PickType } from '@nestjs/swagger';
import { PaymentEntity } from '../entities';

/**
 * 创建支付请求 DTO
 */
export class CreatePaymentDto extends PickType(PaymentEntity, [
  'orderId',
  'orderNo',
  'userId',
  'amount',
  'startTime',
  'endTime',
  'payableTime',
  'installmentPlanId',
  'periodIndex',
  'rentalPeriod',
]) {}
