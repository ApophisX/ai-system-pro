import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantInviteCodeEntity, MerchantInviteRelationEntity } from './entities';
import { MerchantInviteCodeRepository, MerchantInviteRelationRepository } from './repositories';
import { MerchantInviteRegisterService } from './services/merchant-invite-register.service';

/**
 * 商户邀请核心模块（无外部业务依赖）
 *
 * 仅包含：邀请码、邀请关系、注册绑定逻辑
 * 被 AuthModule 依赖，用于注册时校验邀请码
 * 不依赖 RentalOrder、Credit 等，避免循环依赖
 */
@Module({
  imports: [TypeOrmModule.forFeature([MerchantInviteCodeEntity, MerchantInviteRelationEntity])],
  providers: [MerchantInviteCodeRepository, MerchantInviteRelationRepository, MerchantInviteRegisterService],
  exports: [MerchantInviteRegisterService, MerchantInviteCodeRepository, MerchantInviteRelationRepository],
})
export class MerchantInviteCoreModule {}
