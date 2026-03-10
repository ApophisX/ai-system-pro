import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 设置账单优惠金额 DTO
 *
 * 订单待支付时，出租方可设置账单优惠金额。
 * - 分期租赁：优惠金额平摊到每期账单
 * - 一次性租赁：优惠金额应用于单笔账单
 * - 续租：优惠金额应用于续租账单
 */
export class SetDiscountDto {
  @ApiProperty({
    description: '优惠金额（元），不能超过待支付账单总金额',
    example: 50.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: '优惠金额不能为负数' })
  @Max(999999.99, { message: '优惠金额超出合理范围' })
  @Type(() => Number)
  discountAmount: number;
}
