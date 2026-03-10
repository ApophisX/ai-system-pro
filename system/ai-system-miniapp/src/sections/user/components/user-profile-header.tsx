/**
 * 用户信息头部
 */

import Taro from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import { useAuthContext } from '@/auth/hooks';
import { paths, webPaths } from '@/route/paths';
import MyIcon from '@/components/my-icon';

export interface UserProfileHeaderProps {
  creditAccount?: MyApi.OutputCreditAccountDto | null;
  role: MyApi.OutputCreditAccountDto['actorRole'];
}

export function UserProfileHeader({ creditAccount, role }: UserProfileHeaderProps) {
  const { user, setUserRole } = useAuthContext();
  const avatar = user?.profile?.avatar || user?.avatar || '';
  const displayName = user?.profile?.nickname || user?.username || '用户';

  const handleSettings = () => {
    Taro.navigateTo({ url: paths.setting });
  };

  const handleProfileEdit = () => {
    Taro.navigateTo({ url: paths.webview(webPaths.myProfileEdit) });
  };

  const handleRoleSwitch = () => {
    Taro.showActionSheet({
      itemList: ['用户端', '商家端'],
      success: res => {
        if (res.tapIndex === 0) setUserRole('lessee');
        if (res.tapIndex === 1) setUserRole('lessor');
      },
    });
  };

  return (
    <View className="relative overflow-hidden px-4 pt-6 pb-5 mb-2 rounded-b-3xl bg-gradient-to-br from-blue-500 to-blue-700">
      {/* 装饰背景 */}
      <View className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10" />
      <View
        className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/8"
        style={{ pointerEvents: 'none' }}
      />

      <View className="relative z-10 flex flex-row items-start justify-between">
        <View className="flex flex-row items-center flex-1 min-w-0">
          <View className="relative flex-shrink-0">
            <Image
              src={avatar}
              className="w-16 h-16 rounded-full border-3 border-white bg-blue-100"
              mode="aspectFill"
            />
            {user?.verificationStatus === 'verified' && (
              <View className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white">
                <Text className="text-white text-xs">✓</Text>
              </View>
            )}
          </View>
          <View className="ml-3 flex-1 min-w-0">
            <View className="flex flex-row items-center gap-2">
              <Text className="text-white font-bold text-lg truncate">{displayName}</Text>
              {/* {isEnterpriseVerified && (
                <View className="px-1.5 py-0.5 rounded bg-white/20">
                  <Text className="text-white text-xs font-medium">企业</Text>
                </View>
              )} */}
            </View>
            <View className="flex flex-row items-center gap-1 mt-1">
              <Text className="text-amber-300 text-sm">★</Text>
              <Text className="text-white/90 text-sm">信用分 {creditAccount?.creditScore || '--'}</Text>
            </View>
          </View>
        </View>

        <View className="flex flex-row items-center gap-1">
          {role === 'lessor' && (
            <View
              className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center"
              hoverClass="opacity-80"
              onClick={() => {
                Taro.navigateTo({
                  url: paths.webview(webPaths.myShopCode),
                });
              }}
            >
              <MyIcon name="IconQrcode" size={24} color="white" />
            </View>
          )}
          <View
            className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center"
            hoverClass="opacity-80"
            onClick={handleSettings}
          >
            <MyIcon name="IconSettingFilled" size={24} color="white" />
          </View>
        </View>
      </View>

      <View className="flex flex-row items-center gap-1 mt-4">
        <View
          className="px-3 py-2 rounded-xl bg-white/15 self-start flex flex-row items-center gap-1"
          hoverClass="opacity-90"
          onClick={handleProfileEdit}
        >
          <Text className="text-white text-xs">✏️</Text>
          <Text className="text-white text-sm">编辑资料</Text>
        </View>

        <View
          className="px-3 py-2 rounded-xl bg-white/15 self-start flex flex-row items-center gap-1"
          hoverClass="opacity-90"
          onClick={handleRoleSwitch}
        >
          <Text className="text-white text-sm">{role === 'lessor' ? '商家端' : '用户端'}</Text>
          <Text className="text-white text-xs">▼</Text>
        </View>
      </View>
    </View>
  );
}
