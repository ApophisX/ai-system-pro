import { PermissionAction, PermissionResource } from '../enums';

/**
 * 权限检查上下文
 */
export interface PermissionContext {
  /** 用户 ID */
  userId: string;
  /** 资源类型 */
  resource: PermissionResource;
  /** 操作动作 */
  action: PermissionAction;
  /** 资源 ID（可选，用于资源级权限检查） */
  resourceId?: string;
}

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  /** 是否有权限 */
  allowed: boolean;
  /** 拒绝原因（如果没有权限） */
  reason?: string;
  /** 匹配的权限代码（如果有权限） */
  matchedPermission?: string;
}

/**
 * 用户权限信息
 */
export interface UserPermissionInfo {
  /** 用户 ID */
  userId: string;
  /** 角色代码列表 */
  roles: string[];
  /** 权限代码列表 */
  permissions: string[];
  /** 是否为超级管理员 */
  isSuperAdmin: boolean;
}

/**
 * 权限变更事件
 */
export interface PermissionChangeEvent {
  /** 事件类型 */
  type: 'role_assigned' | 'role_removed' | 'role_updated' | 'permission_updated';
  /** 用户 ID（如果是用户级别变更） */
  userId?: string;
  /** 角色代码（如果是角色级别变更） */
  roleCode?: string;
  /** 变更时间 */
  timestamp: Date;
}
