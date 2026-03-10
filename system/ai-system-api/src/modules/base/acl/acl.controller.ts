import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard, PermissionsGuard } from './guards';
import { Roles, Permissions } from './decorators';
import { SystemRoleCode, PermissionResource, PermissionAction } from './enums';
import { generatePermissionCode } from './constants';
import { AclService, RoleService } from './services';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto, RemoveRoleDto, OutputRoleDto, OutputPermissionDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';

/**
 * ACL 权限管理控制器
 */
@ApiTags('Acl')
@ApiBearerAuth()
@Controller('acl')
@UseGuards(JwtAuthGuard)
export class AclController {
  constructor(
    private readonly aclService: AclService,
    private readonly roleService: RoleService,
  ) {}

  // ========== 角色管理 ==========

  @Get('roles')
  @UseGuards(RolesGuard)
  @Roles(SystemRoleCode.SUPER_ADMIN, SystemRoleCode.PLATFORM_ADMIN)
  @ApiOperation({ summary: '获取所有角色列表' })
  @ApiResponse({ status: 200, description: '角色列表', type: [OutputRoleDto] })
  async getRoles(): Promise<OutputRoleDto[]> {
    const roles = await this.roleService.getAll();
    return roles as unknown as OutputRoleDto[];
  }

  @Get('roles/:id')
  @UseGuards(RolesGuard)
  @Roles(SystemRoleCode.SUPER_ADMIN, SystemRoleCode.PLATFORM_ADMIN)
  @ApiOperation({ summary: '获取角色详情' })
  @ApiResponse({ status: 200, description: '角色详情', type: OutputRoleDto })
  async getRoleById(@Param('id') id: string): Promise<OutputRoleDto> {
    const role = await this.roleService.getById(id);
    return role as unknown as OutputRoleDto;
  }

  @Post('roles')
  @UseGuards(PermissionsGuard)
  @Permissions(generatePermissionCode(PermissionResource.ROLE, PermissionAction.MANAGE))
  @ApiOperation({ summary: '创建角色' })
  @ApiResponse({ status: 201, description: '创建成功', type: OutputRoleDto })
  async createRole(@Body() dto: CreateRoleDto): Promise<OutputRoleDto> {
    const role = await this.roleService.create(dto);
    return role as unknown as OutputRoleDto;
  }

  @Put('roles/:id')
  @UseGuards(PermissionsGuard)
  @Permissions(generatePermissionCode(PermissionResource.ROLE, PermissionAction.MANAGE))
  @ApiOperation({ summary: '更新角色' })
  @ApiResponse({ status: 200, description: '更新成功', type: OutputRoleDto })
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto): Promise<OutputRoleDto> {
    const role = await this.roleService.update(id, dto);
    return role as unknown as OutputRoleDto;
  }

  @Delete('roles/:id')
  @UseGuards(PermissionsGuard)
  @Permissions(generatePermissionCode(PermissionResource.ROLE, PermissionAction.MANAGE))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除角色' })
  @ApiResponse({ status: 204, description: '删除成功' })
  async deleteRole(@Param('id') id: string): Promise<void> {
    await this.roleService.delete(id);
  }

  // ========== 权限管理 ==========

  @Get('permissions')
  @UseGuards(RolesGuard)
  @Roles(SystemRoleCode.SUPER_ADMIN, SystemRoleCode.PLATFORM_ADMIN)
  @ApiOperation({ summary: '获取所有权限列表' })
  @ApiResponse({
    status: 200,
    description: '权限列表',
    type: [OutputPermissionDto],
  })
  async getPermissions(): Promise<OutputPermissionDto[]> {
    const permissions = await this.roleService.getAllPermissions();
    return permissions as unknown as OutputPermissionDto[];
  }

  // ========== 用户角色分配 ==========

  @Post('users/roles/assign')
  @UseGuards(PermissionsGuard)
  @Permissions(generatePermissionCode(PermissionResource.ROLE, PermissionAction.MANAGE))
  @ApiOperation({ summary: '为用户分配角色' })
  @ApiResponse({ status: 201, description: '分配成功' })
  async assignRole(@Body() dto: AssignRoleDto): Promise<void> {
    await this.aclService.assignRole(dto.userId, dto.roleCode, {
      effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined,
      effectiveUntil: dto.effectiveUntil ? new Date(dto.effectiveUntil) : undefined,
      source: dto.source || 'admin',
    });
  }

  @Post('users/roles/remove')
  @UseGuards(PermissionsGuard)
  @Permissions(generatePermissionCode(PermissionResource.ROLE, PermissionAction.MANAGE))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '移除用户角色' })
  @ApiResponse({ status: 204, description: '移除成功' })
  async removeRole(@Body() dto: RemoveRoleDto): Promise<void> {
    await this.aclService.removeRole(dto.userId, dto.roleCode);
  }

  // ========== 当前用户权限查询 ==========

  @Get('me/roles')
  @ApiOperation({ summary: '获取当前用户的角色列表' })
  @ApiResponse({ status: 200, description: '用户角色列表' })
  async getMyRoles(@CurrentUser() user: UserEntity) {
    const roles = await this.aclService.getUserRoleEntities(user.id);
    return roles.map(role => ({
      code: role.code,
      name: role.name,
    }));
  }

  @Get('me/permissions')
  @ApiOperation({ summary: '获取当前用户的权限列表' })
  @ApiResponse({ status: 200, description: '用户权限代码列表' })
  async getMyPermissions(@CurrentUser() user: UserEntity) {
    const permissions = await this.aclService.getUserPermissions(user.id);
    return Array.from(permissions);
  }

  @Get('me/check-permission/:code')
  @ApiOperation({ summary: '检查当前用户是否拥有指定权限' })
  @ApiResponse({ status: 200, description: '权限检查结果' })
  async checkMyPermission(@CurrentUser() user: UserEntity, @Param('code') code: string) {
    const hasPermission = await this.aclService.hasPermission(user.id, code);
    return { hasPermission };
  }
}
