import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { WithdrawOrderStatus, WithdrawChannel } from '../enums';

/**
 * 提现订单响应 DTO
 */
export class OutputWithdrawOrderDto {
  @ApiProperty({ description: '提现单 ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: '提现单号' })
  @Expose()
  withdrawNo: string;

  @ApiProperty({ description: '提现金额（元）' })
  @Expose()
  amount: string;

  @ApiProperty({ description: '手续费（元）' })
  @Expose()
  fee: string;

  @ApiProperty({ description: '实际到账金额（元）' })
  @Expose()
  actualAmount: string;

  @ApiProperty({ description: '提现方式', enum: WithdrawChannel })
  @Expose()
  withdrawChannel: WithdrawChannel;

  @ApiPropertyOptional({ description: '开户行地址（银行卡时）' })
  @Expose()
  bankBranchAddress?: string;

  @ApiProperty({ description: '提现状态', enum: WithdrawOrderStatus })
  @Expose()
  status: WithdrawOrderStatus;

  @ApiProperty({ description: '申请时间' })
  @Expose()
  requestedAt: Date;

  @ApiPropertyOptional({ description: '审核时间' })
  @Expose()
  reviewedAt?: Date;

  @ApiPropertyOptional({ description: '完成时间' })
  @Expose()
  completedAt?: Date;

  @ApiPropertyOptional({ description: '失败原因' })
  @Expose()
  failedReason?: string;

  @ApiPropertyOptional({ description: '拒绝原因' })
  @Expose()
  rejectReason?: string;

  @ApiProperty({ description: '创建时间' })
  @Expose()
  createdAt: Date;
}
