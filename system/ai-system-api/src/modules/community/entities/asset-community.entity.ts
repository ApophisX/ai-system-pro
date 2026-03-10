import { Entity, Column, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { AssetEntity } from '@/modules/asset/entities';
import { CommunityEntity } from './community.entity';

/**
 * 资产-社区关联实体
 *
 * 资产与社区的多对多关系，软删除+恢复模式
 */
@Entity('asset_community')
@Unique(['assetId', 'communityId'])
@Index('IDX_asset_community_asset', ['assetId'])
@Index('IDX_asset_community_asset_deleted', ['assetId', 'deletedAt'])
@Index('IDX_asset_community_community', ['communityId'])
export class AssetCommunityEntity extends BaseEntity {
  @ApiProperty({ description: '资产 ID' })
  @Expose()
  @IsNotEmpty()
  @Column({ type: 'uuid', comment: '资产 ID' })
  assetId: string;

  @ApiProperty({ description: '社区 ID' })
  @Expose()
  @IsNotEmpty()
  @Column({ type: 'uuid', comment: '社区 ID' })
  communityId: string;

  @ApiProperty({ description: '在社区内的排序权重' })
  @Expose()
  @Column({ type: 'int', default: 0, comment: '排序权重' })
  sortOrder: number;

  @ManyToOne(() => AssetEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id' })
  asset?: AssetEntity;

  @ManyToOne(() => CommunityEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'community_id' })
  community?: CommunityEntity;
}
