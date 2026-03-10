import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsEnum, IsString, MaxLength } from 'class-validator';
import { ChatMessageType } from '../enums/chat-message-type.enum';
import { ChatMessageStatus } from '../enums/chat-message-status.enum';
import { ChatConversationEntity } from './chat-conversation.entity';

/**
 * 聊天消息实体
 *
 * 存储用户之间的聊天消息，支持文本、图片、视频、语音、文件等类型
 */
@Entity('chat_message')
@Index('IDX_chat_message_conversation_created', ['conversationId', 'createdAt'])
@Index('IDX_chat_message_sender_status', ['senderId', 'status'])
@Index('IDX_chat_message_receiver_status', ['receiverId', 'status'])
export class ChatMessageEntity extends BaseEntity {
  /**
   * 会话 ID
   */
  @ApiProperty({ description: '会话 ID' })
  @Expose()
  @IsNotEmpty()
  @Column({ type: 'uuid', comment: '会话 ID' })
  @Index()
  conversationId: string;

  /**
   * 发送者 ID
   */
  @ApiProperty({ description: '发送者 ID' })
  @Expose()
  @IsNotEmpty()
  @Column({ type: 'uuid', comment: '发送者 ID' })
  @Index()
  senderId: string;

  /**
   * 接收者 ID
   */
  @ApiProperty({ description: '接收者 ID' })
  @Expose()
  @IsNotEmpty()
  @Column({ type: 'uuid', comment: '接收者 ID' })
  @Index()
  receiverId: string;

  /**
   * 消息类型
   */
  @ApiProperty({
    description: '消息类型',
    enum: ChatMessageType,
    example: ChatMessageType.TEXT,
  })
  @Expose()
  @IsNotEmpty()
  @IsEnum(ChatMessageType)
  @Column({
    type: 'varchar',
    length: 20,
    comment: '消息类型',
  })
  type: ChatMessageType;

  /**
   * 消息内容（文本消息的内容，或其他类型消息的说明）
   */
  @ApiPropertyOptional({ description: '消息内容' })
  @Expose()
  @IsOptional()
  @IsString()
  @Column({ type: 'text', nullable: true, comment: '消息内容' })
  content?: string;

  /**
   * 文件 URL（图片、视频、语音、文件的存储地址）
   */
  @ApiPropertyOptional({ description: '文件 URL' })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '文件 URL',
  })
  fileUrl?: string;

  /**
   * 文件名称（文件消息的文件名）
   */
  @ApiPropertyOptional({ description: '文件名称' })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '文件名称',
  })
  fileName?: string;

  /**
   * 文件大小（字节）
   */
  @ApiPropertyOptional({ description: '文件大小（字节）' })
  @Expose()
  @IsOptional()
  @Column({
    type: 'bigint',
    nullable: true,
    comment: '文件大小（字节）',
  })
  fileSize?: number;

  /**
   * 文件 MIME 类型
   */
  @ApiPropertyOptional({ description: '文件 MIME 类型' })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '文件 MIME 类型',
  })
  mimeType?: string;

  /**
   * 图片/视频宽度（像素）
   */
  @ApiPropertyOptional({ description: '图片/视频宽度（像素）' })
  @Expose()
  @IsOptional()
  @Column({
    type: 'int',
    nullable: true,
    comment: '图片/视频宽度（像素）',
  })
  width?: number;

  /**
   * 图片/视频高度（像素）
   */
  @ApiPropertyOptional({ description: '图片/视频高度（像素）' })
  @Expose()
  @IsOptional()
  @Column({
    type: 'int',
    nullable: true,
    comment: '图片/视频高度（像素）',
  })
  height?: number;

  /**
   * 语音/视频时长（秒）
   */
  @ApiPropertyOptional({ description: '语音/视频时长（秒）' })
  @Expose()
  @IsOptional()
  @Column({
    type: 'int',
    nullable: true,
    comment: '语音/视频时长（秒）',
  })
  duration?: number;

  /**
   * 消息状态
   */
  @ApiProperty({
    description: '消息状态',
    enum: ChatMessageStatus,
    default: ChatMessageStatus.SENT,
  })
  @Expose()
  @IsNotEmpty()
  @IsEnum(ChatMessageStatus)
  @Column({
    type: 'varchar',
    length: 20,
    default: ChatMessageStatus.SENT,
    comment: '消息状态',
  })
  status: ChatMessageStatus;

  /**
   * 是否已读
   */
  @ApiProperty({ description: '是否已读', default: false })
  @Expose()
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否已读',
  })
  isRead: boolean;

  /**
   * 已读时间
   */
  @ApiPropertyOptional({ description: '已读时间' })
  @Expose()
  @IsOptional()
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '已读时间',
  })
  readAt?: Date;

  /**
   * 扩展信息（JSON 格式）
   * 用于存储额外的消息数据，如缩略图、地理位置等
   */
  @ApiPropertyOptional({ description: '扩展信息（JSON 格式）' })
  @Expose()
  @IsOptional()
  @Column({ type: 'json', nullable: true, comment: '扩展信息（JSON 格式）' })
  extra?: Record<string, any>;

  // ========== 关系字段 ==========

  /**
   * 会话关系（多对一）
   */
  @ManyToOne(() => ChatConversationEntity, conversation => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: ChatConversationEntity;

  /**
   * 发送者关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: UserEntity;

  /**
   * 接收者关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver: UserEntity;
}
