import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { RoleEntity } from './role.entity';
import { UserEntity } from '../../user/entities/user.entity';

/**
 * 用户角色关联实体
 *
 * 定义用户与角色的多对多关系
 * 支持角色的有效期和来源追踪
 */
@Entity('acl_user_role')
@Index(['userId', 'roleId'], { unique: true })
export class UserRoleEntity extends BaseEntity {
  /**
   * 用户 ID
   */
  @Expose()
  @Column({ type: 'uuid', comment: '用户 ID' })
  @Index()
  userId: string;

  /**
   * 角色 ID
   */
  @Expose()
  @Column({ type: 'uuid', comment: '角色 ID' })
  @Index()
  roleId: string;

  /**
   * 角色生效时间
   */
  @Expose()
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '角色生效时间',
  })
  effectiveFrom?: Date;

  /**
   * 角色失效时间
   */
  @Expose()
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '角色失效时间',
  })
  effectiveUntil?: Date;

  /**
   * 角色分配来源
   * 如：system（系统自动）、admin（管理员分配）、upgrade（用户升级）
   */
  @Expose()
  @Column({
    length: 50,
    nullable: true,
    comment: '角色分配来源',
  })
  source?: string;

  /** =========================================== RELATIONS =========================================== */

  /**
   * 关联用户
   */
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  /**
   * 关联角色
   */
  @ManyToOne(() => RoleEntity, role => role.userRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role?: RoleEntity;
}
