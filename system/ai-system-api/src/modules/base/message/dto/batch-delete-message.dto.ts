import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

/**
 * 批量删除消息请求 DTO
 */
export class BatchDeleteMessageDto {
  @ApiProperty({
    description: '消息 ID 列表',
    type: [String],
    example: ['uuid-1', 'uuid-2'],
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  messageIds: string[];
}
