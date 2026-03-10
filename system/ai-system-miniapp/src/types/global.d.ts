import { AppLocation } from '@/model/location';

// src/global.d.ts
declare global {
  // 如果是字符串类型
  const APP_API_HOST: string;
  const APP_URL: string;
  const ASSET_HOST: string;
  const LOCATION_APIKEY: string;
  type AppGlobalState = {
    requestId: string;
    appVersion: string;
    safeArea: {
      top: number;
      bottom: number;
    };
    currentLocation: AppLocation | null;
    setCurrentLocation: (location: AppLocation) => void;
  };
}

export {}; // 这行很重要，确保文件被视为模块
