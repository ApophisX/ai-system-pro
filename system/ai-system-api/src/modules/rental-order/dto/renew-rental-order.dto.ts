import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 续租请求 DTO
 */
export class RenewRentalOrderDto {
  @ApiProperty({ description: '续租时长（与原 rentalType 单位一致，如日租为天、小时租为小时）', example: 3 })
  @IsInt()
  @Min(1)
  @Max(365)
  @Type(() => Number)
  duration: number;

  @ApiPropertyOptional({ description: '用户备注', example: '希望再租 3 天', maxLength: 500 })
  @IsOptional()
  @MaxLength(500)
  userRemark?: string;
}
