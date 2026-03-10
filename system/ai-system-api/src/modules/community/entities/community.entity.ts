import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import { CommunityType, CommunityStatus } from '../enums';
import { CommunityStatusMap } from '../enums/community-status.enum';

/**
 * 社区实体
 *
 * 用户创建的商品聚合空间，经平台审核后生效
 */
@Entity('community')
@Index('IDX_community_status_type', ['status', 'type'])
@Index('IDX_community_creator', ['creatorId'])
export class CommunityEntity extends BaseEntity {
  @ApiProperty({ description: '社区名称' })
  @Expose()
  @IsNotEmpty()
  @Column({ type: 'varchar', length: 100, comment: '社区名称' })
  name: string;

  @ApiPropertyOptional({ description: '社区描述' })
  @Expose()
  @IsOptional()
  @Column({ type: 'text', nullable: true, comment: '社区描述' })
  description?: string;

  @ApiPropertyOptional({ description: '封面图 URL' })
  @Expose()
  @IsOptional()
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '封面图 URL' })
  coverImage?: string;

  @ApiProperty({ description: '社区类型', enum: CommunityType })
  @Expose()
  @IsNotEmpty()
  @Column({ type: 'enum', enum: CommunityType, default: CommunityType.PUBLIC, comment: '社区类型' })
  type: CommunityType;

  @ApiProperty({ description: '社区状态', enum: CommunityStatus })
  @Expose()
  @IsNotEmpty()
  @Column({ type: 'enum', enum: CommunityStatus, default: CommunityStatus.PENDING, comment: '社区状态' })
  status: CommunityStatus;

  @ApiPropertyOptional({ description: '邀请码（私密社区必填）' })
  @Expose()
  @IsOptional()
  @Column({ type: 'varchar', length: 20, nullable: true, unique: true, comment: '邀请码' })
  inviteCode?: string;

  @ApiProperty({ description: '创建者用户 ID' })
  @Expose()
  @IsNotEmpty()
  @Column({ type: 'uuid', comment: '创建者用户 ID' })
  creatorId: string;

  @ApiPropertyOptional({ description: '审核人 ID' })
  @Expose()
  @IsOptional()
  @Column({ type: 'uuid', nullable: true, comment: '审核人 ID' })
  auditById?: string;

  @ApiPropertyOptional({ description: '审核时间' })
  @Expose()
  @IsOptional()
  @Column({ type: 'timestamp', nullable: true, comment: '审核时间' })
  auditAt?: Date;

  @ApiPropertyOptional({ description: '审核意见（拒绝时填写）' })
  @Expose()
  @IsOptional()
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '审核意见' })
  auditRemark?: string;

  @ApiProperty({ description: '成员数量（冗余）' })
  @Expose()
  @Column({ type: 'int', default: 0, comment: '成员数量' })
  memberCount: number;

  @ApiProperty({ description: '绑定资产数量（冗余）' })
  @Expose()
  @Column({ type: 'int', default: 0, comment: '绑定资产数量' })
  assetCount: number;

  @ApiProperty({ description: '排序权重（越大越靠前）' })
  @Expose()
  @Column({ type: 'int', default: 0, comment: '排序权重' })
  sortOrder: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'creator_id' })
  creator?: UserEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'audit_by_id' })
  auditBy?: UserEntity;

  get statusText(): string {
    return CommunityStatusMap[this.status];
  }
}
