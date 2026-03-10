import React, { useState } from "react";
import { View, Text, Button, Switch } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import "../goods/index.less";

const CheckoutPage = () => {
  const router = useRouter();
  // 获取参数 type='points' | 'money'
  const { type, points, price } = router.params as any;

  const [address, setAddress] = useState({
    name: "张建国",
    phone: "138****8888",
    detail: "北京市朝阳区阳光100小区 3号楼 201",
  });

  const isPoints = type === "points";
  const finalPrice = isPoints ? `${points} 积分` : `¥ ${price}`;

  const handleSubmit = () => {
    Taro.showLoading({ title: "正在提交..." });
    setTimeout(() => {
      Taro.hideLoading();
      // 跳转到订单列表，并传递状态
      Taro.redirectTo({ url: "/pages/mall/orders?status=pending" });
    }, 1500);
  };

  const chooseAddress = () => {
    // 调用微信地址
    // Taro.chooseAddress()...
  };

  return (
    <View className="min-h-screen bg-gray-50 p-4 pb-24">
      {/* 1. 地址栏 */}
      <View
        className="bg-white rounded-xl p-4 mb-4 flex items-center justify-between shadow-sm active:bg-gray-50 transition-colors"
        onClick={chooseAddress}
      >
        <View className="flex items-center">
          <View className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mr-3 text-lg">
            📍
          </View>
          <View>
            <View className="flex items-center mb-1">
              <Text className="font-bold text-lg mr-2">{address.name}</Text>
              <Text className="text-gray-500 text-sm">{address.phone}</Text>
            </View>
            <Text className="text-gray-800 text-sm leading-snug pr-4">
              {address.detail}
            </Text>
          </View>
        </View>
        <Text className="text-gray-300">{">"}</Text>
      </View>

      {/* 2. 商品卡片 */}
      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <Text className="font-bold text-sm mb-3 block">订单详情</Text>
        <View className="flex">
          <View className="w-20 h-20 bg-gray-100 rounded-lg mr-3 flex-shrink-0"></View>
          <View className="flex-1 flex flex-col justify-between py-1">
            <Text className="text-sm font-bold text-gray-800 line-clamp-2">
              高端定制居家理疗套餐
            </Text>
            <View className="flex justify-between items-center">
              <Text className="text-gray-500 text-xs">x 1</Text>
              <Text className="text-orange-600 font-bold">{finalPrice}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3. 结算明细 */}
      <View className="bg-white rounded-xl p-4 shadow-sm">
        <View className="flex justify-between mb-2">
          <Text className="text-gray-500 text-sm">商品总计</Text>
          <Text className="text-gray-800 text-sm font-bold">{finalPrice}</Text>
        </View>
        <View className="flex justify-between mb-4">
          <Text className="text-gray-500 text-sm">运费</Text>
          <Text className="text-gray-800 text-sm">免运费</Text>
        </View>
        <View className="border-t border-gray-100 pt-3 flex justify-between items-center">
          <Text className="font-bold text-base">实付</Text>
          <Text className="text-xl font-bold text-orange-600">
            {finalPrice}
          </Text>
        </View>
      </View>

      {/* 底部提交栏 */}
      <View className="fixed bottom-0 left-0 w-full bg-white bottom-action-bar px-4 py-3 border-t border-gray-100 flex items-center justify-between z-50">
        <View className="flex items-baseline">
          <Text className="text-sm text-gray-500 mr-2">合计:</Text>
          <Text className="text-xl font-bold text-orange-600">
            {finalPrice}
          </Text>
        </View>
        <Button
          className="m-0 bg-gray-900 text-white rounded-full px-8 py-2 text-base font-bold shadow-lg active:scale-95"
          onClick={handleSubmit}
        >
          {isPoints ? "确认兑换" : "立即支付"}
        </Button>
      </View>
    </View>
  );
};

export default CheckoutPage;
