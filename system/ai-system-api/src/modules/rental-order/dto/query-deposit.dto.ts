import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQueryDto } from '@/common/dtos/base-query.dto';
import { DepositStatus } from '../enums';

/**
 * 查询押金请求 DTO
 */
export class QueryDepositDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: '订单 ID', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({ description: '订单号', example: 'ORD202401010001' })
  @IsOptional()
  @IsString()
  orderNo?: string;

  @ApiPropertyOptional({ description: '用户 ID', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: '押金状态', enum: DepositStatus })
  @IsOptional()
  @IsEnum(DepositStatus)
  @Type(() => String)
  status?: DepositStatus;
}
