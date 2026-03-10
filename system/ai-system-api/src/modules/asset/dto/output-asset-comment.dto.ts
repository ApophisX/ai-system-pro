import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { OutputUserDto } from '@/modules/base/user/dto';

/**
 * 资产留言响应 DTO
 */
export class OutputAssetCommentDto {
  @ApiProperty({ description: '留言 ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: '资产 ID' })
  @Expose()
  assetId: string;

  @ApiProperty({ description: '留言用户 ID' })
  @Expose()
  userId: string;

  @ApiProperty({ description: '留言内容' })
  @Expose()
  content: string;

  @ApiPropertyOptional({ description: '父留言 ID' })
  @Expose()
  parentId?: string | null;

  @ApiPropertyOptional({ description: '回复的用户 ID' })
  @Expose()
  replyToUserId?: string | null;

  @ApiProperty({ description: '点赞数', default: 0 })
  @Expose()
  likeCount: number;

  @ApiProperty({ description: '创建时间' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({ description: '留言用户信息', type: OutputUserDto })
  @Expose()
  @Type(() => OutputUserDto)
  user?: OutputUserDto;

  @ApiPropertyOptional({
    description: '被回复的用户信息',
    type: OutputUserDto,
  })
  @Expose()
  @Type(() => OutputUserDto)
  replyToUser?: OutputUserDto | null;

  @ApiPropertyOptional({
    description: '回复列表',
    type: [OutputAssetCommentDto],
  })
  @Expose()
  @Type(() => OutputAssetCommentDto)
  replies?: OutputAssetCommentDto[];
}
