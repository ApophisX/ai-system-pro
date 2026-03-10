import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Button,
  Map,
  BaseEventOrig,
  MapProps,
} from "@tarojs/components";
import Taro, {
  usePullDownRefresh,
  makePhoneCall,
  setClipboardData,
} from "@tarojs/taro";
import "./index.less";
import { BottomSafeView } from "@/components/bottom-safe";
import { AppLocation } from "@/model/location";
import MyIcon from "@/components/my-icon";
import * as Icons from "@/icons";
import icnoLocation from "src/icons/icon-location-filled.svg";

// 模拟图标
const ICONS = {
  copy: "📄", // 复制图标
  phone: "📞", // 电话图标
  map: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=600&h=200&fit=crop", // 模拟地图截图
  staff:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop", // 陪诊师头像
  qr: "🏁", // 核销码图标
};

export default function OrderDetail() {
  const [location] = useState(new AppLocation());

  // 模拟订单数据
  // 可修改 status 为: 'pending', 'processing', 'completed', 'cancelled' 来查看不同效果
  const [order, setOrder] = useState({
    id: "ORD-20231225-883721",
    status: "pending",
    createTime: "2023-12-25 09:00:00",
    service: {
      title: "三甲医院全程陪诊 (4小时)",
      price: 298.0,
      image:
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&h=200&fit=crop",
      hospital: "上海瑞金医院",
      dept: "心血管内科",
      time: "2023-12-26 08:30",
    },
    elder: {
      name: "张建国",
      phone: "138****1234",
      condition: "行动自如",
    },
    staff: {
      name: "王护工",
      phone: "13988887777",
      rate: 4.9,
      orders: 128,
      image:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    },
    timeline: [
      { time: "12-25 09:00", title: "订单已创建", desc: "等待用户支付" },
      { time: "12-25 09:05", title: "支付成功", desc: "系统正在为您派单" },
    ],
  });

  // 倒计时逻辑
  const [timeLeft, setTimeLeft] = useState(900); // 剩余15分钟秒数

  useEffect(() => {
    if (order.status === "pending" && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [order.status, timeLeft]);

  // 格式化倒计时 MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // 下拉刷新
  usePullDownRefresh(() => {
    // 模拟刷新数据
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: "已更新", icon: "none" });
    }, 1000);
  });

  // 复制订单号
  const handleCopy = () => {
    setClipboardData({ data: order.id });
  };

  // 打电话
  const handleCall = (phone) => {
    makePhoneCall({ phoneNumber: phone });
  };

  // --- 渲染组件 ---

  // 1. 动态头部渲染
  const renderHeader = () => {
    switch (order.status) {
      case "pending":
        return (
          <View className="bg-gradient-to-r from-orange-500 to-red-500 pt-6 pb-16 px-6 text-white relative">
            <View className="flex justify-between items-center z-10 relative">
              <View>
                <Text className="text-2xl font-bold block mb-1">等待支付</Text>
                <Text className="text-orange-100 text-sm">
                  剩余 {formatTime(timeLeft)} 自动关闭
                </Text>
              </View>
              <View className="bg-white/20 px-3 py-1 rounded text-white text-xs number-tick">
                需付 ¥{order.service.price}
              </View>
            </View>
            <View className="header-wave" />
          </View>
        );
      case "processing":
        return (
          <View className="bg-gradient-to-r from-teal-600 to-teal-500 pt-6 pb-16 px-6 text-white relative">
            <View className="flex justify-between items-center z-10 relative">
              <View>
                <Text className="text-2xl font-bold block mb-1">
                  服务进行中
                </Text>
                <Text className="text-teal-100 text-sm">
                  陪诊师已到达指定地点
                </Text>
              </View>
              <View className="text-4xl opacity-80">🏃</View>
            </View>
            <View className="header-wave" />
          </View>
        );
      case "completed":
        return (
          <View className="bg-gradient-to-r from-gray-700 to-gray-600 pt-6 pb-16 px-6 text-white relative">
            <View className="flex justify-between items-center z-10 relative">
              <View>
                <Text className="text-2xl font-bold block mb-1">
                  服务已完成
                </Text>
                <Text className="text-gray-300 text-sm">感谢您的信任</Text>
              </View>
              <View className="text-4xl">🎉</View>
            </View>
            <View className="header-wave" />
          </View>
        );
      default: // cancelled
        return (
          <View className="bg-gray-200 pt-6 pb-10 px-6 text-gray-500 relative">
            <Text className="text-2xl font-bold block mb-1">已取消</Text>
            <Text className="text-sm">期待下次为您服务</Text>
            <View className="header-wave" />
          </View>
        );
    }
  };

  return (
    <View className="min-h-screen bg-gray-50 pb-40">
      {/* 顶部状态栏 */}
      {renderHeader()}

      <View className="px-4 -mt-10 relative z-10 space-y-4">
        {/* 2. 地图/位置卡片 (仅进行中或待服务显示) */}
        {["processing", "pending"].includes(order.status) && (
          <View className="bg-white rounded-xl overflow-hidden shadow-sm animate-fade-in">
            <View className="w-full h-44">
              <Map
                className="w-full h-full"
                longitude={location.longitude}
                latitude={location.latitude}
                markers={[
                  {
                    id: 1,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    width: 32,
                    height: 32,
                    iconPath: Icons.IconLocationFilled,
                    title: location.fullAddress,
                  },
                ]}
                onError={(event: BaseEventOrig<MapProps.point>) => {
                  console.log(event);
                }}
              />
            </View>
            <View className="p-3 flex items-center justify-between">
              <View className="flex items-center">
                <MyIcon name="IconLocationFilled" />
                <View>
                  <Text className="text-gray-800 font-bold text-sm block">
                    {order.service.hospital}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {order.service.dept} · {order.service.time}
                  </Text>
                </View>
              </View>
              <View
                className="bg-teal-50 px-4 py-1.5 rounded-full text-teal-600 text-xs font-bold"
                onClick={() => {
                  Taro.openLocation({
                    latitude: location.latitude,
                    longitude: location.longitude,
                  });
                }}
              >
                导航
              </View>
            </View>
          </View>
        )}

        {/* 3. 陪诊师信息 (服务人员已接单时显示) */}
        {(order.status === "processing" || order.status === "completed") && (
          <View className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between animate-fade-in">
            <View className="flex items-center">
              <Image
                src={order.staff.image || ICONS.staff}
                className="w-12 h-12 rounded-full bg-gray-200"
              />
              <View className="ml-3">
                <View className="flex items-center">
                  <Text className="font-bold text-gray-800">
                    {order.staff.name}
                  </Text>
                  <Text className="text-xs bg-orange-100 text-orange-600 px-1 ml-2 rounded">
                    金牌陪诊
                  </Text>
                </View>
                <Text className="text-xs text-gray-400 mt-0.5">
                  ⭐ {order.staff.rate} | 服务 {order.staff.orders}单
                </Text>
              </View>
            </View>
            <View className="flex space-x-3">
              <View
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200"
                onClick={() => console.log("发消息")}
              >
                <Text>💬</Text>
              </View>
              <View
                className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center active:bg-teal-200"
                onClick={() => handleCall(order.staff.phone)}
              >
                <Text>{ICONS.phone}</Text>
              </View>
            </View>
          </View>
        )}

        {order.status === "processing" && (
          <View className="bg-white rounded-xl p-6 shadow-sm flex flex-col items-center animate-fade-in">
            <Text className="text-gray-500 text-xs mb-4">
              请出示此码给服务人员扫码核销
            </Text>

            {/* 二维码图片区域 */}
            <View
              className="p-2 border border-gray-100 rounded-lg mb-4 shadow-inner"
              onClick={() => {
                // 点击放大预览二维码，方便老人在光线不好时展示
                Taro.previewImage({
                  urls: [
                    `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=88291033`,
                  ],
                });
              }}
            >
              {/* 这里使用了免费的公共 API 生成二维码用于演示 */}
              {/* 生产环境建议替换为后端返回的图片 URL 或使用 canvas 本地生成 */}
              <Image
                src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=88291033"
                className="w-40 h-40 block"
                showMenuByLongpress // 允许长按识别
              />
            </View>

            {/* 数字码 - 增加字间距方便阅读 */}
            <View className="bg-gray-50 px-8 py-2 rounded-full border border-gray-100">
              <Text className="text-2xl font-mono font-bold text-gray-800 tracking-[0.2em]">
                8829 1033
              </Text>
            </View>

            <Text className="text-gray-300 text-xs mt-2">点击二维码可放大</Text>
          </View>
        )}

        {/* 5. 订单服务详情 */}
        <View className="bg-white rounded-xl p-4 shadow-sm animate-fade-in">
          <Text className="font-bold text-gray-800 text-base mb-3 block">
            服务详情
          </Text>

          {/* 商品卡片 */}
          <View className="flex mb-4 bg-gray-50 p-2 rounded-lg">
            <Image
              src={order.service.image}
              className="w-16 h-16 rounded bg-gray-200 object-cover"
            />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-bold text-gray-800 block">
                {order.service.title}
              </Text>
              <View className="flex justify-between mt-2 items-center">
                <Text className="text-xs text-gray-500">
                  服务对象：{order.elder.name}
                </Text>
                <Text className="text-sm font-bold text-gray-800">
                  ¥{order.service.price}
                </Text>
              </View>
            </View>
          </View>

          {/* 详细列表 */}
          <View className="space-y-3 text-sm">
            <View className="flex justify-between">
              <Text className="text-gray-500">服务时间</Text>
              <Text className="text-gray-800">{order.service.time}</Text>
            </View>
            <View className="flex justify-between">
              <Text className="text-gray-500">服务地点</Text>
              <Text className="text-gray-800 max-w-[70%] text-right truncate">
                {order.service.hospital}
              </Text>
            </View>
            <View className="flex justify-between">
              <Text className="text-gray-500">联系电话</Text>
              <View className="flex items-center" onClick={() => handleCopy()}>
                <Text className="text-gray-800 mr-1">{order.elder.phone}</Text>
                <Text className="text-xs text-blue-500">复制</Text>
              </View>
            </View>
            <View className="flex justify-between">
              <Text className="text-gray-500">特殊备注</Text>
              <Text className="text-gray-800">无</Text>
            </View>
          </View>
        </View>

        {/* 6. 订单信息 (ID, 时间) */}
        <View className="bg-white rounded-xl p-4 shadow-sm animate-fade-in space-y-2">
          <View className="flex justify-between items-center">
            <Text className="text-xs text-gray-500">订单编号</Text>
            <View className="flex items-center" onClick={handleCopy}>
              <Text className="text-xs text-gray-800 mr-1">{order.id}</Text>
              <Text className="text-xs text-blue-500">复制</Text>
            </View>
          </View>
          <View className="flex justify-between items-center">
            <Text className="text-xs text-gray-500">创建时间</Text>
            <Text className="text-xs text-gray-800">{order.createTime}</Text>
          </View>
        </View>

        {/* 7. 服务进度轴 (Timeline) */}
        <View className="bg-white rounded-xl p-4 shadow-sm animate-fade-in mb-6">
          <Text className="font-bold text-gray-800 text-base mb-4 block">
            订单进度
          </Text>
          <View className="pl-2">
            {order.timeline.map((item, index) => (
              <View
                key={index}
                className="relative pl-6 pb-6 timeline-item last:pb-0"
              >
                {/* 圆点 */}
                <View
                  className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 ${
                    index === 0
                      ? "bg-teal-600 border-teal-200"
                      : "bg-gray-300 border-gray-100"
                  }`}
                />
                {/* 连接线 - 在 less 中处理 */}
                <View className="timeline-line" />

                <View>
                  <Text
                    className={`text-sm font-bold block ${
                      index === 0 ? "text-gray-800" : "text-gray-500"
                    }`}
                  >
                    {item.title}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {item.desc}
                  </Text>
                  <Text className="text-xs text-gray-300 mt-1">
                    {item.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 8. 底部固定操作栏 (Action Bar) */}
      <View className="fixed bottom-0 left-0 w-full bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <View className="flex items-center justify-end px-4 py-3 space-x-3">
          {/* 这里的按钮逻辑需要非常全 */}

          {/* 通用按钮：联系客服 */}
          <View
            className="flex flex-col items-center mr-auto px-2 opacity-80"
            onClick={() => console.log("客服")}
          >
            <Text className="text-lg">🎧</Text>
            <Text className="text-xs text-gray-500">客服</Text>
          </View>

          <View className="flex items-center gap-3">
            {order.status === "pending" && (
              <>
                <Button
                  className="m-0 text-sm bg-white border border-gray-300 text-gray-600 rounded-full px-5 py-3 leading-none"
                  onClick={() => console.log("取消")}
                  style={{ borderWidth: 1, borderStyle: "solid" }}
                >
                  取消订单
                </Button>
                <Button
                  className="m-0 text-sm bg-teal-600 text-white border-none rounded-full px-5 py-3 leading-none shadow-lg shadow-teal-200"
                  onClick={() => console.log("支付")}
                >
                  立即支付
                </Button>
              </>
            )}

            {order.status === "processing" && (
              <>
                <Button
                  className="m-0 text-sm bg-white border border-gray-300 text-gray-600 rounded-full px-4 py-3 leading-none"
                  onClick={() => console.log("修改")}
                >
                  修改需求
                </Button>
                <Button
                  className="m-0 text-sm bg-teal-600 text-white border-none rounded-full px-6 py-3 leading-none"
                  onClick={() => console.log("确认完成")}
                >
                  确认完成
                </Button>
              </>
            )}

            {order.status === "completed" && (
              <>
                <Button
                  className="m-0 text-sm bg-white border border-gray-300 text-gray-600 rounded-full px-4 py-3 leading-none"
                  onClick={() => console.log("售后")}
                >
                  申请售后
                </Button>
                <Button
                  className="m-0 text-sm bg-white border border-teal-600 text-teal-600 rounded-full px-4 py-3 leading-none"
                  onClick={() => console.log("评价")}
                >
                  去评价
                </Button>
                <Button
                  className="m-0 text-sm bg-teal-600 text-white border-none rounded-full px-6 py-3 leading-none"
                  onClick={() => console.log("复购")}
                >
                  再来一单
                </Button>
              </>
            )}

            {order.status === "cancelled" && (
              <Button
                className="m-0 text-sm bg-white border border-gray-300 text-gray-600 rounded-full px-5 py-3 leading-none"
                onClick={() => console.log("删除")}
              >
                删除订单
              </Button>
            )}
          </View>
        </View>
        <BottomSafeView />
      </View>
    </View>
  );
}
