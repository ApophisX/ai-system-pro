import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 押金退款请求 DTO
 *
 * 用于出租方发起订单押金退款
 */
export class RefundDepositDto {
  @ApiPropertyOptional({ description: '退款备注', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '退款备注不能超过500个字符' })
  remark?: string;
}
