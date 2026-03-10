/**
 * WebView 页面 - 接收其他页面传入的 url 和 title 参数，打开网页
 * 使用方式：Taro.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent('https://xxx.com')}&title=页面标题` })
 */

import { ACCESS_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from '@/constants/app';
import { paths } from '@/route/paths';
import { WebView } from '@tarojs/components';
import Taro, { useDidShow, useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface WebViewParams {
  url: string;
  title?: string;
  useHost?: string;
}

export default function WebViewPage() {
  const router = useRouter<Partial<WebViewParams>>();
  const { url: urlParam, title, useHost = 'false' } = router.params;
  const [url, setUrl] = useState('');

  const isFirst = useRef(true);

  const webviewUrl = useMemo(() => {
    let decodedUrl = urlParam ? decodeURIComponent(urlParam) : '';
    if (useHost === 'true') {
      decodedUrl = `${APP_URL}${decodedUrl}`;
    }
    return decodedUrl || '';
  }, [urlParam, useHost]);

  const refreshUrl = useCallback(() => {
    if (!webviewUrl) {
      Taro.showToast({ title: '缺少链接地址', icon: 'none' });
      return;
    }
    const accessToken = Taro.getStorageSync(ACCESS_TOKEN_STORAGE_KEY);
    const refreshToken = Taro.getStorageSync(REFRESH_TOKEN_STORAGE_KEY);

    const tokenParams = new URLSearchParams();
    tokenParams.set('access_token', accessToken);
    tokenParams.set('refresh_token', refreshToken);
    tokenParams.set('timestamp', Date.now().toString());

    if (webviewUrl.includes('?')) {
      setUrl(`${webviewUrl}&${tokenParams.toString()}`);
    } else {
      setUrl(`${webviewUrl}?${tokenParams.toString()}`);
    }

    if (title) {
      Taro.setNavigationBarTitle({ title: decodeURIComponent(title) });
    }
  }, [webviewUrl, title]);

  useEffect(() => {
    refreshUrl();
    isFirst.current = false;
  }, [refreshUrl]);

  useShareAppMessage(() => {
    return {
      title: '藏宝壳，一个藏宝的地方',
      path: paths.webview(webviewUrl, title),
    };
  });

  useShareTimeline(() => {
    return {
      title: '藏宝壳，一个藏宝的地方',
      query: `?url=${encodeURIComponent(webviewUrl)}&title=${encodeURIComponent(title || '')}`,
    };
  });

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
