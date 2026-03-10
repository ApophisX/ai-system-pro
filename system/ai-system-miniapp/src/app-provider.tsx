import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { AppContext } from './app-context';
import Taro from '@tarojs/taro';
import { AppLocation } from './model/location';
import { DEFAULT_LOCATION } from './constants/app';

export function AppProvider(props: PropsWithChildren) {
  const [systemInfo, setSystemInfo] = useState<Partial<Taro.getSystemInfo.Result>>({});
  const [currentLocation, setCurrentLocation] = useState<AppLocation | null>(new AppLocation(DEFAULT_LOCATION));
  const requestId = useRef('');

  useEffect(() => {
    // 获取底部安全距离
    Taro.getSystemInfo({
      success: function (res) {
        setSystemInfo(res);
      },
    });

    const currentLocation = Taro.getStorageSync('currentLocation');
    if (currentLocation) {
      setCurrentLocation(new AppLocation(currentLocation));
    }
  }, []);

  const safeArea = {
    bottom: (systemInfo.screenHeight || 0) - (systemInfo.safeArea?.bottom || 0),
    top: systemInfo.safeArea?.top || 0,
  };

  return (
    <AppContext.Provider
      value={{
        requestId: requestId.current,
        appVersion: '1.0.0',
        currentLocation: currentLocation,
        setCurrentLocation: setCurrentLocation,
        safeArea: safeArea,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}
