import wx from 'weixin-js-sdk';
import { useEffect } from 'react';

import { hostPaths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { setSession } from 'src/auth/context/jwt';

const metadata = { title: `退出登录 - ${CONFIG.appName}` };
export default function LogOutPage() {
  useEffect(() => {
    setSession(null);
    wx.miniProgram.redirectTo({
      url: hostPaths.auth.logout,
    });
  }, []);

  return (
    <>
      <title>{metadata.title}</title>
      <div />
    </>
  );
}
