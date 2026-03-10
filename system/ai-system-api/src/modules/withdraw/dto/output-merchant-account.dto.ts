import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * 商家账户响应 DTO
 */
export class OutputMerchantAccountDto {
  @ApiProperty({ description: '总余额（元）' })
  @Expose()
  totalBalance: string;

  @ApiProperty({ description: '冻结余额（元）' })
  @Expose()
  frozenBalance: string;

  @ApiProperty({ description: '可提现余额（元）' })
  @Expose()
  availableBalance: string;
}
