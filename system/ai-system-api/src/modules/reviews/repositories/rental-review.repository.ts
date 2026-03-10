import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository, In } from 'typeorm';
import { RentalReviewEntity } from '../entities';
import { RentalReviewStatus } from '../enums';

export interface RentalReviewQueryOptions {
  assetId: string;
  status?: RentalReviewStatus;
  scoreRange?: string;
  skip: number;
  take: number;
}

export interface RentalReviewAdminQueryOptions {
  status?: RentalReviewStatus;
  assetId?: string;
  lessorId?: string;
  scoreRange?: string;
  keyword?: string;
  skip: number;
  take: number;
}

@Injectable()
export class RentalReviewRepository extends Repository<RentalReviewEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(RentalReviewEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找评价
   */
  async findById(id: string): Promise<RentalReviewEntity> {
    const review = await this.findOne({
      where: { id },
      relations: { lessee: { profile: true }, lessor: true },
    });
    if (!review) {
      throw new NotFoundException('评价不存在');
    }
    return review;
  }

  /**
   * 根据订单 ID 查找评价（检查是否已评价）
   */
  async findByOrderId(orderId: string): Promise<RentalReviewEntity | null> {
    return this.findOne({
      where: { orderId },
    });
  }

  /**
   * 批量查询订单的评价（用于订单列表展示「是否可评论」）
   */
  async findByOrderIds(orderIds: string[]): Promise<RentalReviewEntity[]> {
    if (orderIds.length === 0) return [];
    return this.find({
      where: { orderId: In(orderIds) },
      select: ['id', 'orderId', 'status', 'replyContent'],
    });
  }

  /**
   * 后台分页查询评价列表（支持全状态、多条件筛选）
   */
  async findAdminList(options: RentalReviewAdminQueryOptions): Promise<[RentalReviewEntity[], number]> {
    const qb = this.createQueryBuilder('review')
      .leftJoinAndSelect('review.lessee', 'lessee')
      .leftJoinAndSelect('lessee.profile', 'profile')
      .leftJoinAndSelect('review.lessor', 'lessor')
      .leftJoinAndSelect('lessor.profile', 'lessorProfile')
      .orderBy('review.createdAt', 'DESC');

    if (options.status) {
      qb.andWhere('review.status = :status', { status: options.status });
    }
    if (options.assetId) {
      qb.andWhere('review.assetId = :assetId', { assetId: options.assetId });
    }
    if (options.lessorId) {
      qb.andWhere('review.lessorId = :lessorId', { lessorId: options.lessorId });
    }
    if (options.keyword?.trim()) {
      qb.andWhere('review.content LIKE :keyword', { keyword: `%${options.keyword.trim()}%` });
    }

    // 评分筛选
    if (options.scoreRange && options.scoreRange !== 'all') {
      switch (options.scoreRange) {
        case 'good':
          qb.andWhere('review.score IN (:...scores)', { scores: [4, 5] });
          break;
        case 'medium':
          qb.andWhere('review.score = :score', { score: 3 });
          break;
        case 'bad':
          qb.andWhere('review.score IN (:...scores)', { scores: [1, 2] });
          break;
        case 'withImage':
          qb.andWhere('review.images IS NOT NULL AND LENGTH(CAST(review.images AS CHAR)) > 2');
          break;
      }
    }

    return qb.skip(options.skip).take(options.take).getManyAndCount();
  }

  /**
   * 分页查询资产评价列表（公开，仅 APPROVED）
   */
  async findApprovedByAssetId(options: RentalReviewQueryOptions): Promise<[RentalReviewEntity[], number]> {
    const qb = this.createQueryBuilder('review')
      .leftJoinAndSelect('review.lessee', 'lessee')
      .leftJoinAndSelect('lessee.profile', 'profile')
      .where('review.assetId = :assetId', { assetId: options.assetId })
      .andWhere('review.status = :status', { status: RentalReviewStatus.APPROVED })
      .orderBy('review.createdAt', 'DESC');

    // 评分筛选
    if (options.scoreRange) {
      switch (options.scoreRange) {
        case 'good':
          qb.andWhere('review.score IN (:...scores)', { scores: [4, 5] });
          break;
        case 'medium':
          qb.andWhere('review.score = :score', { score: 3 });
          break;
        case 'bad':
          qb.andWhere('review.score IN (:...scores)', { scores: [1, 2] });
          break;
        case 'withImage':
          qb.andWhere('review.images IS NOT NULL AND LENGTH(CAST(review.images AS CHAR)) > 2');
          break;
      }
    }

    return qb.skip(options.skip).take(options.take).getManyAndCount();
  }

  /**
   * 获取资产评价统计（已通过审核）
   */
  async getAssetReviewStats(assetId: string): Promise<{
    reviewCount: number;
    score1Count: number;
    score2Count: number;
    score3Count: number;
    score4Count: number;
    score5Count: number;
    avgScore: number;
  }> {
    const result = await this.createQueryBuilder('review')
      .select('COUNT(review.id)', 'reviewCount')
      .addSelect('SUM(CASE WHEN review.score = 1 THEN 1 ELSE 0 END)', 'score1Count')
      .addSelect('SUM(CASE WHEN review.score = 2 THEN 1 ELSE 0 END)', 'score2Count')
      .addSelect('SUM(CASE WHEN review.score = 3 THEN 1 ELSE 0 END)', 'score3Count')
      .addSelect('SUM(CASE WHEN review.score = 4 THEN 1 ELSE 0 END)', 'score4Count')
      .addSelect('SUM(CASE WHEN review.score = 5 THEN 1 ELSE 0 END)', 'score5Count')
      .addSelect('AVG(review.score)', 'avgScore')
      .where('review.assetId = :assetId', { assetId })
      .andWhere('review.status = :status', { status: RentalReviewStatus.APPROVED })
      .getRawOne();

    const reviewCount = Number(result?.reviewCount ?? 0);
    const avgScore = reviewCount > 0 ? Number(result?.avgScore ?? 0) : 0;

    return {
      reviewCount,
      score1Count: Number(result?.score1Count ?? 0),
      score2Count: Number(result?.score2Count ?? 0),
      score3Count: Number(result?.score3Count ?? 0),
      score4Count: Number(result?.score4Count ?? 0),
      score5Count: Number(result?.score5Count ?? 0),
      avgScore: Math.round(avgScore * 100) / 100,
    };
  }
}
