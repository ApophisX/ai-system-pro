import { Entity, Column, Index, ManyToMany, Tree, TreeChildren, TreeParent, JoinColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { AssetEntity } from './asset.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 资产分类实体
 *
 * 支持树形结构的资产分类体系
 * 使用 TypeORM Tree 装饰器实现闭包表（Closure Table）树形结构
 * 一个分类可以包含多个子分类，一个分类只能有一个父分类
 * 与资产是多对多关系，一个资产可以属于多个分类，一个分类可以包含多个资产
 */
@Entity('asset_category')
@Tree('closure-table')
@Index(['code'], { unique: true, where: 'deleted_at IS NULL' })
export class AssetCategoryEntity extends BaseEntity {
  /**
   * 分类代码（唯一标识，如：TOOLS、ELECTRONICS）
   */
  @ApiProperty({ description: '分类代码' })
  @Expose()
  @Column({
    length: 50,
    comment: '分类代码（唯一标识）',
    nullable: true,
  })
  code: string;

  /**
   * 分类名称
   */
  @ApiPropertyOptional({ description: '分类名称' })
  @Expose()
  @Column({
    length: 100,
    comment: '分类名称',
    nullable: true,
  })
  name: string;

  /**
   * 分类描述
   */
  @ApiPropertyOptional({ description: '分类描述' })
  @Expose()
  @Column({
    type: 'text',
    nullable: true,
    comment: '分类描述',
  })
  description?: string;

  /**
   * 分类图标（URL 或图标标识）
   */
  @ApiPropertyOptional({ description: '分类图标' })
  @Expose()
  @Column({
    length: 500,
    nullable: true,
    comment: '分类图标（URL 或图标标识）',
  })
  icon?: string;

  /**
   * 排序权重（数字越大越靠前）
   */
  @ApiProperty({ description: '排序权重' })
  @Expose()
  @Column({
    type: 'int',
    default: 0,
    comment: '排序权重（数字越大越靠前）',
  })
  sortOrder: number;

  /**
   * 分类属性（JSON 对象，存储扩展属性）
   */
  @ApiPropertyOptional({ description: '分类属性' })
  @Expose()
  @Column({
    type: 'json',
    nullable: true,
    comment: '分类属性（JSON 对象）',
  })
  attributes?: Record<string, unknown>;

  /**
   * 是否显示在首页
   */
  @ApiProperty({ description: '是否显示在首页' })
  @Expose()
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否显示在首页',
  })
  displayOnHome: boolean = false;

  /** =========================================== TREE RELATIONS =========================================== */
  /**
   * 父分类关系（树形结构）
   * TypeORM Tree 装饰器自动管理
   */
  @TreeParent({ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent?: AssetCategoryEntity;

  /**
   * 子分类关系（树形结构）
   * TypeORM Tree 装饰器自动管理
   */
  @TreeChildren({ cascade: true })
  children?: AssetCategoryEntity[];

  // /**
  //  * 资产关系（多对多）
  //  * 一个分类可以包含多个资产，一个资产可以属于多个分类
  //  */
  // @ManyToMany(() => AssetEntity, (asset) => asset.categories, { eager: false })
  // assets?: AssetEntity[];
}
