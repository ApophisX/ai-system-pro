import { useMemo } from 'react';

import { AssetStatus, AssetAuditStatus } from 'src/constants/assets';

export function useAssetStatus(asset?: MyApi.OutputMyAssetListItemDto) {
  const memoizedValue = useMemo(() => {
    if (!asset) {
      return {
        isOnline: false,
        editable: false,
        isAuditing: false,
        isDraft: false,
        // 是否可以重新发布
        canPublish: false,
      };
    }

    const isApproved = asset.auditStatus === AssetAuditStatus.APPROVED;

    const isOnline = asset.status === AssetStatus.AVAILABLE && isApproved;
    const editable = !isOnline;

    const isDraft = asset.status === AssetStatus.DRAFT;
    const isOffline = asset.status === AssetStatus.OFFLINE;

    const isAuditing =
      asset.auditStatus === AssetAuditStatus.AUDITING ||
      asset.auditStatus === AssetAuditStatus.PENDING;
    return {
      isOnline,
      editable,
      isAuditing,
      isDraft,
      canPublish: (isOffline && isApproved) || (!isOnline && isDraft),
    };
  }, [asset]);
  return memoizedValue;
}
