import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { PaginationQueryDto } from '@/common/dtos/base-query.dto';
import { MessageType } from '../enums/message-type.enum';
import { MessageStatus } from '../enums/message-status.enum';
import { Transform } from 'class-transformer';

/**
 * 查询消息列表 DTO
 */
export class QueryMessageDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: '消息类型',
    enum: MessageType,
    example: MessageType.SYSTEM,
  })
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @ApiPropertyOptional({
    description: '消息状态',
    enum: MessageStatus,
    example: MessageStatus.UNREAD,
  })
  @IsEnum(MessageStatus)
  @IsOptional()
  status?: MessageStatus;

  @ApiPropertyOptional({
    description: '关键字搜索（搜索标题、内容）',
    example: '订单',
  })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({
    description: '开始日期',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value as string) : undefined), {
    toClassOnly: true,
  })
  startDate?: Date;

  @ApiPropertyOptional({
    description: '结束日期',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value as string) : undefined), {
    toClassOnly: true,
  })
  endDate?: Date;
}
