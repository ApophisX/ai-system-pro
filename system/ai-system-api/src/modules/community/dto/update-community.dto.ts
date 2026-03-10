import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 更新社区请求 DTO
 *
 * 仅创建者可更新；仅 status=approved 时可更新；type 创建后不可改
 */
export class UpdateCommunityDto {
  @ApiPropertyOptional({ description: '社区名称' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: '社区描述' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: '封面图 URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImage?: string;

  @ApiPropertyOptional({ description: '邀请码（仅私密社区创建者可修改）' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  inviteCode?: string;
}
