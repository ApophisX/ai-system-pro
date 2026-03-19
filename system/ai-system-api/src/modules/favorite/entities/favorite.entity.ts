import { Entity, Column, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

/**
 * 收藏实体
 *
 * 用户收藏资产的关系表
 */
@Entity('favorite')
@Index('IDX_favorite_user_created', ['userId', 'createdAt'])
@Unique(['userId', 'assetId'])
export class FavoriteEntity extends BaseEntity {
  /**
   * 用户 ID
   */
  @ApiProperty({ description: '用户 ID' })
  @Expose()
  @IsNotEmpty()
  @Column({ type: 'uuid', comment: '用户 ID' })
  @Index()
  userId: string;

  /**
   * 资产 ID
   */
  @ApiProperty({ description: '资产 ID' })
  @Expose()
  @IsNotEmpty()
  @Column({ type: 'uuid', comment: '资产 ID' })
  @Index()
  assetId: string;

  // ========== 关系字段 ==========

  /**
   * 用户关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
