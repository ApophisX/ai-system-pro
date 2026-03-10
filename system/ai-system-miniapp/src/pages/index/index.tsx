import { useState } from 'react';
import { WebView } from '@tarojs/components';
import './index.less';
import Taro, { useDidShow, useShareAppMessage } from '@tarojs/taro';
import {
  ACCESS_TOKEN_STORAGE_KEY,
  PAGE_PARAMS_KEY,
  PAYMENT_RESULT_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  SOURCE_PAGE_KEY,
} from '@/constants/app';
export default function Index() {
  const [url, setUrl] = useState(APP_URL);

  useShareAppMessage(() => {
    return {
      title: '一起来租吧！看看有没有你喜欢的',
      path: '/pages/index/index',
    };
  });

  useDidShow(() => {
    // TODO 后期接入
    // Taro.getLocation({
    //   type: 'wgs84',
    //   success: res => {
    //     console.log(res);
    //   },
    // });

    const sourcePage = Taro.getStorageSync(SOURCE_PAGE_KEY);

    if (sourcePage === 'login') {
      const token = Taro.getStorageSync(ACCESS_TOKEN_STORAGE_KEY);
      const refreshToken = Taro.getStorageSync(REFRESH_TOKEN_STORAGE_KEY);
      if (token) {
        setUrl(`${APP_URL}?access_token=${token}&refresh_token=${refreshToken}`);
      } else {
        // setUrl(`${APP_URL}?timestamp=${Date.now()}`);
      }
    } else if (sourcePage === 'payment') {
      const paymentResult = Taro.getStorageSync(PAYMENT_RESULT_STORAGE_KEY);
      if (paymentResult === 'success') {
        // TODO
        // 通知服务端下发信息刷新webview
      }
    } else if (sourcePage === 'scan-qrcode') {
      const pageParams = Taro.getStorageSync(PAGE_PARAMS_KEY);
      if (pageParams) {
        setUrl(`${APP_URL}?redirect_url=${encodeURIComponent(pageParams)}&timestamp=${Date.now()}`);
      }
    } else {
      // setUrl(`${APP_URL}?timestamp=${Date.now()}`);
    }
    Taro.removeStorageSync(SOURCE_PAGE_KEY);
    Taro.removeStorageSync(PAGE_PARAMS_KEY);
  });

  return <WebView src={`${url}`} />;
}
