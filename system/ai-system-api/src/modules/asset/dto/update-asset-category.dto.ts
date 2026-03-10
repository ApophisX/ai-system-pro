import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateAssetCategoryDto } from '.';

/**
 * 更新资产分类请求 DTO
 */
export class UpdateAssetCategoryDto extends PartialType(CreateAssetCategoryDto) {
  @ApiPropertyOptional({
    description: '是否有效',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
