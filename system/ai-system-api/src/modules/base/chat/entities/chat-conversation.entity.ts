import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn, Unique } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsEnum, IsString, MaxLength } from 'class-validator';
import { ChatConversationStatus } from '../enums/chat-conversation-status.enum';
import { ChatMessageEntity } from './chat-message.entity';

/**
 * 聊天会话实体
 *
 * 管理两个用户之间的聊天会话
 */
@Entity('chat_conversation')
@Unique(['userId1', 'userId2'])
@Index('IDX_chat_conversation_user1_last', ['userId1', 'lastMessageAt'])
@Index('IDX_chat_conversation_user2_last', ['userId2', 'lastMessageAt'])
export class ChatConversationEntity extends BaseEntity {
  /**
   * 用户1 ID（较小的用户ID，用于唯一性约束）
   */
  @ApiProperty({ description: '用户1 ID' })
  @Expose()
  @IsNotEmpty()
  @Column({ type: 'uuid', comment: '用户1 ID', nullable: true })
  @Index()
  userId1: string;

  /**
   * 用户2 ID（较大的用户ID，用于唯一性约束）
   */
  @ApiProperty({ description: '用户2 ID' })
  @Expose()
  @IsNotEmpty()
  @Column({ type: 'uuid', comment: '用户2 ID', nullable: true })
  @Index()
  userId2: string;

  /**
   * 会话状态
   */
  @ApiProperty({
    description: '会话状态',
    enum: ChatConversationStatus,
    default: ChatConversationStatus.ACTIVE,
  })
  @Expose()
  @IsNotEmpty()
  @IsEnum(ChatConversationStatus)
  @Column({
    type: 'varchar',
    length: 20,
    default: ChatConversationStatus.ACTIVE,
    comment: '会话状态',
  })
  status: ChatConversationStatus;

  /**
   * 最后一条消息 ID
   */
  @ApiPropertyOptional({ description: '最后一条消息 ID' })
  @Expose()
  @IsOptional()
  @Column({ type: 'uuid', nullable: true, comment: '最后一条消息 ID' })
  lastMessageId?: string;

  /**
   * 最后一条消息内容（预览）
   */
  @ApiPropertyOptional({ description: '最后一条消息内容（预览）' })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '最后一条消息内容（预览）',
  })
  lastMessageContent?: string;

  /**
   * 最后一条消息时间
   */
  @ApiPropertyOptional({ description: '最后一条消息时间' })
  @Expose()
  @IsOptional()
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后一条消息时间',
  })
  lastMessageAt?: Date;

  /**
   * 用户1未读消息数
   */
  @ApiProperty({ description: '用户1未读消息数', default: 0 })
  @Expose()
  @Column({
    type: 'int',
    default: 0,
    comment: '用户1未读消息数',
  })
  unreadCount1: number;

  /**
   * 用户2未读消息数
   */
  @ApiProperty({ description: '用户2未读消息数', default: 0 })
  @Expose()
  @Column({
    type: 'int',
    default: 0,
    comment: '用户2未读消息数',
  })
  unreadCount2: number;

  /**
   * 用户1是否屏蔽了会话
   */
  @ApiProperty({ description: '用户1是否屏蔽了会话', default: false })
  @Expose()
  @Column({
    type: 'boolean',
    default: false,
    comment: '用户1是否屏蔽了会话',
  })
  blockedByUser1: boolean;

  /**
   * 用户2是否屏蔽了会话
   */
  @ApiProperty({ description: '用户2是否屏蔽了会话', default: false })
  @Expose()
  @Column({
    type: 'boolean',
    default: false,
    comment: '用户2是否屏蔽了会话',
  })
  blockedByUser2: boolean;

  /**
   * 用户1最后阅读时间
   */
  @ApiPropertyOptional({ description: '用户1最后阅读时间' })
  @Expose()
  @IsOptional()
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '用户1最后阅读时间',
  })
  lastReadAt1?: Date;

  /**
   * 用户2最后阅读时间
   */
  @ApiPropertyOptional({ description: '用户2最后阅读时间' })
  @Expose()
  @IsOptional()
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '用户2最后阅读时间',
  })
  lastReadAt2?: Date;

  // ========== 关系字段 ==========

  /**
   * 用户1关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id1' })
  user1: UserEntity;

  /**
   * 用户2关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id2' })
  user2: UserEntity;

  /**
   * 最后一条消息关系（多对一）
   */
  @ManyToOne(() => ChatMessageEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'last_message_id' })
  lastMessage: ChatMessageEntity;

  /**
   * 消息列表（一对多）
   */
  @OneToMany(() => ChatMessageEntity, message => message.conversation, {
    cascade: true,
  })
  messages: ChatMessageEntity[];

  /**
   * 获取对方的用户ID
   */
  getOtherUserId(currentUserId: string): string {
    return currentUserId === this.userId1 ? this.userId2 : this.userId1;
  }

  /**
   * 获取当前用户的未读消息数
   */
  getUnreadCount(currentUserId: string): number {
    return currentUserId === this.userId1 ? this.unreadCount1 : this.unreadCount2;
  }

  /**
   * 判断当前用户是否屏蔽了会话
   */
  isBlockedBy(currentUserId: string): boolean {
    return currentUserId === this.userId1 ? this.blockedByUser1 : this.blockedByUser2;
  }
}
