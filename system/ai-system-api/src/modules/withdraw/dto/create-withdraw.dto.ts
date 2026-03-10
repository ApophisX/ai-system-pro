import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min, MaxLength, IsString, IsEnum, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { WithdrawChannel } from '../enums';

/**
 * 申请提现请求 DTO
 *
 * 提现方式：微信、支付宝（已支持）、银行卡（预留）
 * 选择银行卡时需填写开户行地址
 */
export class CreateWithdrawDto {
  @ApiProperty({
    description: '提现金额（元）',
    example: 100,
    minimum: 1,
  })
  @IsNumber()
  @Min(0.01, { message: '提现金额必须大于 0' })
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: '提现方式',
    enum: WithdrawChannel,
    example: WithdrawChannel.WECHAT,
  })
  @IsEnum(WithdrawChannel, { message: '提现方式需为 wechat、alipay 或 bank' })
  withdrawChannel: WithdrawChannel;

  @ApiPropertyOptional({
    description: '提现目标账户。微信/支付宝可不填（从用户绑定信息获取）；银行卡必填',
    example: 'oXXXX',
    maxLength: 128,
  })
  @ValidateIf(o => o.withdrawChannel === WithdrawChannel.BANK)
  @IsNotEmpty({ message: '选择银行卡提现时，银行卡号不能为空' })
  @ValidateIf(o => o.targetAccount != null && o.targetAccount !== '')
  @IsString()
  @MaxLength(128)
  targetAccount?: string;

  @ApiPropertyOptional({
    description: '开户行地址（选择银行卡时必填，如：中国工商银行深圳科技园支行）',
    example: '中国工商银行深圳科技园支行',
    maxLength: 200,
  })
  @ValidateIf(o => o.withdrawChannel === WithdrawChannel.BANK)
  @IsNotEmpty({ message: '选择银行卡提现时，开户行地址不能为空' })
  @IsString()
  @MaxLength(200)
  bankBranchAddress?: string;

  @ApiProperty({
    description: '幂等键（客户端生成，防重复提交）',
    example: 'withdraw-20250211-abc123',
    maxLength: 64,
  })
  @IsString()
  @IsNotEmpty({ message: '幂等键不能为空' })
  @MaxLength(64)
  idempotencyKey: string;
}
