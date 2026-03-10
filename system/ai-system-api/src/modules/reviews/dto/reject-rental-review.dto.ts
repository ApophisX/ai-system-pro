import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 审核拒绝评价请求 DTO
 */
export class RejectRentalReviewDto {
  @ApiPropertyOptional({ description: '拒绝原因', example: '内容违规' })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '拒绝原因不能超过 255 字' })
  rejectReason?: string;
}
