import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditAccountEntity } from '../entities';
import { CreditActorRole, CreditLevel } from '../enums';

@Injectable()
export class CreditAccountRepository {
  constructor(
    @InjectRepository(CreditAccountEntity)
    private readonly repo: Repository<CreditAccountEntity>,
  ) {}

  async save(account: CreditAccountEntity): Promise<CreditAccountEntity> {
    return this.repo.save(account);
  }

  async findByUserAndRole(
    userId: string,
    actorRole: CreditActorRole = CreditActorRole.LESSEE,
  ): Promise<CreditAccountEntity | null> {
    return this.repo.findOne({
      where: { userId, actorRole },
    });
  }

  async findOrCreateByUserAndRole(
    userId: string,
    actorRole: CreditActorRole = CreditActorRole.LESSEE,
  ): Promise<CreditAccountEntity> {
    let account = await this.findByUserAndRole(userId, actorRole);
    if (!account) {
      account = this.repo.create({
        userId,
        actorRole,
        creditScore: 600,
        behaviorScore: 600,
        riskScore: 600,
        stabilityScore: 600,
        creditLevel: CreditLevel.C,
      });
      account = await this.repo.save(account);
    }
    return account;
  }
}
