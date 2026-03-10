import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityEntity, CommunityMemberEntity, AssetCommunityEntity } from './entities';
import { CommunityRepository, CommunityMemberRepository, AssetCommunityRepository } from './repositories';
import {
  CommunityCreateService,
  CommunityQueryService,
  CommunityJoinService,
  CommunityAssetService,
  CommunityAuditService,
  CommunityDeleteService,
  CommunityUpdateService,
} from './services';
import { AppCommunityController, AppCommunityAssetController, AdminCommunityController } from './controllers';
import { AssetCreatedListener } from './listeners/asset-created.listener';
import { AssetModule } from '../asset/asset.module';
import { OssModule } from '../base/aliyun-oss/oss.module';

/**
 * 社区模块
 *
 * 提供社区创建、审核、加入/退出、资产绑定等功能
 */
@Module({
  imports: [
    AssetModule,
    OssModule,
    TypeOrmModule.forFeature([CommunityEntity, CommunityMemberEntity, AssetCommunityEntity]),
  ],
  controllers: [AppCommunityController, AppCommunityAssetController, AdminCommunityController],
  providers: [
    CommunityRepository,
    CommunityMemberRepository,
    AssetCommunityRepository,
    CommunityCreateService,
    CommunityQueryService,
    CommunityJoinService,
    CommunityAssetService,
    CommunityAuditService,
    CommunityDeleteService,
    CommunityUpdateService,
    AssetCreatedListener,
  ],
  exports: [CommunityAssetService, CommunityQueryService],
})
export class CommunityModule {}
