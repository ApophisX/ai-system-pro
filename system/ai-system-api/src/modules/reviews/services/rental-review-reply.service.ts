import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { RentalReviewRepository } from '../repositories';
import { ReplyRentalReviewDto } from '../dto';
import { RentalReviewStatus } from '../enums';

/**
 * 租赁评价回复服务
 *
 * 出租方对评价进行回复，仅允许回复一次
 */
@Injectable()
export class RentalReviewReplyService {
  constructor(private readonly reviewRepo: RentalReviewRepository) {}

  /**
   * 出租方回复评价
   */
  async reply(lessorId: string, reviewId: string, dto: ReplyRentalReviewDto): Promise<void> {
    const review = await this.reviewRepo.findById(reviewId);

    // 1. 校验：当前用户 = 该评价的 lessorId（出租方/资产 owner）
    if (review.lessorId !== lessorId) {
      throw new ForbiddenException('仅该资产的出租方可回复');
    }

    // 2. 校验：评价必须为 APPROVED 状态才能回复
    if (review.status !== RentalReviewStatus.APPROVED) {
      throw new BadRequestException('仅已通过审核的评价可回复');
    }

    // 3. 校验：仅允许回复一次
    if (review.replyContent) {
      throw new BadRequestException('该评价已回复，不可重复回复');
    }

    // 4. 更新回复
    await this.reviewRepo.update(reviewId, {
      replyContent: dto.replyContent,
      replyAt: new Date(),
    });
  }
}
