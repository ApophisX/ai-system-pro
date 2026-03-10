import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 审核提现请求 DTO（后台）
 */
export class ReviewWithdrawDto {
  @ApiProperty({
    description: '是否通过',
    example: true,
  })
  @IsBoolean()
  approved: boolean;

  @ApiPropertyOptional({
    description: '拒绝原因（审核拒绝时必填）',
    example: '账户信息不匹配',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectReason?: string;
}
