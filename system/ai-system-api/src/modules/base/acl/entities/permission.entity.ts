import { Entity, Column, Index, ManyToMany } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { PermissionAction, PermissionResource } from '../enums';
import { RoleEntity } from './role.entity';

/**
 * 权限实体
 *
 * 定义系统中的细粒度权限
 * 权限 = 资源 + 动作
 */
@Entity('acl_permission')
@Index(['resource', 'action'], { unique: true })
@Index(['code'], { unique: true })
export class PermissionEntity extends BaseEntity {
  /**
   * 权限代码（唯一标识）
   * 格式：resource:action，如 asset:create
   */
  @Expose()
  @Column({ length: 100, comment: '权限代码（唯一标识）' })
  code: string;

  /**
   * 权限名称
   */
  @Expose()
  @Column({ length: 100, comment: '权限名称' })
  name: string;

  /**
   * 权限描述
   */
  @Expose()
  @Column({ length: 500, nullable: true, comment: '权限描述' })
  description?: string;

  /**
   * 资源类型
   */
  @Expose()
  @Column({
    type: 'varchar',
    length: 50,
    comment: '资源类型',
  })
  resource: PermissionResource;

  /**
   * 操作动作
   */
  @Expose()
  @Column({
    type: 'varchar',
    length: 50,
    comment: '操作动作',
  })
  action: PermissionAction;

  /**
   * 权限分组（用于 UI 展示）
   */
  @Expose()
  @Column({ length: 50, nullable: true, comment: '权限分组' })
  group?: string;

  /**
   * 排序号
   */
  @Expose()
  @Column({ type: 'int', default: 0, comment: '排序号' })
  sortOrder: number;

  /** =========================================== RELATIONS =========================================== */

  /**
   * 关联角色（多对多）
   */
  @ManyToMany(() => RoleEntity, role => role.permissions)
  roles?: RoleEntity[];
}
