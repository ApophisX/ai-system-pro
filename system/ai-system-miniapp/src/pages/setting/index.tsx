/**
 * Taro 小程序「设置」页面 - 纯 UI 展示，使用模拟数据
 * 使用 TailwindCSS 实现样式
 * 使用 MyApi 接口定义，不实现实际请求
 */

import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Switch } from '@tarojs/components';
import { paths, webPaths } from '@/route/paths';
import { useAuthContext } from '@/auth/hooks';

// ----------------------------------------------------------------------
// 路径常量
// ----------------------------------------------------------------------

const PATHS = {
  auth: {
    amplify: {
      resetPassword: '/auth/amplify/reset-password',
    },
    jwt: {
      signIn: '/auth/jwt/sign-in',
    },
  },
  my: {
    enterpriseVerify: '/my/enterprise-verify',
    merchantInvite: '/my/merchant-invite',
    terms: {
      about: '/my/terms/about',
      privacy: '/my/terms/privacy',
      userAgreement: '/my/terms/user-agreement',
    },
  },
};

// ----------------------------------------------------------------------
// MOCK 数据
// ----------------------------------------------------------------------

const MOCK_USER: Pick<MyApi.OutputUserDetailDto, 'phone' | 'enterpriseVerificationStatus'> = {
  phone: '13812345678',
  enterpriseVerificationStatus: 'verified',
};

const MOCK_USER_ROLE: MyApi.OutputCreditAccountDto['actorRole'] = 'lessee';
const MOCK_HAS_MERCHANT_INVITE_PERMISSION = false;

// ----------------------------------------------------------------------
// 设置项组件
// ----------------------------------------------------------------------

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  action?: React.ReactNode;
}

function SettingItem({ icon, title, subtitle, onClick, action }: SettingItemProps) {
  return (
    <View
      className={`flex flex-row items-center py-4 px-4 ${onClick || action ? 'active:bg-gray-50' : ''}`}
      hoverClass={onClick || action ? 'bg-gray-50' : ''}
      onClick={onClick}
    >
      <View className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Text className="text-lg">{icon}</Text>
      </View>
      <View className="flex-1 ml-3 min-w-0 flex flex-col">
        <Text className="text-gray-900 font-medium">{title}</Text>
        {subtitle && <Text className="text-gray-500 text-xs mt-0.5">{subtitle}</Text>}
      </View>
      {action ?? (onClick && <Text className="text-gray-400 ml-2">›</Text>)}
    </View>
  );
}

// ----------------------------------------------------------------------
// 设置分组
// ----------------------------------------------------------------------

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">{title}</Text>
      <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">{children}</View>
    </View>
  );
}

// ----------------------------------------------------------------------
// 主视图
// ----------------------------------------------------------------------

export default function Index() {
  // const { userRole, setUserRole } = useAuthContext();
  // const [darkMode, setDarkMode] = useState(false);
  // const hasMerchantInvitePermission = MOCK_HAS_MERCHANT_INVITE_PERMISSION;
  const [notifications, setNotifications] = useState(true);

  const { user } = useAuthContext();

  const maskedPhone = user?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') ?? '未绑定';

  const enterpriseStatusText =
    user?.enterpriseVerificationStatus === 'verified'
      ? '已认证'
      : user?.enterpriseVerificationStatus === 'pending'
        ? '审核中'
        : user?.enterpriseVerificationStatus === 'rejected'
          ? '未通过'
          : '未认证';

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: res => {
        if (res.confirm) {
          // Taro.navigateTo({ url: paths.auth.logout }).catch(() => {});
          Taro.navigateTo({
            url: `${paths.webview(webPaths.webviewLogout)}`,
          });
        }
      },
    });
  };

  return (
    <View className="min-h-screen bg-gray-50 flex flex-col" style={{ height: '100vh' }}>
      <ScrollView scrollY className="flex-1 px-4 py-4" style={{ flex: 1 }} enhanced showScrollbar={false}>
        <SettingsGroup title="账号安全">
          <SettingItem icon="📱" title="手机号码" subtitle={maskedPhone} />
          <View className="border-t border-gray-100" />
          <SettingItem
            icon="🔒"
            title="登录密码"
            subtitle="修改登录密码"
            onClick={() =>
              Taro.navigateTo({
                url: paths.webview(`${webPaths.myResetPassword}?phoneNumber=${user?.phone}`),
              })
            }
          />
        </SettingsGroup>

        {/* <SettingsGroup title="认证与邀请">
          <SettingItem
            icon="🏢"
            title="企业认证"
            subtitle={enterpriseStatusText}
            onClick={() => {
              Taro.navigateTo({ url: paths.webview(webPaths.myEnterpriseVerify) });
            }}
          />
          {userRole === 'lessor' && hasMerchantInvitePermission && <View className="border-t border-gray-100" />}
          {hasMerchantInvitePermission && (
            <SettingItem
              icon="🏪"
              title="商户邀请"
              subtitle="邀请商户入驻，获得分润"
              onClick={() => Taro.navigateTo({ url: PATHS.my.merchantInvite })}
            />
          )}
        </SettingsGroup> */}

        <SettingsGroup title="通用设置">
          {/* <SettingItem
            icon="👥"
            title="角色切换"
            subtitle={userRole === 'lessor' ? '出租方' : '承租方'}
            action={
              <View className="flex flex-row gap-2">
                <View
                  className={`px-3 py-1.5 rounded-lg ${userRole === 'lessee' ? 'bg-blue-500' : 'bg-gray-200'}`}
                  hoverClass="opacity-90"
                  onClick={() => setUserRole('lessee')}
                >
                  <Text className={`text-sm font-medium ${userRole === 'lessee' ? 'text-white' : 'text-gray-600'}`}>
                    承租方
                  </Text>
                </View>
                <View
                  className={`px-3 py-1.5 rounded-lg ${userRole === 'lessor' ? 'bg-blue-500' : 'bg-gray-200'}`}
                  hoverClass="opacity-90"
                  onClick={() => setUserRole('lessor')}
                >
                  <Text className={`text-sm font-medium ${userRole === 'lessor' ? 'text-white' : 'text-gray-600'}`}>
                    出租方
                  </Text>
                </View>
              </View>
            }
          />
          <View className="border-t border-gray-100" /> */}
          <SettingItem
            icon="🔔"
            title="消息通知"
            subtitle="开启消息通知后，您将收到系统消息"
            action={<Switch checked={notifications} color="#3b82f6" onChange={e => setNotifications(e.detail.value)} />}
          />
          <View className="border-t border-gray-100" />
          {/* <SettingItem
            icon="🌙"
            title="深色模式"
            subtitle="适合夜间使用，节省电量"
            action={<Switch checked={darkMode} color="#3b82f6" onChange={e => setDarkMode(e.detail.value)} />}
          /> */}
          <View className="border-t border-gray-100" />
          <SettingItem icon="🌐" title="语言设置" subtitle="简体中文" />
        </SettingsGroup>

        <SettingsGroup title="隐私与其他">
          <SettingItem
            icon="🔐"
            title="隐私政策"
            subtitle="了解我们如何保护您的个人信息"
            onClick={() => {
              Taro.navigateTo({ url: paths.webview(`${APP_URL}/terms/privacy.html`) });
            }}
          />
          <View className="border-t border-gray-100" />
          <SettingItem
            icon="📄"
            title="用户协议"
            subtitle="平台服务条款与使用规范"
            onClick={() => {
              Taro.navigateTo({ url: paths.webview(`${APP_URL}/terms/user-agreement.html`) });
            }}
          />
          <View className="border-t border-gray-100" />
          <SettingItem
            icon="ℹ️"
            title="关于我们"
            subtitle="v1.0.0"
            onClick={() => {
              Taro.navigateTo({ url: paths.webview(`${APP_URL}/terms/about.html`) });
            }}
          />
        </SettingsGroup>

        <View className="mt-6">
          <View
            className="flex flex-row items-center justify-center py-4 rounded-2xl bg-red-50 border border-red-100"
            hoverClass="opacity-90"
            onClick={handleLogout}
          >
            <Text className="text-lg mr-2">🚪</Text>
            <Text className="text-red-600 font-semibold">退出登录</Text>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
