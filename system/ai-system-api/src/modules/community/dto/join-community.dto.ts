import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 加入社区请求 DTO
 *
 * 私密社区必填 inviteCode，公开社区可不传
 */
export class JoinCommunityDto {
  @ApiPropertyOptional({ description: '邀请码（私密社区必填）', example: 'AB12CD' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  inviteCode?: string;
}
