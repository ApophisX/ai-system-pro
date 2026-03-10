import { RenewalPolicy } from '@/modules/rental-order/types/renewal.types';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RenewalPolicyDto implements RenewalPolicy {
  @ApiProperty({ description: '是否允许续租' })
  @Expose()
  allowRenewal: boolean;

  @ApiProperty({ description: '最大续租次数' })
  @Expose()
  maxRenewalTimes: number;

  @ApiProperty({ description: '续租折扣' })
  @Expose()
  renewalDiscount: number;

  @ApiProperty({ description: '最小续租时长' })
  @Expose()
  minDuration: number;

  @ApiProperty({ description: '最大续租时长' })
  @Expose()
  maxDuration: number;

  @ApiProperty({ description: '申请续租提前时间' })
  @Expose()
  applyBeforeEndMinutes: number;
}
