import { Entity, Column, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import { CommunityEntity } from './community.entity';
import { CommunityMemberRole } from '../enums';

/**
 * 社区成员实体
 *
 * 用户与社区的多对多关系，软删除+恢复模式
 */
@Entity('community_member')
@Unique(['communityId', 'userId'])
@Index('IDX_community_member_user', ['userId'])
@Index('IDX_community_member_community', ['communityId'])
export class CommunityMemberEntity extends BaseEntity {
  @ApiProperty({ description: '社区 ID' })
  @Expose()
  @IsNotEmpty()
  @Column({ type: 'uuid', comment: '社区 ID' })
  communityId: string;

  @ApiProperty({ description: '用户 ID' })
  @Expose()
  @IsNotEmpty()
  @Column({ type: 'uuid', comment: '用户 ID' })
  userId: string;

  @ApiProperty({ description: '成员角色', enum: CommunityMemberRole })
  @Expose()
  @IsNotEmpty()
  @Column({ type: 'enum', enum: CommunityMemberRole, default: CommunityMemberRole.MEMBER, comment: '成员角色' })
  role: CommunityMemberRole;

  @ApiProperty({ description: '加入时间' })
  @Expose()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', comment: '加入时间' })
  joinedAt: Date;

  @ManyToOne(() => CommunityEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'community_id' })
  community?: CommunityEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
