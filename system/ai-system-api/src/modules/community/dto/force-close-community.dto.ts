import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 强制关闭社区请求 DTO（管理端）
 */
export class ForceCloseCommunityDto {
  @ApiPropertyOptional({ description: '关闭原因', example: '违规内容' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
