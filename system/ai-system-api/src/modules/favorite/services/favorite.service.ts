import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { FavoriteRepository } from '../repositories';
import { FavoriteEntity } from '../entities';
import { CreateFavoriteDto, QueryFavoriteDto, OutputFavoriteDto } from '../dto';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import { plainToInstance } from 'class-transformer';
import { OssService } from '@/modules/base/aliyun-oss/oss.service';

/**
 * 收藏服务
 *
 * 提供收藏的业务逻辑
 */
@Injectable()
export class FavoriteService {
  private readonly logger = new Logger(FavoriteService.name);

  constructor(
    private readonly favoriteRepo: FavoriteRepository,
    private readonly dataSource: DataSource,
    private readonly ossService: OssService,
  ) {}

  /**
   * 创建收藏
   */
  async create(userId: string, dto: CreateFavoriteDto) {
    return {} as any;
  }

  /**
   * 取消收藏
   */
  async remove(userId: string, assetId: string): Promise<void> {
    // 检查收藏是否存在
    const favorite = await this.favoriteRepo.findByUserIdAndAssetId(userId, assetId);
    if (!favorite) {
      throw new NotFoundException('收藏不存在');
    }

    // 删除收藏并更新资产收藏数
    await this.dataSource.transaction(async manager => {
      await manager.delete(FavoriteEntity, { userId, assetId });
      // 更新资产的收藏数
      await manager.decrement('asset', { id: assetId }, 'favoriteCount', 1);
    });

    this.logger.log(`用户 ${userId} 取消收藏资产 ${assetId}`);
  }

  /**
   * 获取收藏列表
   */
  async getList(
    userId: string,
    dto: QueryFavoriteDto,
  ): Promise<{ data: OutputFavoriteDto[]; meta: PaginationMetaDto }> {
    const [favorites, total] = await this.favoriteRepo.findUserFavoritesWithPagination({
      userId,
      assetId: dto.assetId,
      keyword: dto.keyword,
      skip: dto.skip,
      take: dto.pageSize,
    });

    // 转换为 DTO
    const listItems = plainToInstance(OutputFavoriteDto, favorites, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });

    const meta = new PaginationMetaDto(dto.page, dto.pageSize);
    meta.total = total;

    return { data: listItems, meta };
  }

  /**
   * 检查是否已收藏
   */
  async isFavorite(userId: string, assetId: string): Promise<boolean> {
    return this.favoriteRepo.isFavorite(userId, assetId);
  }

  /**
   * 获取收藏数量
   */
  async getCount(userId: string): Promise<number> {
    return this.favoriteRepo.countByUserId(userId);
  }

  /**
   * 批量检查收藏状态
   */
  async batchCheckFavorite(userId: string, assetIds: string[]): Promise<Record<string, boolean>> {
    if (assetIds.length === 0) {
      return {};
    }

    const favorites = await this.favoriteRepo.find({
      where: {
        userId,
        assetId: In(assetIds),
      },
    });

    const favoriteMap = new Map<string, boolean>();
    assetIds.forEach(assetId => {
      favoriteMap.set(assetId, false);
    });

    favorites.forEach(favorite => {
      favoriteMap.set(favorite.assetId, true);
    });

    return Object.fromEntries(favoriteMap);
  }
}
