import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.less";

// 模拟充值套餐
const TOPUP_PACKAGES = [
  { id: 1, price: 1000, gift: 100, badge: "入门首选" },
  { id: 2, price: 3000, gift: 400, badge: "超高性价比", recommend: true },
  { id: 3, price: 5000, gift: 800, badge: "尊贵专享" },
];

const WalletPage = () => {
  const [balance, setBalance] = useState(0);
  const [selectedPkg, setSelectedPkg] = useState(2); // 默认选中推荐

  // 数字滚动效果 (Count Up)
  useEffect(() => {
    let start = 0;
    const end = 2866.5;
    const duration = 1500;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setBalance(end);
        clearInterval(timer);
      } else {
        setBalance(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const handleTopUp = () => {
    Taro.showLoading({ title: "正在加密通道..." });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: "充值成功", icon: "success" });
    }, 1500);
  };

  return (
    <View className="min-h-screen bg-web3-gradient text-white flex flex-col relative overflow-hidden">
      {/* 背景装饰球 (3D Elements) */}
      <View className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-30 animate-pulse" />
      <View className="absolute top-40 -left-20 w-48 h-48 bg-orange-500 rounded-full blur-[80px] opacity-20" />

      {/* 顶部导航 */}
      <View className="pt-12 px-6 flex justify-between items-center z-10">
        <Text className="text-lg font-bold tracking-wide">My Assets</Text>
        <View className="bg-white bg-opacity-10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
          <Text className="text-xs text-gray-300">安全保护中 🔒</Text>
        </View>
      </View>

      <ScrollView scrollY className="flex-1 z-10">
        <View className="p-6 pb-32">
          {/* 1. 核心资产卡片 (The "Black Card") */}
          <View className="card-holographic rounded-3xl p-6 mb-8 relative animate-float">
            {/* 卡面内容 */}
            <View className="flex justify-between items-start mb-8">
              <View>
                <Text className="text-gray-400 text-xs tracking-widest uppercase mb-1">
                  Total Balance
                </Text>
                <Text className="text-gray-500 text-xs">当前可用余额</Text>
              </View>
              {/* 模拟芯片 */}
              <View className="w-10 h-8 bg-gradient-to-br from-yellow-200 to-yellow-600 rounded opacity-80 flex items-center justify-center border border-yellow-300/50">
                <View className="w-8 h-px bg-black/20 mb-1"></View>
                <View className="w-8 h-px bg-black/20 mb-1"></View>
                <View className="w-8 h-px bg-black/20"></View>
              </View>
            </View>

            {/* 余额大数字 */}
            <View className="flex items-baseline mb-8">
              <Text className="text-3xl font-bold mr-2 text-metallic-gold">
                ¥
              </Text>
              <Text className="text-6xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-lg">
                {balance.toFixed(2)}
              </Text>
            </View>

            <View className="flex justify-between items-end">
              <View className="flex items-center space-x-2">
                <View className="px-2 py-0.5 rounded bg-gradient-to-r from-yellow-600 to-yellow-800 text-xs font-bold shadow-lg">
                  VIP LEVEL 3
                </View>
                <Text className="text-xs text-gray-400 font-mono">
                  **** 8866
                </Text>
              </View>
              <Text className="text-xs text-metallic-gold font-bold tracking-wider">
                PREMIUM MEMBER
              </Text>
            </View>
          </View>

          {/* 2. 功能按钮区 (Glassmorphism) */}
          <View className="grid grid-cols-4 gap-4 mb-10">
            {[
              { icon: "💎", label: "会员权益" },
              { icon: "📜", label: "账单明细" },
              { icon: "🎁", label: "积分兑换" },
              { icon: "🛡️", label: "安全设置" },
            ].map((item, idx) => (
              <View
                key={idx}
                className="flex flex-col items-center group active:scale-95 transition-transform"
              >
                <View className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center text-2xl mb-2 shadow-lg group-active:bg-white/10">
                  {item.icon}
                </View>
                <Text className="text-xs text-gray-300">{item.label}</Text>
              </View>
            ))}
          </View>

          {/* 3. 充值套餐 (Value Injection) */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-white mb-4 block flex items-center">
              <Text className="mr-2">⚡️</Text>
              <Text>极速充值</Text>
              <Text className="text-xs text-gray-500 ml-2 font-normal">
                限时赠送高额返利
              </Text>
            </Text>

            <ScrollView
              scrollX
              className="whitespace-nowrap pb-4"
              showScrollbar={false}
            >
              {TOPUP_PACKAGES.map((item) => (
                <View
                  key={item.id}
                  onClick={() => setSelectedPkg(item.id)}
                  className={`
                    inline-block w-40 p-4 rounded-2xl mr-4 relative transition-all duration-300 border
                    ${
                      selectedPkg === item.id
                        ? "bg-gradient-to-b from-orange-500 to-red-600 border-orange-400  shadow-[0_0_20px_rgba(234,88,12,0.4)]"
                        : "glass-panel border-white/5 bg-opacity-20"
                    }
                  `}
                >
                  {/* 推荐标签 */}
                  {/* {item.recommend && (
                    <View className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
                      超值推荐
                    </View>
                  )} */}

                  <View className="flex flex-col items-center">
                    <Text
                      className={`text-xl font-bold font-mono mb-1 ${
                        selectedPkg === item.id ? "text-white" : "text-gray-200"
                      }`}
                    >
                      ¥{item.price}
                    </Text>
                    <Text
                      className={`text-xs mb-3 ${
                        selectedPkg === item.id
                          ? "text-orange-100"
                          : "text-gray-400"
                      }`}
                    >
                      送 ¥{item.gift}
                    </Text>
                    <View
                      className={`h-[1px] w-full mb-3 ${
                        selectedPkg === item.id
                          ? "bg-orange-400"
                          : "bg-gray-600"
                      }`}
                    />
                    <Text
                      className={`text-xs ${
                        selectedPkg === item.id ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {item.badge}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 4. 购买力展示 (锚定价值) */}
          <View className="glass-panel rounded-2xl p-4">
            <View className="flex justify-between items-center mb-3">
              <Text className="text-sm font-bold text-gray-200">
                余额可享服务
              </Text>
              <Text className="text-xs text-orange-400">去使用 👉</Text>
            </View>
            <View className="flex justify-between">
              {[
                { name: "10次助浴", val: "性价比" },
                { name: "全天陪护", val: "最热销" },
                { name: "中医理疗", val: "高价值" },
              ].map((service, i) => (
                <View
                  key={i}
                  className="flex flex-col items-center w-1/3 border-r border-white/5 last:border-0"
                >
                  <View className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-lg mb-1 shadow-inner">
                    ✨
                  </View>
                  <Text className="text-xs text-gray-300 mt-1">
                    {service.name}
                  </Text>
                  <Text className="text-xs text-gray-500">{service.val}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 底部悬浮充值按钮 */}
      <View className="absolute bottom-0 w-full p-6 pb-safe bg-gradient-to-t from-slate-900 to-transparent z-20">
        <Button
          className="w-full h-14 rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-bold text-lg shadow-[0_4px_20px_rgba(234,88,12,0.5)] flex items-center justify-center active:scale-98 transition-transform"
          onClick={handleTopUp}
        >
          立即充值 (到账 ¥
          {TOPUP_PACKAGES.find((p) => p.id === selectedPkg)?.price! +
            TOPUP_PACKAGES.find((p) => p.id === selectedPkg)?.gift!}
          )
        </Button>
      </View>
    </View>
  );
};

export default WalletPage;
