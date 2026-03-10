import type { UserRole } from './types';

import React from 'react';
import { m } from 'framer-motion';
import { Wallet, Package, Calendar, TrendingUp, CreditCard, ShoppingBag } from 'lucide-react';

import { Box, Grid, Stack, alpha, Paper, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useGetLesseeStatistics, useGetLessorStatistics } from 'src/actions/statistics';

import { Iconify } from 'src/components/iconify';
import { HorizontalStack } from 'src/components/custom/layout';

// ----------------------------------------------------------------------

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  onClick?: () => void;
  delay?: number;
  valuePrefix?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  color,
  onClick,
  valuePrefix,
  delay = 0,
}) => (
  <Grid size={{ xs: 6, md: 3 }}>
    <Paper
      component={m.div}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      sx={{
        p: 2,
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2.5,
        border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        bgcolor: 'background.paper',
        boxShadow: (theme) => theme.customShadows.card,
        transition: (theme) =>
          theme.transitions.create(['box-shadow', 'transform'], {
            duration: theme.transitions.duration.shorter,
          }),
        '&:hover': {
          boxShadow: (theme) => `0 12px 24px ${alpha(color, 0.2)}`,
        },
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          bgcolor: color,
        },
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'common.white',
              background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
              boxShadow: `0 4px 12px ${alpha(color, 0.3)}`,
            }}
          >
            {icon}
          </Box>
          {subtitle && (
            <Box
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: alpha(color, 0.1),
                color,
                fontSize: '0.65rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {subtitle}
            </Box>
          )}
        </Stack>

        <Stack spacing={0.5}>
          <HorizontalStack spacing={0.25} alignItems="baseline">
            {valuePrefix && (
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {valuePrefix}
              </Typography>
            )}
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: 'text.primary',
                lineHeight: 1,
                letterSpacing: -0.5,
              }}
            >
              {value}
            </Typography>
          </HorizontalStack>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              opacity: 0.8,
            }}
          >
            {title}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  </Grid>
);

// ----------------------------------------------------------------------
// 出租方统计卡片
// ----------------------------------------------------------------------

/** 出租方（lessor）统计卡片：已发布资产、进行中订单、累计收入、待处理订单 */
export function LessorStatsCards() {
  const router = useRouter();
  const { data: lessorStatistics } = useGetLessorStatistics();
  // 模拟数据，实际应从 API 获取

  const cards: StatCardProps[] = [
    {
      icon: <Package size={22} />,
      title: '已发布资产',
      value: lessorStatistics?.publishedAssetCount || 0,
      subtitle: 'Assets',
      color: '#3b82f6',
      onClick: () => router.push(`${paths.lessor.assets.root}?tab=online`),
    },
    {
      icon: <ShoppingBag size={22} />,
      title: '进行中订单',
      value: lessorStatistics?.inProgressOrderCount || 0,
      subtitle: 'Active',
      color: '#10b981',
      onClick: () => router.push(`${paths.lessor.order.root}?status=all`),
    },
    {
      icon: <TrendingUp size={22} />,
      title: '累计收入',
      valuePrefix: '¥',
      value: `${lessorStatistics?.totalIncome || 0}`,
      subtitle: 'Income',
      color: '#f59e0b',
      onClick: () => router.push(paths.lessor.income),
    },
    {
      icon: <Iconify icon="solar:notebook-bold-duotone" width={22} />,
      title: '待处理订单',
      value: lessorStatistics?.pendingOrderCount || 0,
      subtitle: 'Pending',
      color: '#8b5cf6',
      onClick: () => router.push(paths.lessor.order.management),
    },
  ];

  return (
    <Box sx={{ px: 2, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', px: 0.5 }}>
        出租数据
      </Typography>
      <Grid container spacing={2}>
        {cards.map((card, index) => (
          <StatCard key={card.title} {...card} delay={index * 0.1} />
        ))}
      </Grid>
    </Box>
  );
}

// ----------------------------------------------------------------------
// 承租方统计卡片
// ----------------------------------------------------------------------

/** 承租方（lessee）统计卡片：我的订单、待支付、押金总额、收藏资产 */
export function LesseeStatsCards() {
  const router = useRouter();

  // 作为承租方获取统计数据
  const { data: lesseeStatistics } = useGetLesseeStatistics();

  const cards = [
    {
      icon: <Calendar size={22} />,
      title: '我的订单',
      value: lesseeStatistics?.orderCount || 0,
      subtitle: 'Orders',
      color: '#8b5cf6',
      onClick: () => router.push(paths.my.orders),
    },
    {
      icon: <CreditCard size={22} />,
      title: '待支付',
      value: lesseeStatistics?.pendingPaymentOrderCount || 0,
      subtitle: 'To Pay',
      color: '#ef4444',
      onClick: () => router.push(paths.my.pendingPayment),
    },
    {
      icon: <Wallet size={22} />,
      title: '押金总额',
      value: `¥${lesseeStatistics?.totalDepositAmount || 0}`,
      subtitle: 'Deposit',
      color: '#06b6d4',
      onClick: () => router.push(paths.my.deposit),
    },
    {
      icon: <ShoppingBag size={22} />,
      title: '收藏资产',
      value: lesseeStatistics?.favoriteAssetCount || 0,
      subtitle: 'Favorites',
      color: '#e2aa53',
      onClick: () => router.push(paths.my.favorites),
    },
  ];

  return (
    <Box sx={{ px: 2, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', px: 0.5 }}>
        租赁数据
      </Typography>
      <Grid container spacing={2}>
        {cards.map((card, index) => (
          <StatCard key={card.title} {...card} delay={index * 0.1} />
        ))}
      </Grid>
    </Box>
  );
}

// ----------------------------------------------------------------------
// 按角色选择展示的统计卡片（兼容原有用法）
// ----------------------------------------------------------------------

interface StatsCardsProps {
  role: UserRole;
}

/** 根据 role 展示出租方或承租方统计卡片 */
export function StatsCards({ role }: StatsCardsProps) {
  if (role === 'lessor') {
    return <LessorStatsCards />;
  }
  return <LesseeStatsCards />;
}
