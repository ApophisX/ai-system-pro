import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { RoleType } from '../enums';

/**
 * 权限输出 DTO
 */
export class OutputPermissionDto {
  @ApiProperty({ description: '权限 ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: '权限代码' })
  @Expose()
  code: string;

  @ApiProperty({ description: '权限名称' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: '权限描述' })
  @Expose()
  description?: string;

  @ApiProperty({ description: '资源类型' })
  @Expose()
  resource: string;

  @ApiProperty({ description: '操作动作' })
  @Expose()
  action: string;

  @ApiPropertyOptional({ description: '权限分组' })
  @Expose()
  group?: string;
}

/**
 * 角色输出 DTO
 */
export class OutputRoleDto {
  @ApiProperty({ description: '角色 ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: '角色代码' })
  @Expose()
  code: string;

  @ApiProperty({ description: '角色名称' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: '角色描述' })
  @Expose()
  description?: string;

  @ApiProperty({ description: '角色类型', enum: RoleType })
  @Expose()
  type: RoleType;

  @ApiProperty({ description: '是否为默认角色' })
  @Expose()
  isDefault: boolean;

  @ApiPropertyOptional({
    description: '关联权限列表',
    type: [OutputPermissionDto],
  })
  @Expose()
  @Type(() => OutputPermissionDto)
  permissions?: OutputPermissionDto[];

  @ApiProperty({ description: '创建时间' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @Expose()
  updatedAt: Date;
}

/**
 * 用户角色输出 DTO
 */
export class OutputUserRoleDto {
  @ApiProperty({ description: '角色代码' })
  @Expose()
  code: string;

  @ApiProperty({ description: '角色名称' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: '生效时间' })
  @Expose()
  effectiveFrom?: Date;

  @ApiPropertyOptional({ description: '失效时间' })
  @Expose()
  effectiveUntil?: Date;

  @ApiPropertyOptional({ description: '分配来源' })
  @Expose()
  source?: string;
}

/**
 * 权限列表输出 DTO（按分组）
 */
export class OutputPermissionGroupDto {
  @ApiProperty({ description: '分组名称' })
  @Expose()
  group: string;

  @ApiProperty({ description: '权限列表', type: [OutputPermissionDto] })
  @Expose()
  @Type(() => OutputPermissionDto)
  permissions: OutputPermissionDto[];
}
