import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { FavoriteEntity } from '../entities/favorite.entity';
import { OutputAssetListItemDto } from '@/modules/asset/dto/output-asset.dto';

/**
 * 收藏项输出 DTO
 */
export class OutputFavoriteDto extends OmitType(FavoriteEntity, ['user', 'asset']) {
  // ========== 关联信息 ==========

  @ApiProperty({
    description: '资产信息',
    type: OutputAssetListItemDto,
  })
  @Expose()
  @Type(() => OutputAssetListItemDto)
  asset?: OutputAssetListItemDto;
}
