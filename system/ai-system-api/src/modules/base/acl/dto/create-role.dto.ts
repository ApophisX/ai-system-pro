import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, MaxLength, Matches } from 'class-validator';

/**
 * 创建角色请求 DTO
 */
export class CreateRoleDto {
  @ApiProperty({
    description: '角色代码（唯一标识，只允许字母、数字和下划线）',
    example: 'content_manager',
  })
  @IsString()
  @IsNotEmpty({ message: '角色代码不能为空' })
  @MaxLength(50, { message: '角色代码最长 50 个字符' })
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: '角色代码只能包含小写字母、数字和下划线，且必须以字母开头',
  })
  code: string;

  @ApiProperty({
    description: '角色名称',
    example: '内容管理员',
  })
  @IsString()
  @IsNotEmpty({ message: '角色名称不能为空' })
  @MaxLength(100, { message: '角色名称最长 100 个字符' })
  name: string;

  @ApiPropertyOptional({
    description: '角色描述',
    example: '负责平台内容审核和管理',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: '角色描述最长 500 个字符' })
  description?: string;

  @ApiPropertyOptional({
    description: '是否为默认角色（新用户自动分配）',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: '权限代码列表',
    example: ['asset:list', 'asset:read', 'asset:audit'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissionCodes?: string[];
}
