import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 设置超期使用优惠金额 DTO
 *
 * 超期使用费用待支付时，出租方可设置超期使用费优惠金额。
 * 优惠金额不能超过待付超期费（超期使用费总额 - 已支付超期费）。
 *
 * 前置条件：overdueStatus = OVERDUE_USE（超时使用），先付后用、非分期订单
 */
export class SetOverdueUseDiscountDto {
  @ApiProperty({
    description: '超期使用优惠金额（元），不能超过待付超期费',
    example: 20.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: '优惠金额不能为负数' })
  @Max(999999.99, { message: '优惠金额超出合理范围' })
  @Type(() => Number)
  discountAmount: number;

  @ApiPropertyOptional({
    description: '超期使用优惠备注（如：友好协商减免、首次逾期减免等）',
    example: '友好协商减免',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '优惠备注不能超过200个字符' })
  remark?: string;
}
