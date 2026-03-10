import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 强制下架资产请求 DTO
 */
export class ForceOfflineAssetDto {
  @ApiPropertyOptional({
    description: '强制下架原因，将通知出租方',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
