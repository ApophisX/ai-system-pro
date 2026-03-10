import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditEventEntity, CreditAccountEntity, CreditScoreHistoryEntity } from './entities';
import { CreditEventRepository, CreditAccountRepository, CreditScoreHistoryRepository } from './repositories';
import { CreditEventService, CreditScoringService, CreditRiskDecisionService, CreditQueryService } from './services';
import { AppCreditController } from './controllers/app-credit.controller';
import { CreditEventSubscriber } from './listeners/credit-event.subscriber';
import { AuthModule } from '../base/auth/auth.module';

/**
 * 信用模块
 *
 * 信用事件引擎、评分引擎、风控决策
 */
@Module({
  imports: [TypeOrmModule.forFeature([CreditEventEntity, CreditAccountEntity, CreditScoreHistoryEntity]), AuthModule],
  controllers: [AppCreditController],
  providers: [
    CreditEventRepository,
    CreditAccountRepository,
    CreditScoreHistoryRepository,
    CreditEventService,
    CreditScoringService,
    CreditRiskDecisionService,
    CreditQueryService,
    CreditEventSubscriber,
  ],
  exports: [TypeOrmModule, CreditEventService, CreditScoringService, CreditRiskDecisionService],
})
export class CreditModule {}
