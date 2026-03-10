import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PermissionRepository, RoleRepository, UserRoleRepository } from '../repositories';
import { PermissionEntity, RoleEntity, UserRoleEntity } from '../entities';
import { PermissionAction, PermissionResource, SystemRoleCode } from '../enums';
import { SYSTEM_PERMISSIONS, DEFAULT_ROLES, generatePermissionCode } from '../constants';

/**
 * ACL 核心服务
 *
 * 提供权限检查和角色管理的核心功能
 */
@Injectable()
export class AclService implements OnModuleInit {
  private readonly logger = new Logger(AclService.name);

  // 权限缓存（用户ID -> 权限代码集合）
  private permissionCache = new Map<string, Set<string>>();
  // 角色缓存（用户ID -> 角色代码集合）
  private roleCache = new Map<string, Set<string>>();

  constructor(
    private permissionRepo: PermissionRepository,
    private roleRepo: RoleRepository,
    private userRoleRepo: UserRoleRepository,
    private dataSource: DataSource,
  ) {}

  /**
   * 模块初始化时同步权限和角色数据
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.syncPermissions();
      await this.syncRoles();
      this.logger.log('ACL 权限和角色数据同步完成');
    } catch (error) {
      this.logger.error('ACL 数据同步失败', error);
    }
  }

  // ========== 权限检查方法 ==========

  /**
   * 检查用户是否拥有指定权限
   */
  async hasPermission(userId: string, permissionCode: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.has(permissionCode);
  }

  /**
   * 检查用户是否拥有任一指定权限
   */
  async hasAnyPermission(userId: string, permissionCodes: string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissionCodes.some(code => permissions.has(code));
  }

  /**
   * 检查用户是否拥有所有指定权限
   */
  async hasAllPermissions(userId: string, permissionCodes: string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissionCodes.every(code => permissions.has(code));
  }

  /**
   * 检查用户是否拥有资源操作权限
   */
  async hasResourcePermission(
    userId: string,
    resource: PermissionResource,
    action: PermissionAction,
  ): Promise<boolean> {
    const code = generatePermissionCode(resource, action);
    return this.hasPermission(userId, code);
  }

  // ========== 角色检查方法 ==========

  /**
   * 检查用户是否拥有指定角色
   */
  async hasRole(userId: string, roleCode: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.has(roleCode);
  }

  /**
   * 检查用户是否拥有任一指定角色
   */
  async hasAnyRole(userId: string, roleCodes: string[]): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roleCodes.some(code => roles.has(code));
  }

  /**
   * 检查用户是否为超级管理员
   */
  async isSuperAdmin(userId: string): Promise<boolean> {
    return this.hasRole(userId, SystemRoleCode.SUPER_ADMIN);
  }

  /**
   * 检查用户是否为平台管理员
   */
  async isPlatformAdmin(userId: string): Promise<boolean> {
    return this.hasAnyRole(userId, [SystemRoleCode.SUPER_ADMIN, SystemRoleCode.PLATFORM_ADMIN]);
  }

  // ========== 用户权限/角色获取方法 ==========

  /**
   * 获取用户的所有权限代码
   */
  async getUserPermissions(userId: string): Promise<Set<string>> {
    // 检查缓存
    if (this.permissionCache.has(userId)) {
      return this.permissionCache.get(userId)!;
    }

    // 从数据库加载
    const userRoles = await this.userRoleRepo.findEffectiveByUserId(userId);
    const permissions = new Set<string>();

    for (const userRole of userRoles) {
      if (userRole.role?.permissions) {
        for (const permission of userRole.role.permissions) {
          permissions.add(permission.code);
        }
      }
    }

    // 存入缓存
    this.permissionCache.set(userId, permissions);

    return permissions;
  }

  /**
   * 获取用户的所有角色代码
   */
  async getUserRoles(userId: string): Promise<Set<string>> {
    // 检查缓存
    if (this.roleCache.has(userId)) {
      return this.roleCache.get(userId)!;
    }

    // 从数据库加载
    const userRoles = await this.userRoleRepo.findEffectiveByUserId(userId);
    const roles = new Set<string>();

    for (const userRole of userRoles) {
      if (userRole.role) {
        roles.add(userRole.role.code);
      }
    }

    // 存入缓存
    this.roleCache.set(userId, roles);

    return roles;
  }

  /**
   * 获取用户的角色列表（完整信息）
   */
  async getUserRoleEntities(userId: string): Promise<RoleEntity[]> {
    const userRoles = await this.userRoleRepo.findEffectiveByUserId(userId);
    return userRoles.map(ur => ur.role).filter((role): role is RoleEntity => role !== undefined);
  }

  // ========== 缓存管理方法 ==========

  /**
   * 清除用户权限缓存
   */
  clearUserCache(userId: string): void {
    this.permissionCache.delete(userId);
    this.roleCache.delete(userId);
  }

  /**
   * 清除所有缓存
   */
  clearAllCache(): void {
    this.permissionCache.clear();
    this.roleCache.clear();
  }

  // ========== 角色分配方法 ==========

  /**
   * 为用户分配角色
   */
  async assignRole(
    userId: string,
    roleCode: string,
    options?: {
      effectiveFrom?: Date;
      effectiveUntil?: Date;
      source?: string;
    },
  ): Promise<UserRoleEntity> {
    const role = await this.roleRepo.findByCode(roleCode);
    if (!role) {
      throw new Error(`角色不存在: ${roleCode}`);
    }

    const userRole = new UserRoleEntity();
    userRole.userId = userId;
    userRole.roleId = role.id;
    userRole.effectiveFrom = options?.effectiveFrom;
    userRole.effectiveUntil = options?.effectiveUntil;
    userRole.source = options?.source || 'system';

    const saved = await this.userRoleRepo.save(userRole);

    // 清除缓存
    this.clearUserCache(userId);

    return saved;
  }

  /**
   * 为用户分配默认角色
   */
  async assignDefaultRoles(userId: string): Promise<UserRoleEntity[]> {
    const defaultRoles = await this.roleRepo.findDefaultRoles();
    const userRoles: UserRoleEntity[] = [];

    for (const role of defaultRoles) {
      const userRole = new UserRoleEntity();
      userRole.userId = userId;
      userRole.roleId = role.id;
      userRole.source = 'system';
      userRoles.push(userRole);
    }

    const saved = await this.userRoleRepo.saveMany(userRoles);

    // 清除缓存
    this.clearUserCache(userId);

    return saved;
  }

  /**
   * 移除用户角色
   */
  async removeRole(userId: string, roleCode: string): Promise<void> {
    const role = await this.roleRepo.findByCode(roleCode);
    if (!role) {
      return;
    }

    await this.userRoleRepo.delete(userId, role.id);

    // 清除缓存
    this.clearUserCache(userId);
  }

  // ========== 数据同步方法 ==========

  /**
   * 同步系统预置权限
   */
  private async syncPermissions(): Promise<void> {
    for (const permDef of SYSTEM_PERMISSIONS) {
      const exists = await this.permissionRepo.existsByCode(permDef.code);
      if (!exists) {
        const permission = new PermissionEntity();
        permission.code = permDef.code;
        permission.name = permDef.name;
        permission.description = permDef.description;
        permission.resource = permDef.resource;
        permission.action = permDef.action;
        permission.group = permDef.group;
        await this.permissionRepo.save(permission);
        this.logger.debug(`创建权限: ${permDef.code}`);
      }
    }
  }

  /**
   * 同步系统预置角色
   */
  private async syncRoles(): Promise<void> {
    for (const roleDef of DEFAULT_ROLES) {
      let role = await this.roleRepo.findByCode(roleDef.code);

      if (!role) {
        role = new RoleEntity();
        role.code = roleDef.code;
        role.name = roleDef.name;
        role.description = roleDef.description;
        role.type = roleDef.type;
        role.isDefault = roleDef.isDefault;
        role = await this.roleRepo.save(role);
        this.logger.debug(`创建角色: ${roleDef.code}`);
      }

      // 同步角色权限
      const permissions = await this.permissionRepo.findByCodes(roleDef.permissionCodes);
      role.permissions = permissions;
      await this.roleRepo.save(role);
    }
  }
}
