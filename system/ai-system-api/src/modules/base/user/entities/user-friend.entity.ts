import { Entity, Column, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { UserEntity } from './user.entity';
import { FriendStatus } from '../enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

/**
 * 用户好友关系实体
 *
 * 存储用户之间的好友关系，支持单向关系（userId -> friendId）
 * 查询时需要双向查询（A->B 或 B->A）来确定好友关系
 */
@Entity('user_friend')
@Unique(['userId', 'friendId'])
@Index('IDX_user_friend_user_status', ['userId', 'status'])
@Index('IDX_user_friend_friend_status', ['friendId', 'status'])
export class UserFriendEntity extends BaseEntity {
  /**
   * 用户 ID（发起好友关系的用户）
   */
  @ApiProperty({ description: '用户 ID（发起好友关系的用户）' })
  @Expose()
  @Column({ type: 'uuid', comment: '用户 ID（发起好友关系的用户）' })
  @IsNotEmpty()
  @Index()
  userId: string;

  /**
   * 好友 ID（被添加的用户）
   */
  @ApiProperty({ description: '好友 ID（被添加的用户）' })
  @Expose()
  @Column({ type: 'uuid', comment: '好友 ID（被添加的用户）' })
  @IsNotEmpty()
  @Index()
  friendId: string;

  /**
   * 好友状态：pending（待确认）/ accepted（已接受）/ blocked（已屏蔽）
   */
  @ApiProperty({
    description: '好友状态：pending（待确认）/ accepted（已接受）/ blocked（已屏蔽）',
    enum: FriendStatus,
  })
  @Expose()
  @Column({
    type: 'enum',
    enum: FriendStatus,
    default: FriendStatus.PENDING,
    comment: '好友状态：pending（待确认）/ accepted（已接受）/ blocked（已屏蔽）',
  })
  status: FriendStatus;

  /**
   * 申请时间（发送好友请求的时间）
   */
  @ApiProperty({ description: '申请时间（发送好友请求的时间）' })
  @Expose()
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '申请时间（发送好友请求的时间）',
  })
  appliedAt: Date;

  /**
   * 确认时间（对方接受好友请求的时间）
   */
  @ApiPropertyOptional({ description: '确认时间（对方接受好友请求的时间）' })
  @Expose()
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '确认时间（对方接受好友请求的时间）',
  })
  acceptedAt?: Date;

  /** =========================================== RELATIONS =========================================== */
  /**
   * 用户关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  /**
   * 好友关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'friend_id' })
  friend?: UserEntity;
}
