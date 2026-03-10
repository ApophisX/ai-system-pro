/**
 * 资产领域事件
 *
 * 供其他模块订阅，Asset 模块发射
 */
export const AssetEvents = {
  /** 资产创建完成（含 communityId 时需绑定社区） */
  ASSET_CREATED: 'asset.created',
} as const;

export interface AssetCreatedEventPayload {
  assetId: string;
  communityId: string;
  userId: string;
  /** 绑定结果（Community 监听器写入） */
  bindResult?: { status: 'bound' | 'failed'; message?: string };
}
