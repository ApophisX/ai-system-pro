import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * 续租预计算响应 DTO
 */
export class RenewPreviewDto {
  @ApiProperty({ description: '是否可续租' })
  @Expose()
  canRenew: boolean;

  @ApiProperty({ description: '续租租金金额（含折扣）' })
  @Expose()
  renewalAmount: number;

  @ApiProperty({ description: '续租平台服务费' })
  @Expose()
  platformFee: number;

  @ApiProperty({ description: '续租应付总额（续租租金 + 平台费）' })
  @Expose()
  totalAmount: number;

  @ApiProperty({ description: '续租后的新结束日期' })
  @Expose()
  newEndDate: string;

  @ApiProperty({ description: '续租完成后的续租次数' })
  @Expose()
  renewalCountAfter: number;

  @ApiPropertyOptional({ description: '不可续租时的原因说明', type: String })
  @Expose()
  message?: string;
}
