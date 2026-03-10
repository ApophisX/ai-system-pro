import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ChatMessageEntity } from '../entities/chat-message.entity';
import { OutputUserDto } from '@/modules/base/user/dto';

/**
 * 聊天消息响应 DTO
 */
export class OutputChatMessageDto extends OmitType(ChatMessageEntity, ['receiver', 'sender']) {
  @ApiPropertyOptional({ description: '发送者信息' })
  @Expose()
  sender?: OutputUserDto;

  @ApiPropertyOptional({ description: '接收者信息' })
  @Expose()
  receiver?: OutputUserDto;
}
