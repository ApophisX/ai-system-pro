import { Injectable } from '@nestjs/common';
import { CreditAccountRepository } from '../repositories/credit-account.repository';
import { CreditEventRepository } from '../repositories/credit-event.repository';
import { CreditActorRole } from '../enums';
import { OutputCreditAccountDto } from '../dto/output-credit.dto';
import { OutputCreditRecordDto } from '../dto/output-credit-record.dto';
import { QueryCreditRecordDto } from '../dto/query-credit-record.dto';
import { CreditEventTypeLabelMap } from '../enums/credit-event-type.enum';
import { CreditRiskDecisionService } from './credit-risk-decision.service';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CreditQueryService {
  constructor(
    private readonly accountRepo: CreditAccountRepository,
    private readonly eventRepo: CreditEventRepository,
    private readonly riskDecision: CreditRiskDecisionService,
  ) {}

  async getAccount(
    userId: string,
    actorRole: CreditActorRole = CreditActorRole.LESSEE,
  ): Promise<OutputCreditAccountDto> {
    const account = await this.accountRepo.findOrCreateByUserAndRole(userId, actorRole);

    const depositFree = await this.riskDecision.isDepositFree(userId);
    const depositRatio = await this.riskDecision.getDepositRatio(userId);
    const installmentAllowed =
      actorRole === CreditActorRole.LESSEE ? await this.riskDecision.isInstallmentAllowed(userId) : undefined;

    return plainToInstance(
      OutputCreditAccountDto,
      {
        userId: account.userId,
        actorRole: account.actorRole,
        creditScore: account.creditScore,
        behaviorScore: account.behaviorScore,
        riskScore: account.riskScore,
        stabilityScore: account.stabilityScore,
        creditLevel: account.creditLevel,
        creditStatus: account.creditStatus,
        depositFree: actorRole === CreditActorRole.LESSEE ? depositFree : undefined,
        depositRatio: actorRole === CreditActorRole.LESSEE ? depositRatio : undefined,
        installmentAllowed,
      },
      {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      },
    );
  }

  async getRecords(
    userId: string,
    dto: QueryCreditRecordDto,
  ): Promise<{ data: OutputCreditRecordDto[]; meta: PaginationMetaDto }> {
    const pagination = new PaginationMetaDto(dto.page ?? 0, dto.pageSize ?? 20);
    const actorRole = dto.actorRole ?? CreditActorRole.LESSEE;

    const [events, total] = await Promise.all([
      this.eventRepo.findByUserAndRole(userId, actorRole, { skip: pagination.skip, limit: pagination.pageSize }),
      this.eventRepo.countByUserAndRole(userId, actorRole),
    ]);

    const list = events.map(e => ({
      id: e.id,
      eventType: e.eventType,
      eventTypeLabel: CreditEventTypeLabelMap[e.eventType] ?? e.eventType,
      actorRole: e.actorRole,
      impactScore: e.impactScore,
      relatedOrderId: e.relatedOrderId ?? null,
      createdAt: e.createdAt.toISOString(),
    }));
    pagination.total = total;
    return { data: list, meta: pagination };
  }
}
