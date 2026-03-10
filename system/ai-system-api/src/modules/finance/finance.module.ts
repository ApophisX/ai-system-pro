import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceService } from './services/finance.service';
import { FinanceDepositService } from './services/finance-deposit.service';
import { FinanceRepository } from './repositories/finance.repository';
import { FinanceEventListener } from './listeners/finance-event.listener';
import { AppLessorFinanceController } from './controllers/app-lessor-finance.controller';
import { LessorFinanceEntity } from './entities/lessor-finance.entity';
import { SequenceNumberModule } from '@/infrastructure/sequence-number/sequence-number.module';

@Module({
  imports: [TypeOrmModule.forFeature([LessorFinanceEntity]), SequenceNumberModule],
  controllers: [AppLessorFinanceController],
  providers: [FinanceService, FinanceDepositService, FinanceRepository, FinanceEventListener],
  exports: [TypeOrmModule, FinanceService, FinanceDepositService, FinanceRepository, FinanceEventListener],
})
export class FinanceModule {}
