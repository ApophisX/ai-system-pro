import { applyDecorators } from '@nestjs/common';
import { Column, ColumnOptions } from 'typeorm';
import { ApiProperty, ApiPropertyOptional, ApiPropertyOptions } from '@nestjs/swagger';
import { TransformDateString, TransformDecimalToNumber } from './trasform.decorator';

/**
 * 组合装饰器：同时设置 Column 和 ApiProperty
 *
 * 解决注释写两遍的问题，自动将 description 同时应用到：
 * - @Column 的 comment 属性
 * - @ApiProperty 的 description 属性
 *
 * @example
 * ```typescript
 * // 之前需要写两遍
 * @Column({ type: 'int', comment: '租赁时长' })
 * @ApiProperty({ description: '租赁时长' })
 * duration: number;
 *
 * // 使用装饰器后只需写一遍
 * @ColumnWithApi({ type: 'int', description: '租赁时长' })
 * duration: number;
 * ```
 *
 * @example
 * ```typescript
 * // 支持可选字段
 * @ColumnWithApi({
 *   type: 'varchar',
 *   nullable: true,
 *   description: '联系人电话',
 *   optional: true
 * })
 * contactPhone?: string;
 * ```
 */
export function ColumnWithApi(
  options: ColumnOptions & {
    /**
     * 字段描述（会自动应用到 Column.comment 和 ApiProperty.description）
     */
    description?: string;
    /**
     * 是否使用 ApiPropertyOptional（默认 false，使用 ApiProperty）
     */
    optional?: boolean;
    /**
     * ApiProperty 的额外选项
     */
    apiOptions?: ApiPropertyOptions;
  },
) {
  const { description, optional = false, apiOptions = {}, comment, ...columnOptions } = options;

  // 优先使用 description，如果没有则使用 comment
  const finalDescription = description || comment;

  // 合并 Column 选项，确保 comment 被设置（如果有描述的话）
  const columnOpts: ColumnOptions = {
    ...columnOptions,
    ...(finalDescription && { comment: finalDescription }),
  };

  // 判断是否为时间字段
  const dateTypes = ['date', 'datetime', 'timestamp'];
  const isDateType = typeof columnOptions.type === 'string' && dateTypes.includes(columnOptions.type.toLowerCase());
  const isDecimalType =
    typeof columnOptions.type === 'string' && ['decimal', 'numeric'].includes(columnOptions.type.toLowerCase());

  // 合并 ApiProperty 选项（只有当有描述时才设置）
  const apiOpts: ApiPropertyOptions = {
    ...apiOptions,
    description: apiOptions.description || finalDescription,
    default: columnOptions.default ?? apiOptions.default,
    enum: columnOptions.enum || apiOptions.enum,
    type: isDecimalType ? 'number' : apiOptions.type,
  } as ApiPropertyOptions;

  // 根据 optional 选择使用 ApiProperty 或 ApiPropertyOptional
  const ApiDecorator = optional ? ApiPropertyOptional : ApiProperty;

  // 动态组合装饰器
  const decorators = [Column(columnOpts), ApiDecorator(apiOpts)];
  if (isDateType) {
    decorators.push(TransformDateString());
  } else if (isDecimalType) {
    decorators.push(TransformDecimalToNumber());
  }

  return applyDecorators(...decorators);
}
