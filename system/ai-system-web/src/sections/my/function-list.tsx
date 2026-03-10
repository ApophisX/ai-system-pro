import type { UserRole } from './types';
import type { PaletteColorKey } from 'src/theme/core/palette';

import { m } from 'framer-motion';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  Heart,
  Users,
  Shield,
  MapPin,
  Wallet,
  Package,
  Settings,
  Calendar,
  BarChart3,
  DollarSign,
  HelpCircle,
  CreditCard,
  ShoppingBag,
  MessageSquare,
  Building,
} from 'lucide-react';

import {
  Box,
  List,
  Chip,
  Paper,
  ListItem,
  Typography,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import API from 'src/services/API';
import { useGetCreditAccount } from 'src/actions/credit';
import { useGetLesseeStatistics, useGetLessorStatistics } from 'src/actions/statistics';

import { useAuthContext } from 'src/auth/hooks';

import { useGetUserRole } from './hooks/use-role';

// ----------------------------------------------------------------------

interface FunctionItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string | number;
  onClick: () => void;
  delay?: number;
  color?: PaletteColorKey | 'default';
}

const FunctionItem: React.FC<FunctionItemProps> = ({
  icon,
  title,
  subtitle,
  badge,
  onClick,
  delay = 0,
  color = 'primary',
}) => (
  <ListItem
    component={m.div}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay }}
    disablePadding
  >
    <ListItemButton
      component={m.button}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      sx={{
        borderRadius: 2,
        mb: 0.5,
        py: 1.5,
        px: 2,
        gap: 2,
      }}
    >
      <ListItemIcon sx={{ color: `${color}.main` }}>{icon}</ListItemIcon>
      <ListItemText
        primary={title}
        secondary={subtitle}
        slotProps={{
          primary: { variant: 'body1', fontWeight: 500 },
          secondary: { variant: 'caption', sx: { mt: 0.5 } },
        }}
      />
      {badge ? (
        <Chip
          label={badge}
          size="small"
          color={color}
          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }}
        />
      ) : null}
    </ListItemButton>
  </ListItem>
);

// ----------------------------------------------------------------------
// 共用：其他功能 + 账户与设置
// ----------------------------------------------------------------------

type FunctionGroup = {
  title: string;
  items: Array<{
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    badge?: string | number;
    onClick: () => void;
    color: PaletteColorKey | 'default';
  }>;
};

// ----------------------------------------------------------------------
// 获取公共功能组
// ----------------------------------------------------------------------

function useGetCommonFunctionGroups(role: UserRole): FunctionGroup[] {
  const router = useRouter();
  const { user } = useAuthContext();
  const { data: creditAccount } = useGetCreditAccount(role);
  const { userRole } = useGetUserRole();

  const { data: count } = useQuery({
    queryKey: ['unread-message-count'],
    queryFn: () => API.AppMessage.AppMessageControllerGetUnreadCountV1({ type: '' }),
    select: (res) => res.data?.data ?? 0,
  });

  return [
    {
      title: '其他功能',
      items: [
        {
          icon: <MessageSquare size={20} />,
          title: '消息中心',
          subtitle: '订单消息和系统通知',
          badge: count,
          onClick: () => router.push(paths.message.center),
          color: 'primary',
        },
        {
          icon: <MapPin size={20} />,
          title: '常用地址',
          subtitle: '管理联系地址',
          onClick: () => router.push(paths.my.contact.list),
          color: 'secondary',
        },
        {
          icon: <Building size={20} />,
          title: '我的社区',
          subtitle: '查看我的社区',
          onClick: () => router.push(paths.community.my),
          color: 'primary',
        },
        ...(userRole === 'lessor'
          ? ([
              {
                icon: <Star size={20} />,
                title: '评价管理',
                subtitle: '查看资产评价',
                onClick: () => {
                  router.push(paths.lessor.evaluation.root);
                },
                color: 'warning',
              },
            ] as FunctionGroup['items'])
          : []),
      ],
    },
    {
      title: '账户与设置',
      items: [
        {
          icon: <Shield size={20} />,
          title: '实名认证',
          subtitle: user?.isVerified ? '已认证' : '未认证',
          badge: user?.isVerified ? undefined : '去认证',
          onClick: () => router.push(paths.my.verify),
          color: user?.isVerified ? 'success' : 'warning',
        },
        {
          icon: <BarChart3 size={20} />,
          title: '信用中心',
          subtitle: `当前信用分：${creditAccount?.creditScore ?? 0}`,
          onClick: () => router.push(paths.my.credit),
          color: 'info',
        },
        {
          icon: <Users size={20} />,
          title: '邀请好友',
          subtitle: '邀请好友获得奖励',
          onClick: () => router.push(paths.my.invite),
          color: 'primary',
        },
        {
          icon: <Settings size={20} />,
          title: '设置',
          subtitle: '账户设置和隐私设置',
          onClick: () => router.push(paths.my.settings),
          color: 'default' as PaletteColorKey,
        },
        {
          icon: <HelpCircle size={20} />,
          title: '帮助中心',
          subtitle: '常见问题和客服',
          onClick: () => router.push(paths.my.help),
          color: 'default' as PaletteColorKey,
        },
      ],
    },
  ];
}

// ----------------------------------------------------------------------
// 功能组列表渲染
// ----------------------------------------------------------------------

interface FunctionGroupsViewProps {
  functionGroups: FunctionGroup[];
}

function FunctionGroupsView({ functionGroups }: FunctionGroupsViewProps) {
  return (
    <Box sx={{ px: 2, pb: 4 }}>
      {functionGroups.map((group, groupIndex) => (
        <Paper
          key={group.title}
          component={m.div}
          exit={{ opacity: 0, y: 20 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: groupIndex * 0.1 }}
          sx={{
            mb: 2,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: (theme) => theme.customShadows.card,
          }}
        >
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.neutral' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
              {group.title}
            </Typography>
          </Box>
          <List sx={{ py: 1 }}>
            {group.items.map((item, itemIndex) => (
              <FunctionItem
                key={item.title}
                {...item}
                delay={groupIndex * 0.1 + itemIndex * 0.05}
              />
            ))}
          </List>
        </Paper>
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------
// 出租方功能列表
// ----------------------------------------------------------------------

/** 出租方（lessor）功能列表：资产管理 + 其他功能 + 账户与设置 */
export function LessorFunctionList() {
  const router = useRouter();
  const commonFunctionGroups = useGetCommonFunctionGroups('lessor');

  const { data: lessorStatistics } = useGetLessorStatistics();

  const functionGroups = useMemo(() => {
    const lessorGroups: FunctionGroup[] = [
      {
        title: '资产管理',
        items: [
          {
            icon: <Package size={20} />,
            title: '我的资产',
            subtitle: '查看我资产数量',
            badge: lessorStatistics?.totalAssetCount || 0,
            onClick: () => router.push(paths.lessor.assets.root),
            color: 'primary',
          },
          {
            icon: <ShoppingBag size={20} />,
            title: '出租订单',
            subtitle: '查看所有出租订单',
            badge: lessorStatistics?.inProgressOrderCount || 0,
            onClick: () => router.push(paths.lessor.order.root),
            color: 'success',
          },
          {
            icon: <DollarSign size={20} />,
            title: '收入明细',
            subtitle: '查看收入记录和统计',
            onClick: () => router.push(paths.lessor.income),
            color: 'warning',
          },
          {
            icon: <Calendar size={20} />,
            title: '订单管理',
            subtitle: '处理订单和确认',
            onClick: () => router.push(paths.lessor.order.management),
            color: 'info',
          },
        ],
      },
    ];
    return [...lessorGroups, ...commonFunctionGroups];
  }, [
    lessorStatistics?.totalAssetCount,
    lessorStatistics?.inProgressOrderCount,
    commonFunctionGroups,
    router,
  ]);

  return <FunctionGroupsView functionGroups={functionGroups} />;
}

// ----------------------------------------------------------------------
// 承租方功能列表
// ----------------------------------------------------------------------

/** 承租方（lessee）功能列表：租赁管理 + 其他功能 + 账户与设置 */
export function LesseeFunctionList() {
  const router = useRouter();
  const { data: lesseeStatistics } = useGetLesseeStatistics();
  const commonFunctionGroups = useGetCommonFunctionGroups('lessee');
  const functionGroups = useMemo(() => {
    const lesseeGroups: FunctionGroup[] = [
      {
        title: '租赁管理',
        items: [
          {
            icon: <ShoppingBag size={20} />,
            title: '我的订单',
            subtitle: '查看所有租赁订单',
            badge: lesseeStatistics?.orderCount,
            onClick: () => router.push(paths.my.orders),
            color: 'success',
          },
          {
            icon: <CreditCard size={20} />,
            title: '待支付',
            subtitle: '待支付的订单',
            badge: lesseeStatistics?.pendingPaymentOrderCount,
            onClick: () => router.push(paths.my.pendingPayment),
            color: 'error',
          },
          {
            icon: <Wallet size={20} />,
            title: '押金管理',
            subtitle: '查看押金状态和记录',
            onClick: () => router.push(paths.my.deposit),
            color: 'info',
          },
          {
            icon: <Heart size={20} />,
            title: '我的收藏',
            subtitle: '收藏的资产',
            onClick: () => router.push(paths.my.favorites),
            color: 'warning',
          },
        ],
      },
    ];
    return [...lesseeGroups, ...commonFunctionGroups];
  }, [
    router,
    lesseeStatistics?.orderCount,
    lesseeStatistics?.pendingPaymentOrderCount,
    commonFunctionGroups,
  ]);

  return <FunctionGroupsView functionGroups={functionGroups} />;
}

// ----------------------------------------------------------------------
// 按角色选择展示的功能列表（兼容原有用法）
// ----------------------------------------------------------------------

interface FunctionListProps {
  role: UserRole;
}

/** 根据 role 展示出租方或承租方功能列表 */
export function FunctionList({ role }: FunctionListProps) {
  if (role === 'lessor') {
    return <LessorFunctionList />;
  }
  return <LesseeFunctionList />;
}
