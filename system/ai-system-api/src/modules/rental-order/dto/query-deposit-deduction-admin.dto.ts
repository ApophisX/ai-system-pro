import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQueryDto } from '@/common/dtos/base-query.dto';
import { DepositDeductionStatus } from '../enums';

/**
 * 后台查询押金扣款列表 DTO（管理员）
 */
export class QueryDepositDeductionAdminDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: '扣款状态筛选',
    enum: DepositDeductionStatus,
  })
  @IsOptional()
  @IsEnum(DepositDeductionStatus)
  @Type(() => String)
  status?: DepositDeductionStatus;

  @ApiPropertyOptional({ description: '订单 ID' })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({ description: '扣款单号' })
  @IsOptional()
  @IsString()
  deductionNo?: string;

  @ApiPropertyOptional({ description: '押金单号' })
  @IsOptional()
  @IsString()
  depositNo?: string;
}
