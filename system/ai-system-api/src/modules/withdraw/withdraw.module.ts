import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import { MerchantAccountEntity } from './entities/merchant-account.entity';
import { AccountFlowEntity } from './entities/account-flow.entity';
import { WithdrawOrderEntity } from './entities/withdraw-order.entity';

import { MerchantAccountRepository } from './repositories/merchant-account.repository';
import { AccountFlowRepository } from './repositories/account-flow.repository';
import { WithdrawOrderRepository } from './repositories/withdraw-order.repository';

import { MerchantAccountService } from './services/merchant-account.service';
import { WithdrawService } from './services/withdraw.service';
import { WithdrawJobService } from './services/withdraw-job.service';

import { AppWithdrawController } from './controllers/app-withdraw.controller';
import { AdminWithdrawController } from './controllers/admin-withdraw.controller';

import { WithdrawProcessProcessor } from './processors/withdraw-process.processor';
import { WithdrawPaymentMockAdapter } from './adapters/withdraw-payment-mock.adapter';
import { WithdrawTimeoutScheduler } from './schedulers/withdraw-timeout.scheduler';
import { WITHDRAW_QUEUE } from './constants/withdraw-queue.constant';

import { FinanceModule } from '@/modules/finance/finance.module';
import { SequenceNumberModule } from '@/infrastructure/sequence-number/sequence-number.module';
import { RedisModule } from '@/infrastructure/redis/redis.module';
import { UserModule } from '@/modules/base/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MerchantAccountEntity, AccountFlowEntity, WithdrawOrderEntity]),
    ConfigModule,
    BullModule.registerQueue({ name: WITHDRAW_QUEUE }),
    FinanceModule,
    SequenceNumberModule,
    RedisModule,
    UserModule,
  ],
  controllers: [AppWithdrawController, AdminWithdrawController],
  providers: [
    MerchantAccountRepository,
    AccountFlowRepository,
    WithdrawOrderRepository,
    MerchantAccountService,
    WithdrawService,
    WithdrawJobService,
    WithdrawProcessProcessor,
    WithdrawTimeoutScheduler,
    WithdrawPaymentMockAdapter,
  ],
  exports: [WithdrawService, MerchantAccountService],
})
export class WithdrawModule {}
