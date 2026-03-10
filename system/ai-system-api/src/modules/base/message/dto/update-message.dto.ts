import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { MessageStatus } from '../enums/message-status.enum';

/**
 * 更新消息请求 DTO
 */
export class UpdateMessageDto {
  @ApiPropertyOptional({
    description: '消息状态',
    enum: MessageStatus,
    example: MessageStatus.READ,
  })
  @IsEnum(MessageStatus)
  @IsOptional()
  status?: MessageStatus;
}
