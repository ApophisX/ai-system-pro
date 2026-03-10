import wx from 'weixin-js-sdk';
import { useCallback } from 'react';
import { useDialogs } from '@toolpad/core/useDialogs';

import { PlatformDetector } from 'src/utils';
import { DEFAULT_LOCATION } from 'src/constants/global-constant';

import { LocationMapDialog } from 'src/components/custom';

type LocationPyload = {
  latitude?: number;
  longitude?: number;
  name?: string;
  address?: string;
};

export function useMapBridge() {
  const { open: openDialog } = useDialogs();

  const openLocation = useCallback(
    (payload: LocationPyload) => {
      const isWeChatMiniProgram = PlatformDetector.isWeChatMiniProgram();

      if (isWeChatMiniProgram && false) {
        // TODO，需要把高德地图的经纬度转换为微信小程序的经纬度
        wx.openLocation({
          latitude: payload.latitude || DEFAULT_LOCATION.latitude,
          longitude: payload.longitude || DEFAULT_LOCATION.longitude,
          name: payload.name || DEFAULT_LOCATION.city?.label || '',
          address: payload.address || DEFAULT_LOCATION.city?.label || '',
          scale: 1,
          infoUrl: '',
        });
      } else {
        openDialog(LocationMapDialog, payload);
      }
    },
    [openDialog]
  );

  return {
    openLocation,
  };
}
