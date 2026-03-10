import React from "react";
import { View, Text, Image, Button } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";

const CouponDetail = () => {
  const router = useRouter();
  // 实际开发中根据 router.params.id 获取详情

  return (
    <View className="min-h-screen bg-orange-500 p-4 flex flex-col items-center justify-center">
      <View className="w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* 顶部装饰 */}
        <View className="h-4 bg-orange-200 w-full"></View>

        <View className="p-8 flex flex-col items-center">
          <Text className="text-gray-500 text-sm mb-1">居家陪护专用券</Text>
          <View className="flex items-baseline text-orange-600 mb-6">
            <View className="text-2xl">¥</View>
            <View className="text-6xl font-bold">50</View>
          </View>

          {/* 分割线 */}
          <View className="w-full h-px bg-gray-200 relative mb-8">
            <View className="absolute -left-10 -top-3 w-6 h-6 bg-orange-500 rounded-full"></View>
            <View className="absolute -right-10 -top-3 w-6 h-6 bg-orange-500 rounded-full"></View>
          </View>

          {/* 规则详情 */}
          <View className="w-full space-y-3 mb-8">
            <View className="flex">
              <Text className="text-gray-400 w-20 text-sm">适用服务</Text>
              <Text className="text-gray-700 flex-1 text-sm">
                仅限居家陪护、老人助浴服务
              </Text>
            </View>
            <View className="flex">
              <Text className="text-gray-400 w-20 text-sm">有效期至</Text>
              <Text className="text-gray-700 flex-1 text-sm">
                2023-12-31 23:59:59
              </Text>
            </View>
            <View className="flex">
              <Text className="text-gray-400 w-20 text-sm">使用规则</Text>
              <Text className="text-gray-700 flex-1 text-sm">
                不可叠加，不可找零，仅限本人下单使用。
              </Text>
            </View>
          </View>

          <Button
            className="w-full bg-orange-500 text-white rounded-full shadow-lg"
            onClick={() => Taro.switchTab({ url: "/pages/index/index" })}
          >
            立即去下单使用
          </Button>
        </View>
      </View>

      <View
        className="mt-6 text-white text-opacity-80 text-sm"
        onClick={() => Taro.navigateBack()}
      >
        ✕ 关闭
      </View>
    </View>
  );
};

export default CouponDetail;
