import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantInviteRewardEntity } from './entities';
import { MerchantInviteRewardRepository } from './repositories';
import { MerchantInviteRewardService, MerchantInviteStatService } from './services';
import { AppMerchantInviteController, AdminMerchantInviteController } from './controllers';
import { MerchantInviteEventListener } from './listeners/merchant-invite-event.listener';
import { MerchantInviteScheduler } from './schedulers/merchant-invite.scheduler';
import { MerchantInviteCoreModule } from './merchant-invite-core.module';
import { RentalOrderModule } from '../rental-order/rental-order.module';
import { UserModule } from '../base/user/user.module';

/**
 * 商户邀请入驻裂变模块
 *
 * 四级漏斗：注册 → 认证 → 上架(≥3资产) → 首单
 * 当前阶段：仅真实交易分润，不发放注册/认证/上架/首单现金奖励
 *
 * 依赖 MerchantInviteCoreModule（邀请码、关系、注册绑定），避免循环依赖
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([MerchantInviteRewardEntity]),
    MerchantInviteCoreModule,
    RentalOrderModule,
    UserModule,
  ],
  controllers: [AppMerchantInviteController, AdminMerchantInviteController],
  providers: [
    MerchantInviteRewardRepository,
    MerchantInviteRewardService,
    MerchantInviteStatService,
    MerchantInviteEventListener,
    MerchantInviteScheduler,
  ],
})
export class MerchantInviteModule {}
