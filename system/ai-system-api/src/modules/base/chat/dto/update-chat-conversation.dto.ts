import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

/**
 * 更新聊天会话请求 DTO
 */
export class UpdateChatConversationDto {
  @ApiPropertyOptional({
    description: '是否屏蔽会话',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  blocked?: boolean;
}
