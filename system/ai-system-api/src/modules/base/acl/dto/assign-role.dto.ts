import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsUUID } from 'class-validator';

/**
 * 分配角色请求 DTO
 */
export class AssignRoleDto {
  @ApiProperty({
    description: '用户 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: '用户 ID 格式不正确' })
  @IsNotEmpty({ message: '用户 ID 不能为空' })
  userId: string;

  @ApiProperty({
    description: '角色代码',
    example: 'platform_operator',
  })
  @IsString()
  @IsNotEmpty({ message: '角色代码不能为空' })
  roleCode: string;

  @ApiPropertyOptional({
    description: '角色生效时间',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString({}, { message: '生效时间格式不正确' })
  @IsOptional()
  effectiveFrom?: string;

  @ApiPropertyOptional({
    description: '角色失效时间',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDateString({}, { message: '失效时间格式不正确' })
  @IsOptional()
  effectiveUntil?: string;

  @ApiPropertyOptional({
    description: '角色分配来源',
    example: 'admin',
  })
  @IsString()
  @IsOptional()
  source?: string;
}

/**
 * 移除角色请求 DTO
 */
export class RemoveRoleDto {
  @ApiProperty({
    description: '用户 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: '用户 ID 格式不正确' })
  @IsNotEmpty({ message: '用户 ID 不能为空' })
  userId: string;

  @ApiProperty({
    description: '角色代码',
    example: 'platform_operator',
  })
  @IsString()
  @IsNotEmpty({ message: '角色代码不能为空' })
  roleCode: string;
}
