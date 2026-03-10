import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { DepositFreeType } from '../enums';
import { PaymentProvider } from '@/modules/base/payment/enums';

/**
 * 创建押金请求 DTO
 */
export class CreateDepositDto {
  @ApiProperty({ description: '订单 ID', example: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @ApiProperty({ description: '订单号', example: 'ORD202401010001' })
  @IsNotEmpty()
  @IsString()
  orderNo: string;

  @ApiProperty({ description: '用户 ID（承租方）', example: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: '押金金额（元）', example: 1000.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    description: '免押类型',
    enum: DepositFreeType,
    example: DepositFreeType.NONE,
  })
  @IsOptional()
  @IsEnum(DepositFreeType)
  freeType?: DepositFreeType;

  @ApiPropertyOptional({
    description: '免押授权号（使用免押时必填）',
    example: 'ALIPAY_AUTH_123456',
  })
  @IsOptional()
  @IsString()
  freeAuthNo?: string;

  @ApiPropertyOptional({
    description: '免押授权数据（JSON）',
    example: { authId: 'xxx', expireTime: '2024-12-31' },
  })
  @IsOptional()
  freeAuthData?: Record<string, unknown>;

  @ApiPropertyOptional({ description: '备注', example: '押金备注' })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ description: '支付方式', example: PaymentProvider.WECHAT })
  @IsNotEmpty()
  @IsEnum(PaymentProvider)
  paymentProvider: PaymentProvider;
}
