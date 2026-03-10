/**
 * 快速租赁首页 - 扫一扫即刻拥有
 * 酷炫现代化 UI，TailwindCSS + 动画
 */

import { paths } from '@/route/paths';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useCallback } from 'react';
import MyIcon from '@/components/my-icon';
import './index.less';

export default function HomePage() {
  const [isTapping, setIsTapping] = useState(false);

  const handleScan = useCallback(() => {
    Taro.scanCode({
      success: result => {
        Taro.navigateTo({ url: paths.webview(`${APP_URL}${result.result}`) });
        console.log(result);
      },
    });
  }, []);

  return (
    <View
      className="min-h-screen flex flex-col overflow-hidden relative"
      style={{
        height: '100vh',
        background: 'linear-gradient(165deg, #0d9488 0%, #0f766e 35%, #115e59 70%, #134e4a 100%)',
      }}
    >
      {/* 装饰性光斑 */}
      <View
        className="orb-breathe absolute rounded-full"
        style={{
          width: '400rpx',
          height: '400rpx',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          top: '-100rpx',
          right: '-100rpx',
        }}
      />
      <View
        className="orb-breathe absolute rounded-full"
        style={{
          width: '300rpx',
          height: '300rpx',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          bottom: '200rpx',
          left: '-80rpx',
          animationDelay: '1s',
        }}
      />

      {/* 主内容区 */}
      <View className="flex-1 flex flex-col justify-center items-center px-12 relative z-10">
        {/* 标题区 */}
        <View className="text-center mb-16">
          <Text className="text-teal-100 text-base leading-relaxed">
            扫一扫资产二维码
            {'\n'}
            即刻拥有，无需等待
          </Text>
        </View>

        {/* 扫一扫主按钮 */}
        <View className="flex items-center justify-center mb-8" style={{ marginBottom: '80rpx' }}>
          <View
            className={`relative flex items-center justify-center ${isTapping ? 'tap-scale' : ''}`}
            onClick={handleScan}
            hoverClass="opacity-80"
            hoverStayTime={100}
            style={{ cursor: 'pointer' }}
          >
            {/* 外圈脉冲光晕 */}
            <View
              className="scan-pulse-ring absolute rounded-full bg-white"
              style={{
                width: '220rpx',
                height: '220rpx',
                opacity: 0.3,
              }}
            />
            <View
              className="scan-pulse-ring absolute rounded-full bg-white"
              style={{
                width: '220rpx',
                height: '220rpx',
                opacity: 0.2,
                animationDelay: '0.8s',
              }}
            />
            {/* 主按钮 */}
            <View
              className="rounded-full flex items-center justify-center shadow-2xl active:opacity-90"
              style={{
                width: '180rpx',
                height: '180rpx',
                background: 'linear-gradient(145deg, #ffffff 0%, #f0fdfa 100%)',
                boxShadow: '0 20rpx 60rpx rgba(0,0,0,0.25), 0 0 0 4rpx rgba(255,255,255,0.3)',
              }}
            >
              <View className="scan-icon-float">
                <MyIcon name="IconScanInventory" size={72} color="#0d9488" />
              </View>
            </View>
          </View>
        </View>

        {/* 引导文案 */}
        <Text className="text-teal-100/90 text-sm text-center mb-2">对准资产上的二维码</Text>
        <Text className="text-teal-200/70 text-xs text-center">秒速下单 · 灵活租期 · 随租随还</Text>

        {/* 底部快捷入口 */}
        {/* <View className="absolute bottom-16 left-0 right-0 flex justify-center gap-12">
          <View className="flex flex-col items-center" onClick={() => Taro.switchTab({ url: '/pages/discover/index' })}>
            <View
              className="rounded-full flex items-center justify-center mb-2"
              style={{
                width: '88rpx',
                height: '88rpx',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Text className="text-white text-2xl">🔍</Text>
            </View>
            <Text className="text-white/80 text-xs">发现好物</Text>
          </View>
          <View className="flex flex-col items-center" onClick={() => Taro.navigateTo({ url: paths.order.list })}>
            <View
              className="rounded-full flex items-center justify-center mb-2"
              style={{
                width: '88rpx',
                height: '88rpx',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Text className="text-white text-2xl">📋</Text>
            </View>
            <Text className="text-white/80 text-xs">我的订单</Text>
          </View>
        </View> */}
      </View>
    </View>
  );
}
