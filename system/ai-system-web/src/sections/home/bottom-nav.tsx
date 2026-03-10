import type { BottomNavigationProps } from '@mui/material';

import React from 'react';
import { m } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Plus, Compass, Users } from 'lucide-react';

import { Box, Paper, Badge, BottomNavigation, BottomNavigationAction } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

import API from 'src/services/API';
import * as bridge from 'src/lib/bridge';
import { PlatformDetector } from 'src/utils';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

import { useGetUserRole } from '../my/hooks/use-role';

interface BottomNavProps {
  // value: number;
  // onChange: (newValue: number) => void;
}

export const BottomNav: React.FC<BottomNavProps> = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isInWeChatMiniProgram = PlatformDetector.isWeChatMiniProgram();

  const { user } = useAuthContext();

  const { userRole } = useGetUserRole();

  const { data: count } = useQuery({
    queryKey: ['unread-message-count'],
    retry: false,
    queryFn: () =>
      API.AppMessage.AppMessageControllerGetUnreadCountV1(
        { type: '' },
        {
          fetchOptions: {
            showError: false,
          },
        }
      ),
    select: (res) => res.data?.data ?? 0,
  });

  // 根据当前路径确定激活的tab
  const getActiveValue = () => {
    if (pathname === paths.home.root) return 'home';
    if (pathname.startsWith(paths.community.root)) return 'community';
    if (pathname === paths.rental.goodsPublish.root) return 'goodsPublish';
    if (pathname === paths.message.root) return 'message';
    if (pathname === paths.my.root) return 'my';
    return 'home';
  };

  const handleChange: BottomNavigationProps['onChange'] = (_event, newValue) => {
    // 根据tab值进行路由跳转
    switch (newValue) {
      case 'home':
        router.replace(paths.home.root);
        break;
      case 'community':
        router.replace(paths.community.root);
        break;
      case 'goodsPublish':
        router.push(paths.rental.goodsPublish.root);
        break;
      case 'message':
        router.replace(paths.message.root);
        break;
      case 'my':
        router.replace(paths.my.root);
        break;
      case 'scanRent':
        bridge.navigateTo('/pages/scan-qrcode/index');
        break;
      default:
        break;
    }
  };
  if (isInWeChatMiniProgram) {
    return null;
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'visible', // 允许 Fab 按钮溢出
        boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
      }}
      elevation={0}
    >
      <BottomNavigation
        showLabels
        value={getActiveValue()}
        onChange={handleChange}
        sx={{
          height: 84,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'relative',
        }}
      >
        <BottomNavigationAction
          value="home"
          label="发现"
          icon={<Compass size={22} />}
          component={m.button}
          whileTap={{ scale: 0.9 }}
          slotProps={{ label: { sx: { mt: 0.5 } } }}
        />

        <BottomNavigationAction
          value="community"
          label="社区"
          icon={<Users size={22} />}
          component={m.button}
          whileTap={{ scale: 0.9 }}
          slotProps={{ label: { sx: { mt: 0.5 } } }}
        />

        {userRole === 'lessee' && (
          <BottomNavigationAction
            label="扫码租物"
            value="scanRent"
            component={m.button}
            whileTap={{ scale: 0.9 }}
            icon={<Iconify icon="solar:code-scan-bold" width={22} height={22} />}
            slotProps={{ label: { sx: { mt: 0.5 } } }}
          />
        )}

        {user?.userType === 'enterprise' && user.isEnterpriseVerified && userRole === 'lessor' && (
          <BottomNavigationAction
            label="发布"
            value="goodsPublish"
            component={m.button}
            whileTap={{ scale: 0.9 }}
            slotProps={{ label: { sx: { mt: 0.5 } } }}
            icon={
              <Box sx={{ position: 'relative' }}>
                <Plus size={22} />
              </Box>
            }
          />
        )}

        <BottomNavigationAction
          label="消息"
          value="message"
          component={m.button}
          whileTap={{ scale: 0.9 }}
          slotProps={{ label: { sx: { mt: 0.5 } } }}
          icon={
            <Badge badgeContent={count} color="error" slotProps={{ badge: { sx: { right: -6 } } }}>
              <Iconify icon="solar:bell-bing-bold" width={22} height={22} />
            </Badge>
          }
        />
        <BottomNavigationAction
          label="我的"
          value="my"
          icon={<Iconify icon="solar:user-rounded-bold" width={22} height={22} />}
          slotProps={{ label: { sx: { mt: 0.5 } } }}
          component={m.button}
          whileTap={{ scale: 0.9 }}
        />
      </BottomNavigation>
    </Paper>
  );
};
