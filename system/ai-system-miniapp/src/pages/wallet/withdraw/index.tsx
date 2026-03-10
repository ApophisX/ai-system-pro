import React, { useEffect, useState } from "react";
import { View, Text, Button } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import "./index.less";

const WithdrawResult = () => {
  const router = useRouter();
  const amount = router.params.amount || "0.00";
  const [step, setStep] = useState(1); // 1: 提交, 2: 处理中, 3: 到账

  // 模拟一个进度条动画
  useEffect(() => {
    setTimeout(() => setStep(2), 800);
  }, []);

  const handleFinish = () => {
    // 返回个人中心或钱包首页
    Taro.navigateBack();
  };

  return (
    <View className="min-h-screen bg-gray-50 pt-10 px-6 flex flex-col items-center">
      {/* 成功图标动画 */}
      <View className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-green-200 shadow-xl success-icon-bg">
        <svg
          width="40"
          height="40"
          viewBox="0 0 100 100"
          className="success-check"
        >
          <path
            d="M20 50 L40 70 L80 30"
            fill="none"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </View>

      <Text className="text-2xl font-bold text-gray-800 mb-2">
        提现申请已提交
      </Text>
      <Text className="text-gray-400 text-sm mb-8">请耐心等待银行处理</Text>

      {/* 票据式详情卡片 */}
      <View className="w-full bg-white rounded-t-2xl receipt-edge shadow-sm p-6 mb-8 relative">
        <View className="border-b border-dashed border-gray-200 pb-6 mb-6 flex flex-col items-center">
          <Text className="text-gray-400 text-xs mb-1">提现金额</Text>
          <Text className="text-4xl font-mono font-bold text-gray-900">
            ¥ {amount}
          </Text>
        </View>

        {/* 进度时间轴 */}
        <View className="relative pl-4 space-y-8">
          {/* 进度线 */}
          <View className="absolute left-1.5 top-2 bottom-6 w-0.5 bg-gray-100"></View>

          {/* 步骤1 */}
          <View className="relative flex items-start">
            <View className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm z-10 mr-4 mt-1.5"></View>
            <View>
              <Text className="block text-gray-800 font-bold text-sm">
                发起提现申请
              </Text>
              <Text className="block text-gray-400 text-xs mt-0.5">
                今天 {new Date().getHours()}:{new Date().getMinutes()}
              </Text>
            </View>
          </View>

          {/* 步骤2 */}
          <View className="relative flex items-start">
            <View
              className={`w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 mr-4 mt-1.5 transition-colors duration-500 ${
                step >= 2 ? "bg-green-500" : "bg-gray-300"
              }`}
            ></View>
            <View>
              <Text
                className={`block font-bold text-sm ${
                  step >= 2 ? "text-gray-800" : "text-gray-400"
                }`}
              >
                银行处理中
              </Text>
              <Text className="block text-gray-400 text-xs mt-0.5">
                预计 2 小时内
              </Text>
            </View>
          </View>

          {/* 步骤3 */}
          <View className="relative flex items-start">
            <View className="w-3 h-3 bg-gray-300 rounded-full border-2 border-white shadow-sm z-10 mr-4 mt-1.5"></View>
            <View>
              <Text className="block text-gray-400 font-bold text-sm">
                预计到账
              </Text>
              <Text className="block text-gray-400 text-xs mt-0.5">
                微信钱包
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Button
        className="w-full bg-white text-gray-700 border border-gray-200 font-bold rounded-full h-11"
        onClick={handleFinish}
      >
        完成
      </Button>
    </View>
  );
};

export default WithdrawResult;
