import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsDateString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { DateRangeQueryDto } from '@/common/dtos/base-query.dto';

/**
 * 查询聊天消息列表请求 DTO
 */
export class QueryChatMessageDto extends DateRangeQueryDto {
  @ApiPropertyOptional({
    description: '会话 ID',
    example: 'uuid-of-conversation',
  })
  @IsUUID()
  @IsOptional()
  conversationId?: string;

  @ApiPropertyOptional({
    description: '对方用户 ID（用于查找会话）',
    example: 'uuid-of-user',
  })
  @IsUUID()
  @IsOptional()
  otherUserId?: string;

  @ApiPropertyOptional({
    description: '消息类型',
    example: 'text',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: '是否只查询未读消息',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  unreadOnly?: boolean;
}
