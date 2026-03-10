import { PAGE_PARAMS_KEY, SOURCE_PAGE_KEY } from '@/constants/app';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect } from 'react';

export default function ScanQrcode() {
  useEffect(() => {
    Taro.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode'],
      success: result => {
        Taro.setStorageSync(SOURCE_PAGE_KEY, 'scan-qrcode');
        Taro.setStorageSync(PAGE_PARAMS_KEY, result.result);
        Taro.navigateBack();
      },
      fail: () => {
        Taro.navigateBack();
      },
    });
  }, []);

  return <View className="h-screen w-screen bg-black"></View>;
}
