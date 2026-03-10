import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsString,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
  IsUrl,
  IsNumber,
} from 'class-validator';
import { ChatMessageType } from '../enums/chat-message-type.enum';

/**
 * 创建聊天消息请求 DTO
 */
export class CreateChatMessageDto {
  @ApiProperty({
    description: '接收者用户 ID',
    example: 'uuid-of-receiver',
  })
  @IsUUID()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({
    description: '消息类型',
    enum: ChatMessageType,
    example: ChatMessageType.TEXT,
  })
  @IsEnum(ChatMessageType)
  @IsNotEmpty()
  type: ChatMessageType;

  @ApiPropertyOptional({
    description: '消息内容（文本消息的内容，或其他类型消息的说明）',
    example: '你好，这是一条消息',
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  content?: string;

  @ApiPropertyOptional({
    description: '文件 URL（图片、视频、语音、文件的存储地址）',
    example: 'https://example.com/file.jpg',
  })
  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  fileUrl?: string;

  @ApiPropertyOptional({
    description: '文件名称（文件消息的文件名）',
    example: 'document.pdf',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  fileName?: string;

  @ApiPropertyOptional({
    description: '文件大小（字节）',
    example: 1024000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({
    description: '文件 MIME 类型',
    example: 'image/jpeg',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  mimeType?: string;

  @ApiPropertyOptional({
    description: '图片/视频宽度（像素）',
    example: 1920,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  width?: number;

  @ApiPropertyOptional({
    description: '图片/视频高度（像素）',
    example: 1080,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  height?: number;

  @ApiPropertyOptional({
    description: '语音/视频时长（秒）',
    example: 30,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({
    description: '扩展信息（JSON 格式）',
    example: { thumbnail: 'https://example.com/thumb.jpg' },
  })
  @IsOptional()
  extra?: Record<string, any>;
}
