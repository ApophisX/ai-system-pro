import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsUUID } from 'class-validator';
import { BaseQueryDto } from '@/common/dtos/base-query.dto';

/**
 * 查询资产留言请求 DTO
 */
export class QueryAssetCommentDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: '资产 ID', example: 'uuid-of-asset' })
  @IsUUID()
  @IsOptional()
  assetId?: string;

  @ApiPropertyOptional({
    description: '父留言 ID（不传则查询顶级留言，传了则查询该留言的回复）',
    example: 'uuid-of-parent-comment',
  })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({
    description: '用户 ID（查询某个用户的留言）',
    example: 'uuid-of-user',
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: '是否只查询顶级留言（不包含回复）',
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  topLevelOnly?: boolean = false;
}
