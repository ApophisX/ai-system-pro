import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RoleRepository, PermissionRepository, UserRoleRepository } from '../repositories';
import { RoleEntity, PermissionEntity } from '../entities';
import { RoleType } from '../enums';
import { CreateRoleDto, UpdateRoleDto } from '../dto';
import { AclService } from './acl.service';

/**
 * 角色管理服务
 *
 * 提供角色的 CRUD 操作
 */
@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    private roleRepo: RoleRepository,
    private permissionRepo: PermissionRepository,
    private userRoleRepo: UserRoleRepository,
    private aclService: AclService,
    private dataSource: DataSource,
  ) {}

  /**
   * 创建角色
   */
  async create(dto: CreateRoleDto): Promise<RoleEntity> {
    // 检查角色代码是否已存在
    const exists = await this.roleRepo.existsByCode(dto.code);
    if (exists) {
      throw new ConflictException(`角色代码已存在: ${dto.code}`);
    }

    // 验证权限代码
    let permissions: PermissionEntity[] = [];
    if (dto.permissionCodes && dto.permissionCodes.length > 0) {
      permissions = await this.permissionRepo.findByCodes(dto.permissionCodes);
      if (permissions.length !== dto.permissionCodes.length) {
        throw new BadRequestException('部分权限代码无效');
      }
    }

    const role = new RoleEntity();
    role.code = dto.code;
    role.name = dto.name;
    role.description = dto.description;
    role.type = RoleType.CUSTOM;
    role.isDefault = dto.isDefault || false;
    role.permissions = permissions;

    const saved = await this.roleRepo.save(role);
    this.logger.log(`创建角色: ${saved.code}`);

    return saved;
  }

  /**
   * 更新角色
   */
  async update(id: string, dto: UpdateRoleDto): Promise<RoleEntity> {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 系统角色不允许修改代码
    if (role.type === RoleType.SYSTEM && dto.code && dto.code !== role.code) {
      throw new BadRequestException('系统角色不允许修改代码');
    }

    // 检查新代码是否冲突
    if (dto.code && dto.code !== role.code) {
      const exists = await this.roleRepo.existsByCode(dto.code);
      if (exists) {
        throw new ConflictException(`角色代码已存在: ${dto.code}`);
      }
      role.code = dto.code;
    }

    if (dto.name !== undefined) role.name = dto.name;
    if (dto.description !== undefined) role.description = dto.description;
    if (dto.isDefault !== undefined) role.isDefault = dto.isDefault;

    // 更新权限
    if (dto.permissionCodes !== undefined) {
      if (dto.permissionCodes.length > 0) {
        const permissions = await this.permissionRepo.findByCodes(dto.permissionCodes);
        if (permissions.length !== dto.permissionCodes.length) {
          throw new BadRequestException('部分权限代码无效');
        }
        role.permissions = permissions;
      } else {
        role.permissions = [];
      }
    }

    const saved = await this.roleRepo.save(role);

    // 清除所有用户缓存（因为角色权限可能变更）
    this.aclService.clearAllCache();

    this.logger.log(`更新角色: ${saved.code}`);

    return saved;
  }

  /**
   * 删除角色
   */
  async delete(id: string): Promise<void> {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 系统角色不允许删除
    if (role.type === RoleType.SYSTEM) {
      throw new BadRequestException('系统角色不允许删除');
    }

    // 检查是否有用户关联
    const userRoles = await this.userRoleRepo.findByRoleId(id);
    if (userRoles.length > 0) {
      throw new BadRequestException(`该角色已被 ${userRoles.length} 个用户使用，无法删除`);
    }

    await this.roleRepo.delete(id);
    this.logger.log(`删除角色: ${role.code}`);
  }

  /**
   * 获取角色详情
   */
  async getById(id: string): Promise<RoleEntity> {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    return role;
  }

  /**
   * 根据角色代码获取
   */
  async getByCode(code: string): Promise<RoleEntity> {
    const role = await this.roleRepo.findByCode(code);
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    return role;
  }

  /**
   * 获取所有角色
   */
  async getAll(): Promise<RoleEntity[]> {
    return this.roleRepo.findAll();
  }

  /**
   * 获取所有权限列表
   */
  async getAllPermissions(): Promise<PermissionEntity[]> {
    return this.permissionRepo.findAll();
  }

  /**
   * 为角色添加权限
   */
  async addPermissions(roleId: string, permissionCodes: string[]): Promise<RoleEntity> {
    const role = await this.roleRepo.findById(roleId);
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const newPermissions = await this.permissionRepo.findByCodes(permissionCodes);
    const existingCodes = new Set(role.permissions?.map(p => p.code) || []);

    for (const permission of newPermissions) {
      if (!existingCodes.has(permission.code)) {
        role.permissions = [...(role.permissions || []), permission];
      }
    }

    const saved = await this.roleRepo.save(role);

    // 清除缓存
    this.aclService.clearAllCache();

    return saved;
  }

  /**
   * 移除角色权限
   */
  async removePermissions(roleId: string, permissionCodes: string[]): Promise<RoleEntity> {
    const role = await this.roleRepo.findById(roleId);
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const codesToRemove = new Set(permissionCodes);
    role.permissions = (role.permissions || []).filter(p => !codesToRemove.has(p.code));

    const saved = await this.roleRepo.save(role);

    // 清除缓存
    this.aclService.clearAllCache();

    return saved;
  }
}
