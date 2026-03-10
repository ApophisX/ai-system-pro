import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 设置分期账单、续租账单优惠金额 DTO
 *
 * 分期账单或续租账单待支付时，出租方可单独设置某一笔账单的优惠金额。
 * - 必须指定 paymentId（账单 ID）
 * - 优惠金额必须小于该账单金额（不能大于等于）
 * - 仅待支付状态可设置
 */
export class SetPaymentDiscountDto {
  @ApiProperty({
    description: '账单 ID（分期账单或续租账单）',
    example: 'uuid',
  })
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty({
    description: '优惠金额（元），必须小于该账单金额',
    example: 50.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: '优惠金额不能为负数' })
  @Max(999999.99, { message: '优惠金额超出合理范围' })
  @Type(() => Number)
  discountAmount: number;
}
