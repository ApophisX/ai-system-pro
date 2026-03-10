import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

/**
 * 更新收藏请求 DTO
 *
 * 目前收藏功能较为简单，暂不需要更新操作
 * 保留此文件以保持 DTO 结构完整性
 */
export class UpdateFavoriteDto {
  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  remark?: string;
}
