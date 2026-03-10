import { ApiProperty, OmitType } from '@nestjs/swagger';
import { MessageEntity } from '../entities';
import { Expose } from 'class-transformer';

/**
 * 消息响应 DTO
 */
export class OutputMessageDto extends OmitType(MessageEntity, ['isUnread', 'isRead']) {
  @ApiProperty({ description: '是否未读' })
  @Expose()
  isUnread: boolean;

  @ApiProperty({ description: '是否已读' })
  @Expose()
  isRead: boolean;
}

/**
 * 各个类型未读消息数量统计
 */
export class OutputUnreadCountByTypeDto {
  @ApiProperty({ description: '系统消息未读数量' })
  @Expose()
  system: number;

  @ApiProperty({ description: '订单消息未读数量' })
  @Expose()
  order: number;
}
