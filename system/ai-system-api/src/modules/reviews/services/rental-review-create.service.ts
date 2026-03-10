import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RentalReviewRepository } from '../repositories';
import { RentalOrderRepository } from '@/modules/rental-order/repositories';
import { RentalReviewAuditService } from './rental-review-audit.service';
import { CreateRentalReviewDto, OutputRentalReviewDto } from '../dto';
import { plainToInstance } from 'class-transformer';
import { RentalOrderStatus } from '@/modules/rental-order/enums';
import { RentalOrderPayStatus } from '@/modules/rental-order/enums/rental-order-pay-status.enum';
import { RentalReviewStatus } from '../enums';
import { RentalReviewEntity } from '../entities';
import { RENTAL_REVIEW_VALID_DAYS } from '../constants/review.constant';
import { IS_DEV } from '@/common/constants/global';
import dayjs from 'dayjs';

/**
 * 租赁评价创建服务
 *
 * 承租方提交评价，校验订单资格后写入 PENDING 状态
 * 开发环境下创建后自动调用审核通过服务
 */
@Injectable()
export class RentalReviewCreateService {
  private readonly logger = new Logger(RentalReviewCreateService.name);

  constructor(
    private readonly reviewRepo: RentalReviewRepository,
    private readonly orderRepo: RentalOrderRepository,
    private readonly auditService: RentalReviewAuditService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 承租方提交评价
   */
  async create(lesseeId: string, dto: CreateRentalReviewDto): Promise<OutputRentalReviewDto> {
    // 1. 查询订单
    const order = await this.orderRepo.findById(dto.orderId, {
      relations: { lessee: true, lessor: true },
    });

    // 2. 校验：当前用户 = 订单承租方
    if (order.lesseeId !== lesseeId) {
      throw new ForbiddenException('仅承租方可评价该订单');
    }

    // 3. 校验：订单状态 = COMPLETED
    if (order.status !== RentalOrderStatus.COMPLETED) {
      throw new BadRequestException('仅已完成的订单可评价');
    }

    // 4. 校验：订单已支付
    if (order.payStatus !== RentalOrderPayStatus.COMPLETED) {
      throw new BadRequestException('订单支付未完成，无法评价');
    }

    // 5. 校验：是否已评价（orderId 唯一）
    const existing = await this.reviewRepo.findByOrderId(dto.orderId);
    if (existing) {
      throw new BadRequestException('该订单已评价，一单一评');
    }

    // 6. 校验：评价有效期（30 天，从 completedAt 起算）
    const completedAt = order.completedAt;
    if (!completedAt) {
      throw new BadRequestException('订单无完成时间，无法评价');
    }
    const deadline = dayjs(completedAt).add(RENTAL_REVIEW_VALID_DAYS, 'day');
    if (dayjs().isAfter(deadline)) {
      throw new BadRequestException(`评价已过期，请在订单完成后 ${RENTAL_REVIEW_VALID_DAYS} 天内评价`);
    }

    // 7. 事务内写入评价（status = PENDING）
    const review = await this.dataSource.transaction(async manager => {
      const entity = manager.create(RentalReviewEntity, {
        orderId: dto.orderId,
        assetId: order.assetId,
        lesseeId: order.lesseeId,
        lessorId: order.lessorId,
        score: dto.score,
        content: dto.content ?? undefined,
        images: dto.images ?? [],
        status: RentalReviewStatus.PENDING,
      });
      return manager.save(RentalReviewEntity, entity);
    });

    this.logger.log(
      `租赁评价已创建: 订单ID=${dto.orderId}, 评价ID=${review.id}${IS_DEV ? '（开发环境已自动审核通过）' : ''}`,
    );

    return plainToInstance(OutputRentalReviewDto, {
      id: review.id,
      score: review.score,
      content: review.content,
      images: review.images ?? [],
      replyContent: null,
      lesseeNickname: null,
      createdAt: review.createdAt,
      replyAt: null,
    });
  }
}
