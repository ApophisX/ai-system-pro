/**
 * Taro 小程序「消息中心」页面 - 入口
 * 页面视图位于 sections/message/view，组件位于 sections/message/components
 */

import { useAuthContext } from '@/auth/hooks';
import UserEmpty from '@/components/user-empty';
import { useToken } from '@/hooks/use-token';
import { webPaths } from '@/route/paths';
import { WebView } from '@tarojs/components';
import { useEffect, useState } from 'react';

export default function Index() {
  const { user, checkUserSession } = useAuthContext();
  const { token, refreshToken } = useToken();

  const [url, setUrl] = useState(``);

  useEffect(() => {
    if (token && user) {
      setUrl(`${webPaths.publish}?access_token=${token}&refresh_token=${refreshToken}}`);
    } else {
      setUrl(``);
    }
  }, [token, user]);

  if (!user || !token) {
    return <UserEmpty onLoginSuccess={checkUserSession} />;
  }

  if (!url) {
    return null;
  }

  return <WebView src={url} />;
}
