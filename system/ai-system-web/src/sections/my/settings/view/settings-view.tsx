import type { UserRole } from '../../types';

import wx from 'weixin-js-sdk';
import { useState } from 'react';
import {
  Bell,
  Lock,
  Moon,
  Globe,
  Store,
  LogOut,
  FileText,
  Building2,
  Smartphone,
  ChevronRight,
} from 'lucide-react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import MenuItem from '@mui/material/MenuItem';
import { useColorScheme } from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { PlatformDetector } from 'src/utils';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { MobileLayout } from 'src/components/custom/layout';
import { useSettingsContext } from 'src/components/settings';

import { signOut } from 'src/auth/context/jwt';
import { useAuthContext } from 'src/auth/hooks';

import { useGetUserRole } from '../../hooks/use-role';
import { useHasMerchantInvitePermission } from '../../merchant-invite/hooks/use-has-merchant-invite-permission';

// ----------------------------------------------------------------------

export default function SettingsView() {
  const router = useRouter();

  // 模拟设置状态
  const [notifications, setNotifications] = useState(true);

  const { checkUserSession, user } = useAuthContext();
  const { userRole, setUserRole } = useGetUserRole();
  const { hasPermission: hasMerchantInvitePermission } = useHasMerchantInvitePermission();

  const settings = useSettingsContext();
  const { setMode, colorScheme } = useColorScheme();

  const handleLogout = async () => {
    await signOut();
    if (PlatformDetector.isWeChatMiniProgram()) {
      wx.miniProgram.navigateTo({
        url: '/pages/auth/logout/index',
        success: () => {
          router.replace(paths.auth.jwt.signIn);
        },
        fail: () => {
          router.replace(paths.auth.jwt.signIn);
        },
      });
    } else {
      toast.success('已安全退出');
      await checkUserSession?.();
      router.replace(paths.auth.jwt.signIn);
    }
  };

  const renderGroup = (title: string, items: any[]) => (
    <Box sx={{ mb: 3 }}>
      <ListSubheader
        disableSticky
        sx={{
          bgcolor: 'transparent',
          px: 0,
          mb: 1,
          color: 'text.secondary',
          typography: 'overline',
        }}
      >
        {title}
      </ListSubheader>
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {items.map((item, index) => (
          <div key={item.title}>
            {item.action ? (
              <ListItem secondaryAction={item.action}>
                <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.title} secondary={item.subtitle} />
              </ListItem>
            ) : (
              <ListItemButton onClick={item.onClick}>
                <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.title} secondary={item.subtitle} />
                {item.onClick && <ChevronRight size={20} color="#919EAB" />}
              </ListItemButton>
            )}
            {index < items.length - 1 && <Divider />}
          </div>
        ))}
      </Paper>
    </Box>
  );

  return (
    <MobileLayout
      appTitle="设置"
      appBarProps={{ onBack: () => router.back() }}
      containerProps={{ sx: { pb: 3 } }}
    >
      {renderGroup('账号安全', [
        {
          icon: <Smartphone size={20} />,
          title: '手机号码',
          subtitle: user?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') ?? '未绑定',
          // onClick: () => toast.info('修改手机号'),
        },
        {
          icon: <Lock size={20} />,
          title: '登录密码',
          subtitle: '修改登录密码',
          onClick: () => {
            router.push(`${paths.auth.amplify.resetPassword}?phoneNumber=${user?.phone}`);
          },
        },
        // {
        //   icon: <ShieldCheck size={20} />,
        //   title: '注销账号',
        //   subtitle: '注销账号后，您的账号将无法再使用',
        //   onClick: () => toast.info('注销账号流程'),
        // },
      ])}

      {(userRole === 'lessor' || hasMerchantInvitePermission) &&
        renderGroup('认证与邀请', [
          ...(userRole === 'lessor'
            ? [
                {
                  icon: <Building2 size={20} />,
                  // title: '企业认证',
                  title: '合作商认证',
                  subtitle:
                    user?.enterpriseVerificationStatus === 'verified'
                      ? '已认证'
                      : user?.enterpriseVerificationStatus === 'pending'
                        ? '审核中'
                        : user?.enterpriseVerificationStatus === 'rejected'
                          ? '未通过'
                          : '未认证',
                  onClick: () => router.push(paths.my.enterpriseVerify),
                },
              ]
            : []),
          ...(hasMerchantInvitePermission
            ? [
                {
                  icon: <Store size={20} />,
                  title: '商户邀请',
                  subtitle: '邀请商户入驻，获得分润',
                  onClick: () => router.push(paths.my.merchantInvite),
                },
              ]
            : []),
        ])}

      {renderGroup('通用设置', [
        {
          icon: <Iconify icon="solar:users-group-rounded-bold-duotone" />,
          title: '角色切换',
          subtitle: userRole === 'lessor' ? '出租方' : '承租方',
          action: (
            <Select
              size="small"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              sx={{
                minWidth: 90,
                '& fieldset': {
                  border: 'none',
                },
              }}
            >
              <MenuItem value="lessor">出租方</MenuItem>
              <MenuItem value="lessee">承租方</MenuItem>
            </Select>
          ),
        },
        {
          icon: <Bell size={20} />,
          title: '消息通知',
          subtitle: '开启消息通知后，您将收到系统消息',
          action: (
            <Switch
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              inputProps={{ 'aria-label': 'notifications' }}
            />
          ),
        },
        {
          icon: <Moon size={20} />,
          title: '深色模式',
          subtitle: '适合夜间使用，节省电量',
          action: (
            <Switch
              checked={settings.state.mode === 'dark'}
              onChange={(e) => {
                setMode(colorScheme === 'light' ? 'dark' : 'light');
                settings.setState({ mode: colorScheme === 'light' ? 'dark' : 'light' });
              }}
              slotProps={{ input: { 'aria-label': 'dark mode' } }}
            />
          ),
        },
        {
          icon: <Globe size={20} />,
          title: '语言设置',
          subtitle: '简体中文',
          // onClick: () => toast.info('切换语言'),
        },
      ])}

      {renderGroup('隐私与其他', [
        {
          icon: <Iconify icon="solar:lock-password-outline" />,
          title: '隐私政策',
          subtitle: '了解我们如何保护您的个人信息',
          onClick: () => router.push(paths.my.terms.privacy),
        },
        {
          icon: <FileText size={20} />,
          title: '用户协议',
          subtitle: '平台服务条款与使用规范',
          onClick: () => router.push(paths.my.terms.userAgreement),
        },
        {
          icon: <Iconify icon="eva:info-outline" />,
          title: '关于我们',
          subtitle: 'v1.0.0',
          onClick: () => router.push(paths.my.terms.about),
        },
      ])}

      <Box sx={{ mt: 4 }}>
        <Button
          fullWidth
          variant="soft"
          color="error"
          size="large"
          startIcon={<LogOut size={20} />}
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </Box>
    </MobileLayout>
  );
}
