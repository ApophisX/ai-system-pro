import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditScoreHistoryEntity } from '../entities';

@Injectable()
export class CreditScoreHistoryRepository {
  constructor(
    @InjectRepository(CreditScoreHistoryEntity)
    private readonly repo: Repository<CreditScoreHistoryEntity>,
  ) {}

  async save(history: CreditScoreHistoryEntity): Promise<CreditScoreHistoryEntity> {
    return this.repo.save(history);
  }

  async findByUserId(
    userId: string,
    options?: { limit?: number; since?: Date; actorRole?: string },
  ): Promise<CreditScoreHistoryEntity[]> {
    const qb = this.repo
      .createQueryBuilder('h')
      .where('h.userId = :userId', { userId })
      .orderBy('h.calculatedAt', 'DESC');

    if (options?.actorRole) {
      qb.andWhere('h.actorRole = :actorRole', { actorRole: options.actorRole });
    }
    if (options?.since) {
      qb.andWhere('h.calculatedAt >= :since', { since: options.since });
    }
    if (options?.limit) {
      qb.take(options.limit);
    }

    return qb.getMany();
  }
}
