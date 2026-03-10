import {
  AssetStatus,
  AssetAuditStatus,
  AssetStatusLabels,
  AssetAuditStatusLabels,
} from 'src/constants/assets';

export function getAssetStatusColor(asset: MyApi.OutputMyAssetListItemDto) {
  if (asset.auditStatus === AssetAuditStatus.APPROVED) {
    if (asset.status === AssetStatus.AVAILABLE) {
      return 'success.main';
    }
    if (asset.status === AssetStatus.OFFLINE) {
      return 'grey.500';
    }
  }

  // 审核拒绝
  if (asset.auditStatus === AssetAuditStatus.REJECTED) {
    return 'error.main';
  }

  // 审核中、待审核
  if (asset.status === AssetStatus.DRAFT || asset.status === AssetStatus.OFFLINE) {
    return 'grey.500';
  }

  if (
    asset.auditStatus === AssetAuditStatus.PENDING ||
    asset.auditStatus === AssetAuditStatus.AUDITING
  ) {
    return 'warning.main';
  }
  return undefined;
}

export function getAssetStatusText(asset: MyApi.OutputMyAssetListItemDto) {
  if (asset.auditStatus === AssetAuditStatus.REJECTED) {
    return AssetAuditStatusLabels[asset.auditStatus];
  }

  if (asset.auditStatus === AssetAuditStatus.APPROVED) {
    return AssetStatusLabels[asset.status];
  }
  if (asset.status === AssetStatus.DRAFT || asset.status === AssetStatus.OFFLINE) {
    return AssetStatusLabels[asset.status];
  }
  return AssetAuditStatusLabels[asset.auditStatus];
}
