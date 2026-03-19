import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { FavoriteEntity } from './entities';

// Repositories
import { FavoriteRepository } from './repositories';

// Services
import { FavoriteService } from './services';

// Controllers
import { AppFavoriteController } from './controllers';

// 依赖模块
import { OssModule } from '../base/aliyun-oss/oss.module';

/**
 * 收藏模块
 *
 * 提供收藏相关功能：
 * - 收藏资产
 * - 取消收藏
 * - 查询收藏列表
 * - 检查收藏状态
 *
 * @example
 * // App 端收藏接口
 * POST   /app/favorite             创建收藏
 * GET    /app/favorite              获取收藏列表
 * DELETE /app/favorite/:assetId     取消收藏
 * GET    /app/favorite/check/:assetId 检查是否已收藏
 * GET    /app/favorite/count        获取收藏数量
 */
@Module({
  imports: [OssModule, TypeOrmModule.forFeature([FavoriteEntity])],
  controllers: [AppFavoriteController],
  providers: [FavoriteRepository, FavoriteService],
  exports: [FavoriteService, FavoriteRepository],
})
export class FavoriteModule {}
