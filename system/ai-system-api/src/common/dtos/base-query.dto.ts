import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';
import { TransformFilters } from '../decorators/transform-queryfilters.decorator';
import { Trim } from '../decorators/trim.decorator';

/**
 * 分页元数据类，统一分页参数，包括页码、每页数量、总数等
 */
export class PaginationMetaDto {
  /**
   * 每页条数（默认10）
   */
  @Expose()
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value as string, 10) || 10 : 10))
  @ApiPropertyOptional({
    type: Number,
    description: '页码大小',
    default: 10,
  })
  pageSize: number = 10;

  /**
   * 当前页码（默认0，第一页为0）
   */
  @Expose()
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value as string, 10) || 10 : 0))
  @ApiPropertyOptional({ type: Number, default: 0, description: '当前页码' })
  page: number = 0;

  @ApiProperty({ type: Number, default: 0, description: '总数' })
  total?: number = 0;

  constructor(page: number = 0, pageSize: number = 10) {
    this.page = page;
    this.pageSize = pageSize;
  }

  get skip(): number {
    return this.page * this.pageSize;
  }
}

/**
 * 分页查询 DTO，包含分页和 skip 计算
 */
export class PaginationQueryDto extends OmitType(PaginationMetaDto, ['total']) {}

/**
 * 带日期区间的分页查询 DTO
 */
export class DateRangeQueryDto extends PaginationQueryDto {
  /**
   * 开始日期
   */
  @Expose()
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value as string) : undefined), {
    toClassOnly: true,
  })
  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: '开始日期 (ISO 8601 格式)',
  })
  startDate?: Date;

  /**
   * 结束日期
   */
  @Expose()
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value as string) : undefined), {
    toClassOnly: true,
  })
  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: '结束日期 (ISO 8601 格式)',
  })
  endDate?: Date;
}

/**
 * 搜索/过滤基础查询 DTO
 */
export class BaseQueryDto extends PaginationQueryDto {
  /**
   * 关键字查询，可选
   */
  @Expose()
  @IsOptional()
  @Trim()
  @ApiPropertyOptional({ description: '关键字' })
  keyword?: string;

  /**
   * 过滤器条件数组
   */
  @Expose()
  @IsOptional()
  @TransformFilters()
  filters?: QueryFilterDto[];

  /**
   * AND/OR 逻辑运算符（默认 and），多个查询条件间的关系
   */
  @IsOptional()
  logicOperator?: string = 'and';
}

/**
 * 查询过滤条件 DTO
 */
export class QueryFilterDto {
  /**
   * 字段名
   */
  @IsString()
  field: string;

  /**
   * 操作符，例如 eq/neq/gt/lt/like等
   */
  @IsString()
  operator: string;

  /**
   * 查询的值数组（可多个值）
   */
  @IsArray()
  value: string[] = [];
}
