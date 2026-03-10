import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditEventEntity } from '../entities';
import { CreditActorRole, CreditEventType } from '../enums';

@Injectable()
export class CreditEventRepository {
  constructor(
    @InjectRepository(CreditEventEntity)
    private readonly repo: Repository<CreditEventEntity>,
  ) {}

  async save(event: CreditEventEntity): Promise<CreditEventEntity> {
    return this.repo.save(event);
  }

  async findByUserAndRole(
    userId: string,
    actorRole: CreditActorRole,
    options?: { limit?: number; skip?: number; since?: Date },
  ): Promise<CreditEventEntity[]> {
    const qb = this.repo
      .createQueryBuilder('e')
      .where('e.userId = :userId', { userId })
      .andWhere('e.actorRole = :actorRole', { actorRole })
      .orderBy('e.createdAt', 'DESC');

    if (options?.since) {
      qb.andWhere('e.createdAt >= :since', { since: options.since });
    }
    if (options?.skip) {
      qb.skip(options.skip);
    }
    if (options?.limit) {
      qb.take(options.limit);
    }

    return qb.getMany();
  }

  async countByUserAndRole(userId: string, actorRole: CreditActorRole, since?: Date): Promise<number> {
    const qb = this.repo
      .createQueryBuilder('e')
      .where('e.userId = :userId', { userId })
      .andWhere('e.actorRole = :actorRole', { actorRole });
    if (since) {
      qb.andWhere('e.createdAt >= :since', { since });
    }
    return qb.getCount();
  }

  /**
   * 按订单去重：同一订单同一事件类型只记录一次（防重复）
   */
  async existsByOrderAndType(
    relatedOrderId: string,
    eventType: CreditEventType,
    userId: string,
    actorRole: CreditActorRole,
  ): Promise<boolean> {
    const count = await this.repo.count({
      where: {
        relatedOrderId,
        eventType,
        userId,
        actorRole,
      },
    });
    return count > 0;
  }

  /**
   * 按扣款 ID 去重：同一 deductionId 只记录一次 DEPOSIT_DEDUCTED
   */
  async existsByDeductionId(deductionId: string, userId: string, actorRole: CreditActorRole): Promise<boolean> {
    const events = await this.repo.find({
      where: {
        eventType: CreditEventType.DEPOSIT_DEDUCTED,
        userId,
        actorRole,
      },
      select: ['id', 'metadata'],
      take: 500,
    });
    return events.some(e => (e.metadata as Record<string, unknown>)?.deductionId === deductionId);
  }

  /**
   * 查询某订单下某用户的逾期事件（用于分期逾期去重）
   */
  async findByOrderAndType(
    orderId: string,
    eventType: CreditEventType,
    userId: string,
    actorRole: CreditActorRole,
  ): Promise<CreditEventEntity[]> {
    return this.repo.find({
      where: { relatedOrderId: orderId, eventType, userId, actorRole },
      select: ['id', 'metadata'],
    });
  }

  async findEventsForScoring(userId: string, actorRole: CreditActorRole, since?: Date): Promise<CreditEventEntity[]> {
    const qb = this.repo
      .createQueryBuilder('e')
      .where('e.userId = :userId', { userId })
      .andWhere('e.actorRole = :actorRole', { actorRole })
      .orderBy('e.createdAt', 'ASC');
    if (since) {
      qb.andWhere('e.createdAt >= :since', { since });
    }
    return qb.getMany();
  }
}
