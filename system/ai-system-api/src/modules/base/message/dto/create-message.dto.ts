import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsEnum, IsString, MaxLength, IsOptional, IsObject } from 'class-validator';
import { MessageType } from '../enums/message-type.enum';

/**
 * 创建消息请求 DTO
 */
export class CreateMessageDto {
  @ApiProperty({ description: '用户 ID（接收者）', example: 'uuid-of-user' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: '消息类型',
    enum: MessageType,
    example: MessageType.SYSTEM,
  })
  @IsEnum(MessageType)
  @IsNotEmpty()
  type: MessageType;

  @ApiProperty({ description: '消息标题', example: '系统通知' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: '消息内容', example: '这是一条系统消息' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: '关联对象 ID（如订单 ID、资产 ID 等）',
    example: 'uuid-of-order',
  })
  @IsUUID()
  @IsOptional()
  relatedId?: string;

  @ApiPropertyOptional({
    description: '关联对象类型（如 ORDER、ASSET 等）',
    example: 'ORDER',
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  relatedType?: string;

  @ApiPropertyOptional({
    description: '扩展信息（JSON 格式）',
    example: { image: 'https://example.com/image.jpg' },
  })
  @IsObject()
  @IsOptional()
  extra?: Record<string, any>;
}
