import { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.less';
import { paths } from '@/route/paths';

export default function Logout() {
  const [status, setStatus] = useState<'processing' | 'success'>('processing');
  const [progressText, setProgressText] = useState('正在退出登录...');

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // 步骤1: 调用退出登录 API
        setProgressText('正在退出登录...');
        await new Promise(resolve => setTimeout(resolve, 150));

        // try {
        //     await API.Auth.AuthControllerLogoutV1();
        // } catch (error) {
        //     // 如果 API 调用失败，继续执行本地清理
        //     console.warn("退出登录 API 调用失败，继续执行本地清理", error);
        // }

        // 步骤2: 清除本地存储
        setProgressText('正在清理数据...');
        await new Promise(resolve => setTimeout(resolve, 350));
        Taro.clearStorageSync();

        // 步骤3: 完成
        setProgressText('退出成功');
        setStatus('success');
        await new Promise(resolve => setTimeout(resolve, 150));

        // 步骤4: 跳转到登录页
        Taro.reLaunch({ url: paths.discover });
      } catch (error) {
        console.error('退出登录失败', error);
        // 即使出错也清除本地数据并跳转
        Taro.clearStorageSync();
        Taro.reLaunch({ url: paths.discover });
      }
    };
    handleLogout();
  }, []);

  return (
    <View className="min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden">
      {/* 背景装饰 */}
      <View className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-teal-50 via-teal-50/50 to-white -z-10" />
      <View className="absolute top-10 -right-20 w-60 h-60 bg-teal-100/40 rounded-full blur-3xl animate-pulse-slow" />
      <View className="absolute bottom-20 -left-10 w-48 h-48 bg-orange-100/40 rounded-full blur-3xl animate-pulse-slow delay-1000" />

      {/* 主要内容区域 */}
      <View className="flex flex-col items-center justify-center px-8 animate-fade-in">
        {/* 加载动画容器 */}
        <View className="relative w-32 h-32 mb-8">
          {/* 外层旋转圆环 */}
          <View className="absolute inset-0 rounded-full border-4 border-teal-200/30" />
          <View className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-500 animate-spin-slow" />

          {/* 中层旋转圆环（反向） */}
          <View className="absolute inset-2 rounded-full border-3 border-teal-100/50" />
          <View className="absolute inset-2 rounded-full border-3 border-transparent border-b-teal-400 animate-spin-reverse" />

          {/* 中心图标/文字 */}
          <View className="absolute inset-0 flex items-center justify-center">
            <View className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-teal-200/50 animate-pulse-gentle">
              <Text className="text-white text-2xl font-bold">✓</Text>
            </View>
          </View>

          {/* 状态指示点 */}
          <View className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            <View className="w-2 h-2 bg-teal-400 rounded-full animate-bounce-dot-1" />
            <View className="w-2 h-2 bg-teal-400 rounded-full animate-bounce-dot-2" />
            <View className="w-2 h-2 bg-teal-400 rounded-full animate-bounce-dot-3" />
          </View>
        </View>

        {/* 状态文字 */}
        <Text className="text-xl font-semibold text-gray-800 mb-2 animate-slide-up-text">
          {status === 'processing' ? '正在安全退出' : '退出成功'}
        </Text>
        <Text className="text-sm text-gray-500 text-center max-w-xs animate-slide-up-text delay-200">
          {progressText}
        </Text>

        {/* 进度指示条 */}
        {status === 'processing' && (
          <View className="mt-8 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
            <View className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full animate-progress-bar" />
          </View>
        )}
      </View>

      {/* 底部提示 */}
      <View className="absolute bottom-16 px-8 animate-fade-in delay-500">
        <Text className="text-xs text-gray-400 text-center">感谢您的使用，期待再次相见</Text>
      </View>
    </View>
  );
}
