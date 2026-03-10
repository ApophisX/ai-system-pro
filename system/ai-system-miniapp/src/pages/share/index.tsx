import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Button,
  Swiper,
  SwiperItem,
} from "@tarojs/components";
import Taro, { usePullDownRefresh } from "@tarojs/taro";
import "./index.less";
import { paths } from "@/route/paths";

// 模拟跑马灯数据
const RECORD_LIST = [
  { user: "张**", action: "邀请成功", money: "20.00" },
  { user: "李**", action: "获得返现", money: "15.00" },
  { user: "王**", action: "邀请成功", money: "20.00" },
  { user: "赵**", action: "提现成功", money: "100.00" },
];

const SharePage = () => {
  const [code] = useState("8866AA"); // 邀请码
  const [balance, setBalance] = useState(0); // 动态数字状态

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });
  // 模拟进入页面时的数字滚动效果
  useEffect(() => {
    const targetAmount = 286.5;
    let start = 0;
    const duration = 1000;
    const step = 20;
    const increment = targetAmount / (duration / step);

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetAmount) {
        setBalance(targetAmount);
        clearInterval(timer);
      } else {
        setBalance(start);
      }
    }, step);

    return () => clearInterval(timer);
  }, []);

  // 复制邀请码
  const handleCopy = () => {
    Taro.setClipboardData({
      data: code,
      success: () => Taro.showToast({ title: "邀请码已复制", icon: "none" }),
    });
  };

  // 生成海报（这里模拟逻辑，实际需调用 Canvas API 或 Taro-Painter）
  const handleSavePoster = () => {
    Taro.showLoading({ title: "正在生成海报..." });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: "已保存到相册", icon: "success" });
    }, 1500);
  };

  return (
    <View className="min-h-screen bg-gold-gradient relative overflow-hidden flex flex-col">
      {/* 背景装饰元素 (金币/光斑) */}
      <View className="absolute top-10 left-10 text-6xl opacity-20 animate-float">
        💰
      </View>
      <View className="absolute top-40 right-10 text-4xl opacity-20 animate-float-delay">
        🎁
      </View>
      <View className="absolute bottom-20 left-20 text-5xl opacity-20 animate-float">
        🧧
      </View>

      {/* 1. 顶部收益展示区 */}
      <View className="pt-12 px-6 text-white text-center z-10 entrance-anim">
        <Text className="text-sm opacity-80 tracking-widest">
          累计收益 (元)
        </Text>
        <View className="flex items-baseline justify-center mt-2">
          <Text className="text-2xl font-bold mr-1">¥</Text>
          {/* 数字格式化：保留2位小数 */}
          <Text className="text-6xl font-bold font-mono">
            {balance.toFixed(2)}
          </Text>
        </View>

        <View
          className="mt-4 bg-white text-orange-500 bg-opacity-20 backdrop-blur-md inline-flex items-center px-4 py-1.5 rounded-full text-sm active:bg-opacity-30"
          onClick={() => Taro.navigateTo({ url: paths.wallet.withdraw })}
        >
          <Text>立即提现</Text>
          <Text className="ml-1 text-xs">{">"}</Text>
        </View>
      </View>

      {/* 2. 核心卡片区 */}
      <View className="flex-1 px-4 mt-8 z-10 pb-safe">
        <View className="bg-white rounded-3xl shadow-2xl overflow-hidden relative">
          {/* 顶部红色装饰条 */}
          <View className="h-3 bg-gradient-to-r from-orange-400 to-red-500 w-full"></View>

          <View className="p-6 flex flex-col items-center">
            <Text className="text-gray-500 text-sm font-bold mb-6 tracking-wide">
              —— 您的专属分享码 ——
            </Text>

            {/* 邀请码展示块 */}
            <View className="bg-orange-50 w-full rounded-2xl p-6 flex flex-col items-center border border-orange-100 relative mb-8">
              <Text className="text-gray-400 text-xs mb-2">
                点击下方号码复制
              </Text>

              <View className="flex flex-row items-center">
                <Text
                  className="flex-1 text-5xl font-mono font-bold text-gray-800 tracking-widest active:opacity-60 transition-opacity"
                  onClick={handleCopy}
                >
                  {code}
                </Text>
                {/* 复制按钮 */}
                <View
                  className="ml-4 bg-white text-orange-500 bg-opacity-20 backdrop-blur-md flex flex-row w-16 justify-center items-center py-1.5 rounded-full text-xs active:bg-opacity-30"
                  onClick={handleCopy}
                >
                  <Text>复制</Text>
                  <Text className="ml-1 text-xs">{">"}</Text>
                </View>
              </View>
            </View>

            {/* 二维码区域 */}
            <View className="flex items-center justify-between w-full mb-8">
              <View className="flex-1 pr-4">
                <Text className="text-lg font-bold text-gray-800 mb-1">
                  邀请好友扫码
                </Text>
                <Text className="text-xs text-gray-500 leading-relaxed">
                  好友扫码下单成功后，您将获得{" "}
                  <Text className="text-red-500 font-bold">5%</Text>{" "}
                  的现金返利。
                </Text>
              </View>
              <View className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {/* 实际项目中替换为真实二维码图片 */}
                <Image
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example"
                  className="w-full h-full"
                />
              </View>
            </View>

            {/* 按钮组 */}
            <View className="w-full flex gap-4">
              <View
                className="flex-1 bg-orange-100 text-orange-600 font-bold rounded-full border-0 text-base py-5 flex items-center justify-center active:bg-orange-200"
                onClick={handleSavePoster}
              >
                保存海报
              </View>
              <Button
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full border-0 text-base py-5 flex items-center justify-center shadow-lg active:opacity-90"
                openType="share"
              >
                立即分享
              </Button>
            </View>
          </View>

          {/* 3. 玩法步骤 (放在卡片底部灰色区) */}
          <View className="bg-gray-50 p-5 border-t border-gray-100">
            <View className="flex justify-between items-center relative">
              {/* 连接线 */}
              <View className="absolute top-1/3 left-10 right-10 h-0.5 bg-gray-200 -z-0"></View>

              {["分享给好友", "好友下单", "获得佣金"].map((step, index) => (
                <View
                  key={index}
                  className="flex flex-col items-center z-10 bg-gray-50 px-1"
                >
                  <View className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-xs font-bold mb-2 border-2 border-white shadow-sm">
                    {index + 1}
                  </View>
                  <Text className="text-xs text-gray-500">{step}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 4. 底部动态跑马灯 (增加信任感) */}
        <View className="mt-6 mb-8 bg-black bg-opacity-20 rounded-full px-4 py-2 flex items-center marquee-container h-10 overflow-hidden relative">
          <View className="w-full h-full relative">
            {/* 使用 Swiper 或者 CSS 动画做上下滚动 */}
            <Swiper
              className="h-full w-full"
              vertical
              autoplay
              circular
              interval={2000}
              duration={500}
            >
              {RECORD_LIST.map((item, idx) => (
                <SwiperItem
                  key={idx}
                  className="flex items-center justify-center"
                >
                  <Text className="text-white text-xs opacity-90">
                    🎉 用户 {item.user} {item.action}{" "}
                    <Text className="text-yellow-300 font-bold">
                      +{item.money}元
                    </Text>
                  </Text>
                </SwiperItem>
              ))}
            </Swiper>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SharePage;
