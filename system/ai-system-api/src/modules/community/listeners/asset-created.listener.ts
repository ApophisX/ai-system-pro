import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AssetEvents } from '../events/asset.events';
import type { AssetCreatedEventPayload } from '@/modules/asset/events/asset.events';
import { CommunityAssetService } from '../services/community-asset.service';

/**
 * 资产创建事件监听器
 *
 * 当 Asset 创建时传入 communityId，本监听器完成绑定
 * 通过 emitAsync 同步等待，Asset 接口可返回 communityBindStatus
 */
@Injectable()
export class AssetCreatedListener {
  constructor(private readonly communityAssetService: CommunityAssetService) {}

  @OnEvent(AssetEvents.ASSET_CREATED)
  async handleAssetCreated(payload: AssetCreatedEventPayload): Promise<void> {
    const result = await this.communityAssetService.handleAssetCreated(payload);
    payload.bindResult = result;
  }
}
