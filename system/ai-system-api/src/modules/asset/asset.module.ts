import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import {
  AssetEntity,
  AssetCategoryEntity,
  AssetInventoryEntity,
  AssetInventoryRentalRecordEntity,
  AssetInventoryRebindRecordEntity,
  AssetTagEntity,
  AssetCommentEntity,
} from './entities';
import { AssetRentalPlanEntity } from './entities/asset-rental-plan.entity';

// Repositories
import {
  AssetCategoryRepository,
  AssetRepository,
  AssetRentalPlanRepository,
  AssetInventoryRepository,
  AssetCommentRepository,
} from './repositories';

// Services
import { AssetCategoryService, AssetService } from './services';
import { AssetCategoryInitService } from './services/asset-category-init.service';
import { AssetCommentService } from './services/asset-comment.service';
import { AssetInventoryService } from './services/asset-inventory.service';

// Controllers
import {
  AppAssetCategoryController,
  AdminAssetCategoryController,
  AdminAssetController,
  AppAssetController,
  AppAssetCommentController,
  AppAssetInventoryController,
} from './controllers';
import { ContactModule } from '../contact/contact.module';
import { UserModule } from '../base/user/user.module';
import { OssModule } from '../base/aliyun-oss/oss.module';
import { MessageModule } from '../base/message/message.module';
import { SequenceNumberModule } from '@/infrastructure/sequence-number';
import { RentalOrderRepository } from '../rental-order/repositories';
import { RentalOrderEntity } from '../rental-order/entities';

/**
 * 资产模块
 *
 * 提供资产相关功能：
 * - 资产分类管理（树形结构）
 * - 资产信息管理
 * - 资产库存管理
 * - 资产标签管理
 * - 租赁方案管理
 * - 资产留言管理（支持回复）
 *
 * @example
 * // App 端资产分类接口
 * GET /app/asset-categories         获取分类列表
 * GET /app/asset-categories/tree    获取分类树
 *
 * // App 端资产接口
 * GET    /app/assets                获取资产列表（公开）
 * GET    /app/assets/:id            获取资产详情（公开）
 * POST   /app/assets                发布资产（需登录）
 * GET    /app/assets/my/list        获取我的资产列表
 * GET    /app/assets/my/:id         获取我的资产详情
 * PUT    /app/assets/my/:id         更新资产
 * DELETE /app/assets/my/:id         删除资产
 * POST   /app/assets/my/:id/publish 上架资产
 * POST   /app/assets/my/:id/offline 下架资产
 *
 * // App 端资产留言接口
 * POST   /app/asset-comment                   创建留言
 * GET    /app/asset-comment                  获取留言列表（公开）
 * GET    /app/asset-comment/:id              获取留言详情（公开）
 * PUT    /app/asset-comment/:id              更新留言
 * DELETE /app/asset-comment/:id              删除留言
 * GET    /app/asset-comment/asset/:assetId/count  获取资产的留言数量（公开）
 *
 * // Admin 端资产分类接口
 * POST   /admin/asset-categories     创建分类
 * GET    /admin/asset-categories     分页查询分类
 * GET    /admin/asset-categories/:id 获取分类详情
 * PUT    /admin/asset-categories/:id 更新分类
 * DELETE /admin/asset-categories/:id 删除分类
 *
 * // Admin 端资产管理接口
 * GET    /admin/assets               分页查询所有商家资产
 * GET    /admin/assets/:id            获取资产详情
 * PUT    /admin/assets/:id/audit       审核资产（通过/拒绝）
 * PUT    /admin/assets/:id/force-offline 强制下架资产
 */
@Module({
  imports: [
    ContactModule,
    OssModule,
    UserModule,
    MessageModule,
    SequenceNumberModule,
    TypeOrmModule.forFeature([
      AssetEntity,
      AssetCategoryEntity,
      AssetInventoryEntity,
      AssetInventoryRentalRecordEntity,
      AssetInventoryRebindRecordEntity,
      AssetTagEntity,
      AssetRentalPlanEntity,
      AssetCommentEntity,
      RentalOrderEntity,
    ]),
  ],
  controllers: [
    // App 端控制器
    AppAssetCategoryController,
    AppAssetController,
    AppAssetCommentController,
    AppAssetInventoryController,
    // Admin 端控制器
    AdminAssetCategoryController,
    AdminAssetController,
  ],
  providers: [
    // Repositories
    RentalOrderRepository,
    AssetCategoryRepository,
    AssetRepository,
    AssetRentalPlanRepository,
    AssetInventoryRepository,
    AssetCommentRepository,
    // Services
    AssetCategoryService,
    AssetService,
    AssetCategoryInitService,
    AssetCommentService,
    AssetInventoryService,
  ],
  exports: [
    // Services（供其他模块调用）
    AssetCategoryService,
    AssetService,
    AssetCategoryInitService,
    AssetCommentService,
    AssetInventoryService,
    // Repositories（供扩展使用）
    AssetCategoryRepository,
    AssetRepository,
    AssetRentalPlanRepository,
    AssetInventoryRepository,
    AssetCommentRepository,
  ],
})
export class AssetModule {}
