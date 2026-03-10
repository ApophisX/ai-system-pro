import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 更新资产留言请求 DTO
 */
export class UpdateAssetCommentDto {
  @ApiPropertyOptional({ description: '留言内容', example: '更新后的留言内容' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  content?: string;
}
