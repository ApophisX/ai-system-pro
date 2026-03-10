import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RentalReviewRepository } from '../repositories';
import { AssetRepository } from '@/modules/asset/repositories';
import { AssetEntity } from '@/modules/asset/entities';
import { RejectRentalReviewDto } from '../dto';
import { RentalReviewStatus } from '../enums';
import { RentalReviewEntity } from '../entities';

/**
 * 租赁评价审核服务
 *
 * 后台审核：通过时更新 asset 统计；拒绝时仅更新状态
 */
@Injectable()
export class RentalReviewAuditService {
  private readonly logger = new Logger(RentalReviewAuditService.name);

  constructor(
    private readonly reviewRepo: RentalReviewRepository,
    private readonly assetRepo: AssetRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 审核通过
   */
  async approve(reviewId: string, approvedById: string): Promise<void> {
    const review = await this.reviewRepo.findById(reviewId);

    if (review.status !== RentalReviewStatus.PENDING) {
      throw new BadRequestException('仅待审核的评价可审核通过');
    }

    await this.dataSource.transaction(async manager => {
      // 1. 更新评价状态
      await manager.update(RentalReviewEntity, reviewId, {
        status: RentalReviewStatus.APPROVED,
        approvedAt: new Date(),
        approvedById,
      });

      // 2. 更新 asset 统计
      const asset = await manager.findOne(AssetEntity, { where: { id: review.assetId } });
      if (asset) {
        const s1 = (asset.score1Count ?? 0) + (review.score === 1 ? 1 : 0);
        const s2 = (asset.score2Count ?? 0) + (review.score === 2 ? 1 : 0);
        const s3 = (asset.score3Count ?? 0) + (review.score === 3 ? 1 : 0);
        const s4 = (asset.score4Count ?? 0) + (review.score === 4 ? 1 : 0);
        const s5 = (asset.score5Count ?? 0) + (review.score === 5 ? 1 : 0);
        const reviewCount = s1 + s2 + s3 + s4 + s5;
        const totalScore = s1 * 1 + s2 * 2 + s3 * 3 + s4 * 4 + s5 * 5;
        const avgRating = reviewCount > 0 ? totalScore / reviewCount : 0;
        const rating = Math.round(avgRating * 100) / 100;

        await manager.update(AssetEntity, review.assetId, {
          reviewCount,
          score1Count: s1,
          score2Count: s2,
          score3Count: s3,
          score4Count: s4,
          score5Count: s5,
          rating: String(rating),
        });
      }
    });

    this.logger.log(`Rental review approved: reviewId=${reviewId}`);
  }

  /**
   * 审核拒绝
   */
  async reject(reviewId: string, dto: RejectRentalReviewDto): Promise<void> {
    const review = await this.reviewRepo.findById(reviewId);

    if (review.status !== RentalReviewStatus.PENDING) {
      throw new BadRequestException('仅待审核的评价可审核拒绝');
    }

    await this.reviewRepo.update(reviewId, {
      status: RentalReviewStatus.REJECTED,
      rejectReason: dto.rejectReason ?? undefined,
    });

    this.logger.log(`Rental review rejected: reviewId=${reviewId}`);
  }

  /**
   * 隐藏评价（举报/违规后）
   */
  async hide(reviewId: string): Promise<void> {
    const review = await this.reviewRepo.findById(reviewId);

    if (review.status !== RentalReviewStatus.APPROVED) {
      throw new BadRequestException('仅已通过的评价可隐藏');
    }

    await this.dataSource.transaction(async manager => {
      await manager.update(RentalReviewEntity, reviewId, {
        status: RentalReviewStatus.HIDDEN,
      });

      const asset = await manager.findOne(AssetEntity, { where: { id: review.assetId } });
      if (asset) {
        const s1 = Math.max(0, (asset.score1Count ?? 0) - (review.score === 1 ? 1 : 0));
        const s2 = Math.max(0, (asset.score2Count ?? 0) - (review.score === 2 ? 1 : 0));
        const s3 = Math.max(0, (asset.score3Count ?? 0) - (review.score === 3 ? 1 : 0));
        const s4 = Math.max(0, (asset.score4Count ?? 0) - (review.score === 4 ? 1 : 0));
        const s5 = Math.max(0, (asset.score5Count ?? 0) - (review.score === 5 ? 1 : 0));
        const reviewCount = s1 + s2 + s3 + s4 + s5;
        const totalScore = s1 * 1 + s2 * 2 + s3 * 3 + s4 * 4 + s5 * 5;
        const avgRating = reviewCount > 0 ? totalScore / reviewCount : 0;

        await manager.update(AssetEntity, review.assetId, {
          reviewCount,
          score1Count: s1,
          score2Count: s2,
          score3Count: s3,
          score4Count: s4,
          score5Count: s5,
          rating: String(Math.round(avgRating * 100) / 100),
        });
      }
    });

    this.logger.log(`Rental review hidden: reviewId=${reviewId}`);
  }
}
