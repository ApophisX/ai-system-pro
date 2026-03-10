/**
 * WebView 页面 - 接收其他页面传入的 url 和 title 参数，打开网页
 * 使用方式：Taro.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent('https://xxx.com')}&title=页面标题` })
 */

import { ACCESS_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from '@/constants/app';
import { paths, webPaths } from '@/route/paths';
import { WebView } from '@tarojs/components';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState } from 'react';

interface WebViewParams {
  status: string;
}

export default function OrderListPage() {
  const router = useRouter<Partial<WebViewParams>>();
  const { status } = router.params;
  const [url, setUrl] = useState('');

  const isFirst = useRef(true);

  const refreshUrl = useCallback(() => {
    const accessToken = Taro.getStorageSync(ACCESS_TOKEN_STORAGE_KEY);
    const refreshToken = Taro.getStorageSync(REFRESH_TOKEN_STORAGE_KEY);

    const tokenParams = new URLSearchParams();
    tokenParams.set('access_token', accessToken);
    tokenParams.set('refresh_token', refreshToken);
    tokenParams.set('timestamp', Date.now().toString());
    if (status) {
      tokenParams.set('status', status);
    }
    const webviewUrl = `${webPaths.myOrders}?${tokenParams.toString()}`;
    setUrl(webviewUrl);
  }, [status]);

  useEffect(() => {
    refreshUrl();
    setTimeout(() => {
      isFirst.current = false;
    }, 500);
  }, [refreshUrl]);

  useDidShow(() => {
    if (isFirst.current) {
      return;
    }
    const refresh = Taro.getStorageSync('login_success_refresh');
    if (refresh) {
      refreshUrl();
      Taro.removeStorageSync('login_success_refresh');
    }
  });

  if (!url) {
    return null;
  }

  return <WebView src={url} />;
}
