import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsUUID, MaxLength, Min, Matches, IsObject } from 'class-validator';

/**
 * 创建资产分类请求 DTO
 */
export class CreateAssetCategoryDto {
  @ApiProperty({
    description: '分类代码（唯一标识，只允许大写字母、数字和下划线）',
    example: 'ELECTRONICS',
  })
  @IsString()
  @IsNotEmpty({ message: '分类代码不能为空' })
  @MaxLength(50, { message: '分类代码最长 50 个字符' })
  @Matches(/^[A-Z][A-Z0-9_]*$/, {
    message: '分类代码只能包含大写字母、数字和下划线，且必须以大写字母开头',
  })
  code: string;

  @ApiProperty({
    description: '分类名称',
    example: '电子设备',
  })
  @IsString()
  @IsNotEmpty({ message: '分类名称不能为空' })
  @MaxLength(100, { message: '分类名称最长 100 个字符' })
  name: string;

  @ApiPropertyOptional({
    description: '分类描述',
    example: '包括手机、电脑、平板等电子产品',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: '分类描述最长 500 个字符' })
  description?: string;

  @ApiPropertyOptional({
    description: '分类图标（URL 或图标标识）',
    example: 'https://example.com/icons/electronics.png',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: '图标地址最长 500 个字符' })
  icon?: string;

  @ApiPropertyOptional({
    description: '排序权重（数字越大越靠前）',
    example: 100,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({
    description: '父分类 ID',
    example: 'uuid-of-parent-category',
  })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({
    description: '分类属性（JSON 对象，存储扩展属性）',
    example: { color: '#FF5733', badge: 'hot' },
  })
  @IsObject()
  @IsOptional()
  attributes?: Record<string, unknown>;
}
