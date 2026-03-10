import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 取消订单请求 DTO
 */
export class CancelRentalOrderDto {
  @ApiPropertyOptional({ description: '取消原因' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({ description: '取消订单的证据URL列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  evidenceUrls?: string[];
}

/**
 * 商家（出租方）取消订单请求 DTO
 */
export class CancelByLessorDto {
  @ApiPropertyOptional({ description: '取消原因，如库存不足、无法接单等' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}
