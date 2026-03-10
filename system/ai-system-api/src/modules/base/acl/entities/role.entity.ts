import { Entity, Column, Index, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { RoleType } from '../enums';
import { PermissionEntity } from './permission.entity';
import { UserRoleEntity } from './user-role.entity';

/**
 * 角色实体
 *
 * 定义系统中的角色，角色是权限的集合
 */
@Entity('acl_role')
@Index(['code'], { unique: true })
export class RoleEntity extends BaseEntity {
  /**
   * 角色代码（唯一标识）
   */
  @Expose()
  @Column({ length: 50, comment: '角色代码（唯一标识）' })
  code: string;

  /**
   * 角色名称
   */
  @Expose()
  @Column({ length: 100, comment: '角色名称' })
  name: string;

  /**
   * 角色描述
   */
  @Expose()
  @Column({ length: 500, nullable: true, comment: '角色描述' })
  description?: string;

  /**
   * 角色类型：system（系统内置）/ custom（自定义）
   */
  @Expose()
  @Column({
    type: 'enum',
    enum: RoleType,
    default: RoleType.CUSTOM,
    comment: '角色类型：system（系统内置）/ custom（自定义）',
  })
  type: RoleType;

  /**
   * 是否为默认角色（新用户自动分配）
   */
  @Expose()
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为默认角色',
  })
  isDefault: boolean;

  /**
   * 排序号
   */
  @Expose()
  @Column({ type: 'int', default: 0, comment: '排序号' })
  sortOrder: number;

  /** =========================================== RELATIONS =========================================== */

  /**
   * 关联权限（多对多）
   */
  @ManyToMany(() => PermissionEntity, permission => permission.roles, {
    cascade: false,
  })
  @JoinTable({
    name: 'acl_role_permission',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions?: PermissionEntity[];

  /**
   * 用户角色关系
   */
  @OneToMany(() => UserRoleEntity, userRole => userRole.role)
  userRoles?: UserRoleEntity[];
}
