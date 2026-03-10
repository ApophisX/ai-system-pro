import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentalReviewEntity } from './entities';
import { RentalReviewRepository } from './repositories';
import {
  RentalReviewCreateService,
  RentalReviewQueryService,
  RentalReviewReplyService,
  RentalReviewAuditService,
} from './services';
import { AppRentalReviewController, AdminRentalReviewController } from './controllers';
import { RentalOrderModule } from '../rental-order/rental-order.module';
import { AssetModule } from '../asset/asset.module';
import { OssModule } from '../base/aliyun-oss/oss.module';

/**
 * 租赁评价模块
 *
 * 提供租赁评价相关功能：
 * - 承租方：提交评价（一单一评，需审核）
 * - 出租方：回复评价
 * - 公开：查询资产评价列表、汇总
 * - 后台：审核通过/拒绝、隐藏
 *
 * @example
 * POST   /app/rental-review              承租方提交评价
 * GET    /app/rental-review               查询资产评价列表（assetId 必填）
 * GET    /app/rental-review/asset/:id/summary  资产评价汇总
 * PUT    /app/rental-review/:id/reply     出租方回复
 * PUT    /admin/rental-review/:id/approve 审核通过
 * PUT    /admin/rental-review/:id/reject  审核拒绝
 * PUT    /admin/rental-review/:id/hide    隐藏评价
 */
@Module({
  imports: [TypeOrmModule.forFeature([RentalReviewEntity]), RentalOrderModule, AssetModule, OssModule],
  controllers: [AppRentalReviewController, AdminRentalReviewController],
  providers: [
    RentalReviewRepository,
    RentalReviewCreateService,
    RentalReviewQueryService,
    RentalReviewReplyService,
    RentalReviewAuditService,
  ],
  exports: [
    RentalReviewRepository,
    RentalReviewCreateService,
    RentalReviewQueryService,
    RentalReviewReplyService,
    RentalReviewAuditService,
  ],
})
export class ReviewsModule {}
