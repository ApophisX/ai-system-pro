// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 检查当前用户是否拥有指定权限 GET /api/v1/acl/me/check-permission/${param0} */
export async function AclControllerCheckMyPermissionV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AclControllerCheckMyPermissionV1Params,
  options?: { [key: string]: any },
) {
  const { code: param0, ...queryParams } = params;
  return request<any>(`/api/v1/acl/me/check-permission/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取当前用户的权限列表 GET /api/v1/acl/me/permissions */
export async function AclControllerGetMyPermissionsV1(options?: { [key: string]: any }) {
  return request<any>('/api/v1/acl/me/permissions', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取当前用户的角色列表 GET /api/v1/acl/me/roles */
export async function AclControllerGetMyRolesV1(options?: { [key: string]: any }) {
  return request<any>('/api/v1/acl/me/roles', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取所有权限列表 GET /api/v1/acl/permissions */
export async function AclControllerGetPermissionsV1(options?: { [key: string]: any }) {
  return request<MyApi.OutputPermissionDto[]>('/api/v1/acl/permissions', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取所有角色列表 GET /api/v1/acl/roles */
export async function AclControllerGetRolesV1(options?: { [key: string]: any }) {
  return request<MyApi.OutputRoleDto[]>('/api/v1/acl/roles', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 创建角色 POST /api/v1/acl/roles */
export async function AclControllerCreateRoleV1(body: MyApi.CreateRoleDto, options?: { [key: string]: any }) {
  return request<MyApi.OutputRoleDto>('/api/v1/acl/roles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取角色详情 GET /api/v1/acl/roles/${param0} */
export async function AclControllerGetRoleByIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AclControllerGetRoleByIdV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.OutputRoleDto>(`/api/v1/acl/roles/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新角色 PUT /api/v1/acl/roles/${param0} */
export async function AclControllerUpdateRoleV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AclControllerUpdateRoleV1Params,
  body: MyApi.UpdateRoleDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.OutputRoleDto>(`/api/v1/acl/roles/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除角色 DELETE /api/v1/acl/roles/${param0} */
export async function AclControllerDeleteRoleV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AclControllerDeleteRoleV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/v1/acl/roles/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 为用户分配角色 POST /api/v1/acl/users/roles/assign */
export async function AclControllerAssignRoleV1(body: MyApi.AssignRoleDto, options?: { [key: string]: any }) {
  return request<any>('/api/v1/acl/users/roles/assign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 移除用户角色 POST /api/v1/acl/users/roles/remove */
export async function AclControllerRemoveRoleV1(body: MyApi.RemoveRoleDto, options?: { [key: string]: any }) {
  return request<any>('/api/v1/acl/users/roles/remove', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
