import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '@/common/dtos/base-query.dto';

/**
 * 地址列表查询 DTO
 */
export class QueryContactDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: '是否只查询默认地址',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  isDefault?: boolean;
}
