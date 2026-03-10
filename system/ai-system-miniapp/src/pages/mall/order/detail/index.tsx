import React, { useState, useEffect } from "react";
import { View, Text, Image, Button, ScrollView } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import "./index.less";

// 模拟订单状态类型
type OrderStatus =
  | "pending_pay"
  | "pending_ship"
  | "shipped"
  | "completed"
  | "cancelled";

const MallOrderDetail = () => {
  const router = useRouter();
  // 实际上应从 router.params.id 获取ID请求接口
  const [status, setStatus] = useState<OrderStatus>("shipped");
  const [loading, setLoading] = useState(false);

  // 模拟订单数据
  const [order, setOrder] = useState({
    id: "MALL202310248866",
    createTime: "2023-10-24 10:30:00",
    payTime: "2023-10-24 10:35:12",
    shipTime: "2023-10-25 09:00:00",
    totalPoints: 5000,
    totalPrice: 0, // 纯积分兑换
    freight: 0,
    address: {
      name: "张建国",
      phone: "138****8888",
      full: "北京市朝阳区阳光100小区 3号楼 2单元 201室",
    },
    products: [
      {
        id: 1,
        title: "高端定制居家理疗套餐",
        spec: "标准版",
        count: 1,
        points: 5000,
        price: 0,
        img: "https://via.placeholder.com/150",
      },
    ],
    logistics: {
      company: "顺丰速运",
      no: "SF1234567890",
      lastUpdate: "您的快件已到达【北京朝阳集散中心】，正在分配派送员...",
      time: "2023-10-26 08:30",
    },
  });

  // 下拉刷新逻辑
  const handleRefresh = () => {
    setLoading(true);
    // 模拟接口请求
    setTimeout(() => {
      setLoading(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: "刷新成功", icon: "none" });
    }, 1000);
  };

  Taro.usePullDownRefresh(handleRefresh);

  // 复制订单号
  const handleCopy = (text) => {
    Taro.setClipboardData({
      data: text,
      success: () => Taro.showToast({ title: "复制成功", icon: "none" }),
    });
  };

  // 拨打物流/客服电话
  const handleCall = () => {
    Taro.makePhoneCall({ phoneNumber: "400-888-6666" });
  };

  // 根据状态获取 UI 配置
  const getStatusConfig = (s: OrderStatus) => {
    switch (s) {
      case "pending_pay":
        return {
          bg: "bg-gradient-to-r from-red-500 to-orange-500",
          title: "等待付款",
          desc: "剩 14:59 自动关闭",
          icon: "⏰",
        };
      case "pending_ship":
        return {
          bg: "bg-gradient-to-r from-orange-400 to-yellow-500",
          title: "等待发货",
          desc: "商家正在打包中，请耐心等待",
          icon: "📦",
        };
      case "shipped":
        return {
          bg: "bg-gradient-to-r from-blue-500 to-cyan-400",
          title: "商家已发货",
          desc: "包裹正在飞奔向您",
          icon: "🚚",
        };
      case "completed":
        return {
          bg: "bg-gradient-to-r from-green-500 to-emerald-400",
          title: "交易完成",
          desc: "期待您的再次光临",
          icon: "✅",
        };
      case "cancelled":
        return {
          bg: "bg-gradient-to-r from-gray-500 to-gray-400",
          title: "交易已取消",
          desc: "如需商品请重新下单",
          icon: "🚫",
        };
      default:
        return { bg: "", title: "", desc: "", icon: "" };
    }
  };

  const statusUI = getStatusConfig(status);

  // 骨架屏渲染 (Loading State)
  if (loading) {
    return (
      <View className="h-screen bg-gray-50 p-4">
        <View className="w-full h-32 bg-gray-200 rounded-xl animate-pulse mb-4" />
        <View className="w-full h-24 bg-gray-200 rounded-xl animate-pulse mb-4" />
        <View className="w-full h-64 bg-gray-200 rounded-xl animate-pulse" />
      </View>
    );
  }

  return (
    <View className="min-h-screen bg-gray-50 pb-24 relative">
      {/* 1. 沉浸式状态栏 */}
      <View
        className={`${statusUI.bg} bg-status-animated text-white pt-6 pb-12 px-6 header-arc shadow-lg transition-all duration-500`}
      >
        <View className="flex justify-between items-center z-10 relative">
          <View>
            <Text className="text-2xl font-bold block mb-1">
              {statusUI.title}
            </Text>
            <Text className="text-sm opacity-90">{statusUI.desc}</Text>
          </View>
          <Text className="text-6xl opacity-30 transform rotate-12">
            {statusUI.icon}
          </Text>
        </View>
      </View>

      <View className="px-4 -mt-6 relative z-20">
        {/* 2. 物流信息卡片 (仅发货/完成状态显示) */}
        {["shipped", "completed"].includes(status) && (
          <View className="bg-white rounded-xl p-4 shadow-sm mb-3 flex items-start active:bg-gray-50 transition-colors">
            <View className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mr-3 mt-1 text-sm font-bold">
              🚛
            </View>
            <View className="flex-1">
              <Text className="text-blue-600 text-sm font-bold mb-1 leading-snug">
                {order.logistics.lastUpdate}
              </Text>
              <Text className="text-gray-400 text-xs mb-1">
                {order.logistics.time}
              </Text>
              <View className="flex justify-between items-center mt-2 border-t border-gray-50 pt-2">
                <Text className="text-xs text-gray-500">
                  {order.logistics.company}: {order.logistics.no}
                </Text>
                <Text
                  className="text-xs text-blue-500 px-2 py-0.5 border border-blue-200 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(order.logistics.no);
                  }}
                >
                  复制单号
                </Text>
              </View>
            </View>
            <Text className="text-gray-300 text-sm self-center ml-2">
              {">"}
            </Text>
          </View>
        )}

        {/* 3. 地址信息卡片 */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-3 flex items-center">
          <View className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mr-3 text-lg">
            📍
          </View>
          <View className="flex-1">
            <View className="flex items-center mb-1">
              <Text className="text-lg font-bold text-gray-800 mr-2">
                {order.address.name}
              </Text>
              <Text className="text-sm text-gray-500 font-mono">
                {order.address.phone}
              </Text>
            </View>
            <Text className="text-sm text-gray-600 leading-snug">
              {order.address.full}
            </Text>
          </View>
        </View>

        {/* 4. 商品清单卡片 */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-3">
          <Text className="text-sm font-bold text-gray-800 mb-3 block border-b border-gray-50 pb-2">
            购物清单
          </Text>
          {order.products.map((item, idx) => (
            <View key={idx} className="flex mb-4 last:mb-0">
              <Image
                src={item.img}
                className="w-20 h-20 bg-gray-100 rounded-lg mr-3 object-cover"
              />
              <View className="flex-1 flex flex-col justify-between py-0.5">
                <View>
                  <Text className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight mb-1">
                    {item.title}
                  </Text>
                  <Text className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded inline-block">
                    规格: {item.spec}
                  </Text>
                </View>
                <View className="flex justify-between items-end">
                  <View className="flex items-baseline text-orange-600">
                    <Text className="text-lg font-bold mr-0.5">
                      {item.points > 0 ? item.points : `¥${item.price}`}
                    </Text>
                    <Text className="text-xs">
                      {item.points > 0 ? "积分" : "元"}
                    </Text>
                  </View>
                  <Text className="text-gray-400 text-sm">x {item.count}</Text>
                </View>
              </View>
            </View>
          ))}

          {/* 价格小结 */}
          <View className="border-t border-gray-50 pt-3 mt-2 space-y-2">
            <View className="flex justify-between text-xs text-gray-500">
              <Text>商品总价</Text>
              <Text>{order.totalPoints} 积分</Text>
            </View>
            <View className="flex justify-between text-xs text-gray-500">
              <Text>运费</Text>
              <Text>免运费</Text>
            </View>
            <View className="flex justify-between items-center text-sm font-bold text-gray-800 pt-1">
              <Text>实付合计</Text>
              <Text className="text-lg text-orange-600">
                {order.totalPoints} 积分
              </Text>
            </View>
          </View>
        </View>

        {/* 5. 订单基础信息 */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-6 space-y-3">
          <View className="flex justify-between items-center text-xs">
            <Text className="text-gray-500">订单编号</Text>
            <View className="flex items-center">
              <Text className="text-gray-800 font-mono mr-2">{order.id}</Text>
              <Text
                className="text-orange-500 btn-copy px-2 py-0.5 rounded bg-orange-50"
                onClick={() => handleCopy(order.id)}
              >
                复制
              </Text>
            </View>
          </View>
          <View className="flex justify-between text-xs">
            <Text className="text-gray-500">下单时间</Text>
            <Text className="text-gray-800 font-mono">{order.createTime}</Text>
          </View>
          {order.payTime && (
            <View className="flex justify-between text-xs">
              <Text className="text-gray-500">支付时间</Text>
              <Text className="text-gray-800 font-mono">{order.payTime}</Text>
            </View>
          )}
          {/* 联系客服入口 */}
          <View className="border-t border-gray-50 pt-3 mt-2 flex justify-center">
            <View
              className="flex items-center px-4 py-2 bg-gray-50 rounded-full active:bg-gray-100 transition-colors"
              onClick={handleCall}
            >
              <Text className="text-lg mr-2">🎧</Text>
              <Text className="text-gray-600 text-xs font-bold">
                联系平台客服
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 6. 底部固定操作栏 (根据状态变化) */}
      <View className="fixed bottom-0 w-full bg-white px-4 py-3 border-t border-gray-100 flex justify-end items-center gap-3 z-50 pb-safe shadow-lg">
        {status === "pending_pay" && (
          <>
            <Button className="m-0 bg-white border border-gray-300 text-gray-600 rounded-full px-5 py-1.5 text-sm active:bg-gray-50">
              取消订单
            </Button>
            <Button className="m-0 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 rounded-full px-6 py-1.5 text-sm shadow-orange font-bold active:scale-95">
              立即支付
            </Button>
          </>
        )}

        {status === "pending_ship" && (
          <Button className="m-0 bg-white border border-gray-300 text-gray-600 rounded-full px-5 py-1.5 text-sm active:bg-gray-50">
            提醒发货
          </Button>
        )}

        {status === "shipped" && (
          <>
            <View className="m-0 bg-white border border-gray-300 text-gray-600 rounded-full px-5 py-1.5 text-sm active:bg-gray-50">
              查看物流
            </View>
            <Button className="m-0 bg-gray-900 text-white border-0 rounded-full px-6 py-1.5 text-sm shadow-lg font-bold active:scale-95">
              确认收货
            </Button>
          </>
        )}

        {status === "completed" && (
          <>
            <Button className="m-0 bg-white border border-gray-300 text-gray-600 rounded-full px-5 py-1.5 text-sm active:bg-gray-50">
              申请售后
            </Button>
            <Button className="m-0 bg-orange-50 text-orange-600 border border-orange-200 rounded-full px-6 py-1.5 text-sm font-bold active:bg-orange-100">
              再次购买
            </Button>
          </>
        )}
      </View>
    </View>
  );
};

export default MallOrderDetail;
