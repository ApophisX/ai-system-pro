/**
 * Taro 小程序「我的」页面 - 入口
 * 页面视图位于 view 目录，组件位于 sections/user
 */

import './index.less';
import { useAuthContext } from '@/auth/hooks';
import { UserView } from '@/sections/user/view';
import UserEmpty from '@/components/user-empty';

export default function Index() {
  const { user, checkUserSession } = useAuthContext();

  if (!user) {
    return <UserEmpty onLoginSuccess={checkUserSession} />;
  }

  return <UserView />;
}
