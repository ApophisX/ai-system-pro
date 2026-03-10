import { Entity, Column, Index, ManyToMany } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { AssetEntity } from './asset.entity';

/**
 * 资产标签实体
 *
 * 用于资产标签管理，支持标签统计和热门标签查询
 * 与资产是多对多关系：一个标签可以关联多个资产，一个资产可以有多个标签
 */
@Entity('asset_tag')
@Index(['name'], { unique: true, where: 'deleted_at IS NULL' })
export class AssetTagEntity extends BaseEntity {
  /**
   * 标签名称（唯一标识）
   */
  @Expose()
  @Column({
    length: 50,
    comment: '标签名称（唯一标识）',
  })
  name: string;

  /**
   * 标签描述
   */
  @Expose()
  @Column({
    type: 'text',
    nullable: true,
    comment: '标签描述',
  })
  description?: string;

  /**
   * 使用次数（用于热门标签统计）
   */
  @Expose()
  @Column({
    type: 'int',
    default: 0,
    comment: '使用次数（用于热门标签统计）',
  })
  usageCount: number;

  /**
   * 排序权重（数字越大越靠前）
   */
  @Expose()
  @Column({
    type: 'int',
    default: 0,
    comment: '排序权重（数字越大越靠前）',
  })
  sortOrder: number;

  /**
   * 标签颜色（用于前端展示，如：#FF5722）
   */
  @Expose()
  @Column({
    length: 20,
    nullable: true,
    comment: '标签颜色（用于前端展示，如：#FF5722）',
  })
  color?: string;

  /**
   * 标签图标（URL 或图标标识）
   */
  @Expose()
  @Column({
    length: 500,
    nullable: true,
    comment: '标签图标（URL 或图标标识）',
  })
  icon?: string;

  /**
   * 资产关系（多对多）
   * 一个标签可以关联多个资产，一个资产可以有多个标签
   */
  @ManyToMany(() => AssetEntity, asset => asset.tags, {
    cascade: false,
    eager: false,
  })
  assets?: AssetEntity[];
}
