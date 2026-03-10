import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { PaymentEntity, PaymentRecordEntity, RefundRecordEntity } from '../entities';
import { Expose, Type } from 'class-transformer';

export class OutputRefundRecordDto extends OmitType(RefundRecordEntity, [] as const) {
  @ApiProperty({ description: '退款状态标签' })
  @Expose()
  statusLabel: string;
}
export class OutputPaymentRecordDto extends OmitType(PaymentRecordEntity, [] as const) {
  @ApiProperty({ description: '支付状态标签' })
  @Expose()
  statusLabel: string;

  @ApiProperty({ description: '退款状态标签' })
  @Expose()
  refundStatusLabel: string;
}

export class RenewalInfoDto {
  @ApiProperty({ description: '续租时长' })
  @Expose()
  duration: number;

  @ApiPropertyOptional({ description: '用户备注', example: '希望再租 3 天' })
  @Expose()
  userRemark?: string;
}
/**
 * 支付响应 DTO
 *
 * 复用 Entity，排除关系属性以避免 Swagger 循环依赖
 */
export class OutputPaymentDto extends OmitType(PaymentEntity, [
  'user',
  'paymentRecords',
  'refundRecords',
  'canPrepay',
  'statusLabel',
  'renewalInfo',
] as const) {
  @ApiProperty({ description: '是否可以提前支付' })
  @Expose()
  canPrepay: boolean;

  @ApiProperty({ description: '状态标签' })
  @Expose()
  statusLabel: string;

  @ApiProperty({ description: '逾期罚金单位标签' })
  @Expose()
  overdueFeeUnitLabel: string;

  @ApiProperty({ description: '支付类型标签' })
  @Expose()
  paymentTypeLabel: string;

  @ApiProperty({ description: '已退款金额' })
  @Expose()
  refundedAmount: number;

  @ApiProperty({ description: '是否已全部退款' })
  @Expose()
  isAllRefunded: boolean;

  @ApiProperty({ description: '是否已逾期' })
  @Expose()
  isOverdue: boolean;

  @ApiProperty({ description: '是否待支付' })
  @Expose()
  isPending: boolean;

  @ApiProperty({ description: '是否已支付' })
  @Expose()
  isPaid: boolean;

  @ApiProperty({ description: '逾期时间' })
  @Expose()
  overdueMinutes: number;

  @ApiProperty({ description: '逾期罚金（动态计算）' })
  @Expose()
  overdueAmount: number;

  @ApiProperty({ description: '显示逾期罚金，直到支付完成' })
  @Expose()
  overdueFineToDisplay: number;

  @ApiProperty({
    description:
      '总应付金额（包含原始金额、逾期违约金和逾期罚金，减去优惠金额）。优惠金额在此处扣除，确保金额计算的唯一来源',
  })
  @Expose()
  totalPayableAmount: number;

  @ApiProperty({
    description: '未支付金额（包含逾期费用，已减去优惠金额）。公式：未支付金额 = 总应付金额 - 已支付金额',
  })
  @Expose()
  unpaidAmount: number;

  @ApiProperty({ description: '退款状态标签' })
  @Expose()
  refundStatusLabel: string;

  @ApiProperty({ description: '退款记录', type: [OutputRefundRecordDto] })
  @Type(() => OutputRefundRecordDto)
  @Expose()
  refundRecords: OutputRefundRecordDto[];

  @ApiProperty({ description: '支付记录', type: [OutputPaymentRecordDto] })
  @Type(() => OutputPaymentRecordDto)
  @Expose()
  paymentRecords: OutputPaymentRecordDto[];

  @ApiProperty({ description: '续租信息' })
  @Expose()
  @Type(() => RenewalInfoDto)
  renewalInfo: RenewalInfoDto;
}
