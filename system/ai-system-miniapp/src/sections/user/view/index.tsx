/**
 * 用户中心 - 页面视图
 * 纯 UI 展示，使用模拟数据
 */

import { View, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import { useAuthContext } from '@/auth/hooks';
import {
  UserProfileHeader,
  LessorStatsCards,
  LesseeStatsCards,
  FunctionGroup,
  type FunctionGroupProps,
} from '@/sections/user/components';
import { useCallback, useEffect, useState } from 'react';
import API from '@/services/API';
import { paths, webPaths } from '@/route/paths';
import { useGetMessageUnreadCount } from '@/actions/message';
import { useGetAccountCredit } from '@/actions/account';

/** 默认的租赁方统计数据 */
const DEFAULT_LESSEE_STATS: MyApi.OutputLesseeStatisticsDto = {
  orderCount: 0,
  pendingPaymentOrderCount: 0,
  totalDepositAmount: 0,
  favoriteAssetCount: 0,
  paidPendingReceiveOrderCount: 0,
};

/** 默认的出租方统计数据 */
const DEFAULT_LESSOR_STATS: MyApi.OutputLessorStatisticsDto = {
  publishedAssetCount: 0,
  totalAssetCount: 0,
  inProgressOrderCount: 0,
  pendingOrderCount: 0,
  totalIncome: 0,
};

export function UserView() {
  const { user, checkUserSession, userRole } = useAuthContext();
  const [lesseeStats, setLesseeStats] = useState(DEFAULT_LESSEE_STATS);
  const [lessorStats, setLessorStats] = useState(DEFAULT_LESSOR_STATS);
  const { data: unreadCount, mutate: mutateUnreadCount } = useGetMessageUnreadCount();
  const { data: creditAccount, mutate: mutateCreditAccount } = useGetAccountCredit({ actorRole: userRole });

  const commonGroups: FunctionGroupProps[] = [
    {
      title: '其他功能',
      items: [
        {
          icon: '🔔',
          title: '消息中心',
          subtitle: '订单消息和系统通知',
          badge: unreadCount || 0,
          onClick: () => {
            Taro.navigateTo({
              url: paths.webview(webPaths.messageCenter),
            });
          },
          color: '#6366f1',
        },
        {
          icon: '📍',
          title: '常用地址',
          subtitle: '管理联系地址',
          onClick: () => {
            Taro.navigateTo({
              url: paths.webview(webPaths.myContactList),
            });
          },
          color: '#8b5cf6',
        },
        {
          icon: '🏠',
          title: '我创建的社区',
          subtitle: '查看我创建的社区',
          onClick: () => {
            Taro.navigateTo({
              url: paths.webview(webPaths.community.my),
            });
          },
          color: '#06b6d4',
        },
        ...(userRole === 'lessor'
          ? [
              {
                icon: '⭐',
                title: '评价管理',
                subtitle: '查看资产评价',
                onClick: () => {
                  Taro.navigateTo({
                    url: paths.webview(webPaths.lessorEvaluationRoot),
                  });
                },
                color: '#f59e0b',
              },
            ]
          : []),
      ],
    },
    {
      title: '账户与设置',
      items: [
        {
          icon: '🛡️',
          title: '实名认证',
          subtitle: user?.isVerified ? '已认证' : '未认证',
          badge: user?.isVerified ? undefined : '去认证',
          onClick: () => {
            Taro.navigateTo({
              url: paths.webview(webPaths.myVerify),
            });
          },
          color: user?.isVerified ? '#10b981' : '#f59e0b',
        },
        {
          icon: '📊',
          title: '信用中心',
          subtitle: `当前信用分：${creditAccount?.creditScore || '--'}`,
          onClick: () => {
            Taro.navigateTo({
              url: paths.webview(webPaths.myCredit),
            });
          },
          color: '#06b6d4',
        },
        {
          icon: '👥',
          title: '合作申请',
          subtitle: '申请合作，获得更多收益',
          onClick: () => {
            Taro.navigateTo({ url: paths.webview(webPaths.myEnterpriseVerify) });
          },
          color: '#6366f1',
        },
        // {
        //   icon: '👥',
        //   title: '邀请好友',
        //   subtitle: '邀请好友获得奖励',
        //   onClick: () => {
        //     Taro.navigateTo({
        //       url: paths.webview(webPaths.myInvite),
        //     });
        //   },
        //   color: '#6366f1',
        // },
        {
          icon: '⚙️',
          title: '设置',
          subtitle: '账户设置和隐私设置',
          onClick: () => {
            Taro.navigateTo({
              url: paths.setting,
            });
          },
          color: '#6b7280',
        },
        {
          icon: '❓',
          title: '帮助中心',
          subtitle: '常见问题和客服',
          onClick: () => {
            Taro.navigateTo({
              url: paths.webview(webPaths.myHelp),
            });
          },
          color: '#6b7280',
        },
      ],
    },
  ];

  const lessorFunctionGroups: FunctionGroupProps[] = [
    {
      title: '我的',
      items: [
        {
          icon: '📦',
          title: '我的资产',
          subtitle: '查看我的资产数量',
          badge: lessorStats.totalAssetCount,
          onClick: () => {
            Taro.navigateTo({
              url: paths.webview(webPaths.lessorAssets),
            });
          },
          color: '#6366f1',
        },
        {
          icon: '🛒',
          title: '订单管理',
          subtitle: '查看所有订单',
          badge: lessorStats.inProgressOrderCount,
          onClick: () => {
            Taro.navigateTo({
              url: paths.webview(webPaths.lessorOrder),
            });
          },
          color: '#10b981',
        },
        {
          icon: '💵',
          title: '收入明细',
          subtitle: '查看收入记录和统计',
          onClick: () => {
            Taro.navigateTo({
              url: paths.webview(webPaths.lessorIncome),
            });
          },
          color: '#f59e0b',
        },
        {
          icon: '📋',
          title: '订单管理',
          subtitle: '处理订单和确认',
          onClick: () => {
            Taro.navigateTo({
              url: paths.webview(webPaths.lessorOrderManagement),
            });
          },
          color: '#06b6d4',
        },
      ],
    },
    ...commonGroups,
  ];

  const lesseeFunctionGroups: FunctionGroupProps[] = [
    {
      title: '订单管理',
      items: [
        {
          icon: '🛒',
          title: '我的订单',
          subtitle: '查看所有订单',
          badge: lesseeStats.orderCount,
          onClick: () => {
            Taro.navigateTo({ url: paths.order.list });
          },
          color: '#10b981',
        },
        {
          icon: '💳',
          title: '待支付',
          subtitle: '待支付的订单',
          badge: lesseeStats.pendingPaymentOrderCount,
          onClick: () => {
            Taro.navigateTo({ url: `${paths.order.list}?status=created` });
          },
          color: '#ef4444',
        },
        {
          icon: '💰',
          title: '押金管理',
          subtitle: '查看押金状态和记录',
          onClick: () => {
            Taro.navigateTo({
              url: paths.webview(webPaths.myDeposit),
            });
          },
          color: '#06b6d4',
        },
        {
          icon: '❤️',
          title: '我的收藏',
          subtitle: '收藏的资产',
          onClick: () => {
            Taro.navigateTo({
              url: paths.webview(webPaths.myFavorites),
            });
          },
          color: '#f59e0b',
        },
      ],
    },
    ...commonGroups,
  ];

  const functionGroups = userRole === 'lessor' ? lessorFunctionGroups : lesseeFunctionGroups;

  const init = useCallback(async () => {
    if (userRole === 'lessor') {
      const res = await API.AppStatistics.AppStatisticsControllerGetLessorStatisticsV1();
      setLessorStats(res.data);
    } else {
      const res = await API.AppStatistics.AppStatisticsControllerGetLesseeStatisticsV1();
      setLesseeStats(res.data);
    }
  }, [userRole]);

  useDidShow(async () => {
    Taro.setStorageSync('hideLoading', 'true');
    try {
      await checkUserSession?.();
      await init();
    } catch (error) {
    } finally {
      Taro.removeStorageSync('hideLoading');
    }
  });

  usePullDownRefresh(async () => {
    try {
      await checkUserSession?.();
      await Promise.allSettled([init(), mutateUnreadCount(), mutateCreditAccount()]);
    } catch (error) {
    } finally {
      Taro.stopPullDownRefresh();
    }
  });

  useEffect(() => {
    init();
  }, [init]);

  return (
    <View className="min-h-screen bg-gray-50 flex flex-col safe-area-bottom" style={{ height: '100vh' }}>
      <ScrollView scrollY className="flex-1" style={{ flex: 1 }} enhanced showScrollbar={false} enableBackToTop>
        <UserProfileHeader creditAccount={creditAccount} role={userRole} />

        {userRole === 'lessor' ? <LessorStatsCards stats={lessorStats} /> : <LesseeStatsCards stats={lesseeStats} />}

        <View className="px-4 pb-12">
          {functionGroups.map(group => (
            <FunctionGroup key={group.title} {...group} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
