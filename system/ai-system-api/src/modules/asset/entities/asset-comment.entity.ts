import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import { AssetEntity } from '@/modules/asset/entities/asset.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, IsUUID } from 'class-validator';

/**
 * 资产留言实体
 *
 * 用户对资产进行留言，支持发布者回复
 */
@Entity('asset_comment')
@Index('IDX_asset_comment_asset_parent', ['assetId', 'parentId'])
@Index('IDX_asset_comment_asset_created', ['assetId', 'createdAt'])
export class AssetCommentEntity extends BaseEntity {
  /**
   * 资产 ID
   */
  @ApiProperty({ description: '资产 ID' })
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  @Column({ type: 'uuid', comment: '资产 ID' })
  @Index()
  assetId: string;

  /**
   * 留言用户 ID
   */
  @ApiProperty({ description: '留言用户 ID' })
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  @Column({ type: 'uuid', comment: '留言用户 ID' })
  @Index()
  userId: string;

  /**
   * 留言内容
   */
  @ApiProperty({ description: '留言内容' })
  @Expose()
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  @Column({ type: 'text', comment: '留言内容' })
  content: string;

  /**
   * 父留言 ID（用于回复，null 表示顶级留言）
   */
  @ApiPropertyOptional({ description: '父留言 ID（用于回复）' })
  @Expose()
  @IsOptional()
  @IsUUID()
  @Column({ type: 'uuid', nullable: true, comment: '父留言 ID（用于回复）' })
  parentId?: string | null;

  /**
   * 回复的用户 ID（当 parentId 不为空时，表示回复给哪个用户）
   */
  @ApiPropertyOptional({ description: '回复的用户 ID' })
  @Expose()
  @IsOptional()
  @IsUUID()
  @Column({ type: 'uuid', nullable: true, comment: '回复的用户 ID' })
  replyToUserId?: string | null;

  /**
   * 点赞数
   */
  @ApiProperty({ description: '点赞数', default: 0 })
  @Expose()
  @Column({ type: 'int', default: 0, comment: '点赞数' })
  likeCount: number = 0;

  // ========== 关系字段 ==========

  /**
   * 资产关系（多对一）
   */
  @ManyToOne(() => AssetEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id' })
  asset: AssetEntity;

  /**
   * 留言用户关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  /**
   * 父留言关系（自关联，多对一）
   */
  @ManyToOne(() => AssetCommentEntity, comment => comment.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: AssetCommentEntity | null;

  /**
   * 回复列表（自关联，一对多）
   */
  @OneToMany(() => AssetCommentEntity, comment => comment.parent, {
    cascade: false,
  })
  replies?: AssetCommentEntity[];

  /**
   * 被回复的用户关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reply_to_user_id' })
  replyToUser?: UserEntity | null;
}
