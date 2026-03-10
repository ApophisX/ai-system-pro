import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { MessageStatus } from '../enums/message-status.enum';

/**
 * 批量更新消息请求 DTO
 */
export class BatchUpdateMessageDto {
  @ApiProperty({
    description: '消息 ID 列表',
    type: [String],
    example: ['uuid-1', 'uuid-2'],
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  messageIds: string[];

  @ApiPropertyOptional({
    description: '消息状态',
    enum: MessageStatus,
    example: MessageStatus.READ,
  })
  @IsEnum(MessageStatus)
  @IsOptional()
  status?: MessageStatus;
}
