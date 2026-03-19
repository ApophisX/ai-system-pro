import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { FavoriteEntity } from '../entities/favorite.entity';

/**
 * 收藏项输出 DTO
 */
export class OutputFavoriteDto extends OmitType(FavoriteEntity, ['user']) {
  // ========== 关联信息 ==========
}
