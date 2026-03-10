import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual, MoreThanOrEqual, IsNull, Or } from 'typeorm';
import { UserRoleEntity } from '../entities';

/**
 * 用户角色关联仓储
 */
@Injectable()
export class UserRoleRepository {
  constructor(
    @InjectRepository(UserRoleEntity)
    private readonly repo: Repository<UserRoleEntity>,
  ) {}

  /**
   * 保存用户角色关联
   */
  async save(userRole: UserRoleEntity): Promise<UserRoleEntity> {
    return this.repo.save(userRole);
  }

  /**
   * 批量保存用户角色关联
   */
  async saveMany(userRoles: UserRoleEntity[]): Promise<UserRoleEntity[]> {
    return this.repo.save(userRoles);
  }

  /**
   * 根据用户 ID 查找所有角色关联
   */
  async findByUserId(userId: string): Promise<UserRoleEntity[]> {
    return this.repo.find({
      where: { userId, isActive: true },
      relations: ['role', 'role.permissions'],
    });
  }

  /**
   * 根据用户 ID 查找有效的角色关联（考虑有效期）
   */
  async findEffectiveByUserId(userId: string): Promise<UserRoleEntity[]> {
    const now = new Date();
    return this.repo.find({
      where: {
        userId,
        isActive: true,
        effectiveFrom: Or(IsNull(), LessThanOrEqual(now)),
        effectiveUntil: Or(IsNull(), MoreThanOrEqual(now)),
      },
      relations: ['role', 'role.permissions'],
    });
  }

  /**
   * 根据角色 ID 查找所有用户关联
   */
  async findByRoleId(roleId: string): Promise<UserRoleEntity[]> {
    return this.repo.find({
      where: { roleId, isActive: true },
      relations: ['user'],
    });
  }

  /**
   * 检查用户是否拥有指定角色
   */
  async hasRole(userId: string, roleId: string): Promise<boolean> {
    const now = new Date();
    const count = await this.repo.count({
      where: {
        userId,
        roleId,
        isActive: true,
        effectiveFrom: Or(IsNull(), LessThanOrEqual(now)),
        effectiveUntil: Or(IsNull(), MoreThanOrEqual(now)),
      },
    });
    return count > 0;
  }

  /**
   * 检查用户是否拥有任一指定角色
   */
  async hasAnyRole(userId: string, roleIds: string[]): Promise<boolean> {
    const now = new Date();
    const count = await this.repo.count({
      where: {
        userId,
        roleId: In(roleIds),
        isActive: true,
        effectiveFrom: Or(IsNull(), LessThanOrEqual(now)),
        effectiveUntil: Or(IsNull(), MoreThanOrEqual(now)),
      },
    });
    return count > 0;
  }

  /**
   * 删除用户角色关联
   */
  async delete(userId: string, roleId: string): Promise<void> {
    await this.repo.softDelete({ userId, roleId });
  }

  /**
   * 删除用户的所有角色关联
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.repo.softDelete({ userId });
  }

  /**
   * 物理删除用户角色关联
   */
  async hardDelete(userId: string, roleId: string): Promise<void> {
    await this.repo.delete({ userId, roleId });
  }
}
