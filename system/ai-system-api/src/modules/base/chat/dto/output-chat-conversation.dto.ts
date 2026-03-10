import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ChatConversationEntity } from '../entities/chat-conversation.entity';
import { OutputUserDto } from '@/modules/base/user/dto';

/**
 * 聊天会话响应 DTO
 */
export class OutputChatConversationDto extends OmitType(ChatConversationEntity, []) {
  @ApiPropertyOptional({ description: '对方用户信息' })
  @Expose()
  otherUser?: OutputUserDto;

  @ApiPropertyOptional({ description: '当前用户的未读消息数' })
  @Expose()
  unreadCount?: number;

  @ApiPropertyOptional({ description: '当前用户是否屏蔽了会话' })
  @Expose()
  isBlocked?: boolean;
}
