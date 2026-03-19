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
      <Text>Home</Text>
    </View>
  );
}
