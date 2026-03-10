import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PermissionEntity } from '../entities';
import { PermissionAction, PermissionResource } from '../enums';

/**
 * 权限仓储
 */
@Injectable()
export class PermissionRepository {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly repo: Repository<PermissionEntity>,
  ) {}

  /**
   * 保存权限
   */
  async save(permission: PermissionEntity): Promise<PermissionEntity> {
    return this.repo.save(permission);
  }

  /**
   * 批量保存权限
   */
  async saveMany(permissions: PermissionEntity[]): Promise<PermissionEntity[]> {
    return this.repo.save(permissions);
  }

  /**
   * 根据 ID 查找权限
   */
  async findById(id: string): Promise<PermissionEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * 根据权限代码查找
   */
  async findByCode(code: string): Promise<PermissionEntity | null> {
    return this.repo.findOne({ where: { code } });
  }

  /**
   * 根据多个权限代码查找
   */
  async findByCodes(codes: string[]): Promise<PermissionEntity[]> {
    return this.repo.find({ where: { code: In(codes) } });
  }

  /**
   * 根据资源和动作查找
   */
  async findByResourceAndAction(
    resource: PermissionResource,
    action: PermissionAction,
  ): Promise<PermissionEntity | null> {
    return this.repo.findOne({ where: { resource, action } });
  }

  /**
   * 查找所有权限
   */
  async findAll(): Promise<PermissionEntity[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { group: 'ASC', sortOrder: 'ASC' },
    });
  }

  /**
   * 按分组查找权限
   */
  async findByGroup(group: string): Promise<PermissionEntity[]> {
    return this.repo.find({
      where: { group, isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  /**
   * 检查权限是否存在
   */
  async existsByCode(code: string): Promise<boolean> {
    const count = await this.repo.count({ where: { code } });
    return count > 0;
  }

  /**
   * 删除权限
   */
  async delete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
