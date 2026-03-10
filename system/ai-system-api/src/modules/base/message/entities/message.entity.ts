import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsEnum, IsString, MaxLength } from 'class-validator';
import { MessageType } from '../enums/message-type.enum';
import { MessageStatus } from '../enums/message-status.enum';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';

/**
 * 消息实体
 *
 * 用户消息中心的消息记录
 */
@Entity('message')
@Index('IDX_message_user_status', ['userId', 'status'])
@Index('IDX_message_user_type', ['userId', 'type'])
@Index('IDX_message_user_created', ['userId', 'createdAt'])
export class MessageEntity extends BaseEntity {
  /**
   * 用户 ID（接收者）
   */
  @ApiProperty({ description: '用户 ID（接收者）' })
  @Expose()
  @IsNotEmpty()
  @Column({ type: 'uuid', comment: '用户 ID（接收者）' })
  @Index()
  userId: string;

  /**
   * 消息类型
   */
  @Expose()
  @IsNotEmpty()
  @IsEnum(MessageType)
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    comment: '消息类型',
    apiOptions: {
      description:
        '消息类型：SYSTEM（系统消息）/ USER（用户消息）/ ORDER（订单消息）/ VERIFICATION（实名认证消息）/ PAYMENT（支付消息）/ ASSET（资产消息）/ REVIEW（评价消息）',
    },
  })
  type: MessageType;

  /**
   * 消息标题
   */
  @ApiProperty({ description: '消息标题' })
  @Expose()
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  @Column({ type: 'varchar', length: 200, comment: '消息标题' })
  title: string;

  /**
   * 消息内容
   */
  @ApiProperty({ description: '消息内容' })
  @Expose()
  @IsNotEmpty()
  @IsString()
  @Column({ type: 'text', comment: '消息内容' })
  content: string;

  /**
   * 消息状态
   */
  @ApiProperty({
    description: '消息状态',
    enum: MessageStatus,
    default: MessageStatus.UNREAD,
  })
  @Expose()
  @IsNotEmpty()
  @IsEnum(MessageStatus)
  @Column({
    type: 'varchar',
    length: 20,
    default: MessageStatus.UNREAD,
    comment: '消息状态',
  })
  status: MessageStatus;

  /**
   * 关联对象 ID（如订单 ID、资产 ID 等）
   */
  @ApiPropertyOptional({ description: '关联对象 ID（如订单 ID、资产 ID 等）' })
  @Expose()
  @IsOptional()
  @IsString()
  @Column({ type: 'uuid', nullable: true, comment: '关联对象 ID' })
  relatedId?: string;

  /**
   * 关联对象类型（如 ORDER、ASSET 等）
   */
  @ApiPropertyOptional({ description: '关联对象类型（如 ORDER、ASSET 等）' })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '关联对象类型',
  })
  relatedType?: string;

  /**
   * 扩展信息（JSON 格式）
   * 用于存储额外的消息数据，如跳转链接、图片等
   */
  @ApiPropertyOptional({ description: '扩展信息（JSON 格式）' })
  @Expose()
  @IsOptional()
  @Column({ type: 'json', nullable: true, comment: '扩展信息（JSON 格式）' })
  extra?: Record<string, any>;

  /**
   * 阅读时间
   */
  @ApiPropertyOptional({ description: '阅读时间' })
  @Expose()
  @IsOptional()
  @Column({ type: 'timestamp', nullable: true, comment: '阅读时间' })
  readAt?: Date | null;

  // ========== 关系字段 ==========

  /**
   * 用户关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  // ====================================== Virtual Fields ===========================================

  /**
   * 消息状态标签
   */
  get isUnread(): boolean {
    return this.status === MessageStatus.UNREAD;
  }

  /**
   * 消息状态标签
   */
  get isRead(): boolean {
    return this.status === MessageStatus.READ;
  }
}
