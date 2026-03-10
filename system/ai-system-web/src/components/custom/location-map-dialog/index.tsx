import type { DialogProps } from '@toolpad/core/useDialogs';

import { useCallback, useRef } from 'react';

import { Box, DialogContent } from '@mui/material';

import { DEFAULT_LOCATION } from 'src/constants/global-constant';

import { useSettingsContext } from 'src/components/settings';

import { MyDialog } from '../my-dialog';
import { useAmap } from '../amap/use-amap';

type MapLocationPayload = {
  latitude?: number;
  longitude?: number;
  name?: string;
  address?: string;
};

export function LocationMapDialog(props: DialogProps<MapLocationPayload>) {
  const { open, onClose, payload } = props;

  const { longitude = DEFAULT_LOCATION.latitude, latitude = DEFAULT_LOCATION.longitude } =
    payload || {};
  const { name, address } = payload || {};

  const settings = useSettingsContext();
  const isDarkMode = settings.state.mode === 'dark';
  const infoWindowRef = useRef<AMap.InfoWindow | null>(null);

  const handleClose = useCallback(() => {
    // 关闭时清除 InfoWindow
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }
    onClose();
  }, [onClose]);

  const { mapRef } = useAmap({
    center: [latitude, longitude],
    containerId: 'locationMap',
    onLoaded: () => {
      if (mapRef.current) {
        mapRef.current.setZoomAndCenter(14, new AMap.LngLat(longitude, latitude));
        addMarker(longitude, latitude, name, address).setMap(mapRef.current);
      }
    },
  });

  // 添加地图标记
  const addMarker = useCallback(
    (lng: number, lat: number, markerName?: string, markerAddress?: string) => {
      const icon = new AMap.Icon({
        size: new AMap.Size(32, 32),
        image: '/assets/icons/global/icon-location.png',
        imageSize: new AMap.Size(32, 32),
      });
      const marker = new AMap.Marker({
        icon,
        position: [lng, lat],
        anchor: 'bottom-center',
      });

      // 创建自定义 InfoWindow 内容
      const infoContent = document.createElement('div');
      infoContent.style.padding = '0';
      infoContent.style.width = '100%';

      // 创建内容结构
      const nameElement = document.createElement('div');
      nameElement.style.fontSize = '16px';
      nameElement.style.fontWeight = '600';
      nameElement.style.marginBottom = '8px';
      nameElement.style.color = isDarkMode ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)';
      nameElement.textContent = markerName || '位置信息';

      const addressElement = document.createElement('div');
      addressElement.style.fontSize = '14px';
      addressElement.style.color = isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
      addressElement.style.lineHeight = '1.5';
      addressElement.textContent = markerAddress || '暂无地址信息';

      infoContent.appendChild(nameElement);
      infoContent.appendChild(addressElement);

      // 创建 InfoWindow
      const infoWindow = new AMap.InfoWindow({
        content: infoContent,
        offset: new AMap.Pixel(0, -40),
        closeWhenClickMap: true,
      });

      // 监听 marker 点击事件
      marker.on('click', () => {
        // 关闭之前打开的 InfoWindow
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        // 打开新的 InfoWindow
        if (mapRef.current) {
          infoWindow.open(mapRef.current, marker.getPosition());
          infoWindowRef.current = infoWindow;
        }
      });

      return marker;
    },
    [mapRef, isDarkMode]
  );

  return (
    <MyDialog dialogTitle="地图" open={open} onClose={handleClose} showActionButtons={false}>
      <DialogContent
        sx={{
          p: 0,
          height: '80vh',
          '& .amap-info-content': {
            padding: 2,
            width: 300,
            backgroundColor: isDarkMode ? '#1C252E' : '#FFFFFF',
            borderRadius: 2,
            boxShadow: isDarkMode
              ? '0 4px 12px rgba(0, 0, 0, 0.3)'
              : '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          '& .amap-info-sharp': {
            borderTopColor: isDarkMode ? '#1C252E' : '#FFFFFF',
          },
          '& .amap-info-close': {
            right: 8,
            top: 8,
          },
        }}
      >
        <Box id="locationMap" sx={{ height: '100%', width: '100%' }} />
      </DialogContent>
    </MyDialog>
  );
}
