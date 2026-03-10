import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RoleEntity } from '../entities';
import { RoleType } from '../enums';

/**
 * 角色仓储
 */
@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly repo: Repository<RoleEntity>,
  ) {}

  /**
   * 保存角色
   */
  async save(role: RoleEntity): Promise<RoleEntity> {
    return this.repo.save(role);
  }

  /**
   * 根据 ID 查找角色
   */
  async findById(id: string): Promise<RoleEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  /**
   * 根据角色代码查找
   */
  async findByCode(code: string): Promise<RoleEntity | null> {
    return this.repo.findOne({
      where: { code },
      relations: ['permissions'],
    });
  }

  /**
   * 根据多个角色代码查找
   */
  async findByCodes(codes: string[]): Promise<RoleEntity[]> {
    return this.repo.find({
      where: { code: In(codes) },
      relations: ['permissions'],
    });
  }

  /**
   * 查找所有角色
   */
  async findAll(): Promise<RoleEntity[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
      relations: ['permissions'],
    });
  }

  /**
   * 按类型查找角色
   */
  async findByType(type: RoleType): Promise<RoleEntity[]> {
    return this.repo.find({
      where: { type, isActive: true },
      order: { sortOrder: 'ASC' },
      relations: ['permissions'],
    });
  }

  /**
   * 查找默认角色
   */
  async findDefaultRoles(): Promise<RoleEntity[]> {
    return this.repo.find({
      where: { isDefault: true, isActive: true },
      relations: ['permissions'],
    });
  }

  /**
   * 检查角色代码是否存在
   */
  async existsByCode(code: string): Promise<boolean> {
    const count = await this.repo.count({ where: { code } });
    return count > 0;
  }

  /**
   * 更新角色（仅更新非关系字段）
   */
  async update(id: string, data: Partial<Omit<RoleEntity, 'permissions' | 'userRoles'>>): Promise<void> {
    await this.repo.update(id, data);
  }

  /**
   * 删除角色
   */
  async delete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
