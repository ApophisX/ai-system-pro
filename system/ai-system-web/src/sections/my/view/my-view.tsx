import { throttle } from 'es-toolkit';
import { useSearchParams } from 'react-router';
import React, { useRef, useState, useEffect } from 'react';

import { Box, Container } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';

import { StatsCards } from '../stats-cards';
import { FunctionList } from '../function-list';
import { ScrollAppBar } from '../scroll-appbar';
import { BottomNav } from '../../home/bottom-nav';
import { useGetUserRole } from '../hooks/use-role';
import { UserProfileHeader } from '../user-profile-header';

// ----------------------------------------------------------------------

export const MyView: React.FC = () => {
  const { userRole } = useGetUserRole();
  const { checkUserSession } = useAuthContext();
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const [visible, setVisible] = useState(false);

  const [searchParams] = useSearchParams();
  const jumpTo = searchParams.get('jumpTo');
  const router = useRouter();
  useEffect(() => {
    if (jumpTo && first.current) {
      first.current = false;
      window.history.replaceState({}, '', window.location.pathname);
      router.push(jumpTo);
    }
  }, [jumpTo, router]);

  useEffect(() => {
    const handleScroll = throttle(() => {
      // 获取滚动距离
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      // 当滚动距离大于100时显示 AppBar，否则隐藏
      setVisible(scrollTop > 170);
    }, 100);

    // 监听滚动事件
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 初始检查一次
    handleScroll();

    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    checkUserSession?.();
  }, [checkUserSession]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* 滚动时显示的 AppBar */}
      <ScrollAppBar visible={visible} />

      <Container ref={scrollbarRef} maxWidth="lg" sx={{ px: 0, pb: 8 }}>
        {/* 用户信息头部 */}
        <UserProfileHeader ref={headerRef} role={userRole} />

        {/* 统计卡片 */}
        <StatsCards role={userRole} />

        {/* 功能列表 */}
        <FunctionList role={userRole} />
      </Container>

      {/* 固定底部导航 */}
      <BottomNav />
    </Box>
  );
};
