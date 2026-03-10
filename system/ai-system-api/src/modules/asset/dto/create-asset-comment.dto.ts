import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

/**
 * 创建资产留言请求 DTO
 */
export class CreateAssetCommentDto {
  @ApiProperty({ description: '资产 ID', example: 'uuid-of-asset' })
  @IsUUID()
  @IsNotEmpty()
  assetId: string;

  @ApiProperty({ description: '留言内容', example: '这个资产很不错！' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({
    description: '父留言 ID（用于回复，不传则为顶级留言）',
    example: 'uuid-of-parent-comment',
  })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({
    description: '回复的用户 ID（当 parentId 不为空时，表示回复给哪个用户）',
    example: 'uuid-of-user',
  })
  @IsUUID()
  @IsOptional()
  replyToUserId?: string;
}
