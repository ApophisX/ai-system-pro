import { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.less";
import { paths } from "@/route/paths";

// 类型定义
interface Coupon {
  id: number;
  name: string;
  amount: number;
  condition: string;
  startDate: string;
  endDate: string;
  status: "unused" | "used" | "expired"; // 状态
}

const TABS = [
  { key: "unused", label: "待使用" },
  { key: "used", label: "已使用" },
  { key: "expired", label: "已过期" },
];

const CouponList = () => {
  const [activeTab, setActiveTab] = useState("unused");
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<Coupon[]>([]);

  // 模拟数据加载
  const loadData = (isRefresh = false) => {
    setLoading(true);
    setTimeout(() => {
      // 模拟返回数据
      const mockData: Coupon[] = Array(5)
        .fill(0)
        .map((_, i) => ({
          id: Math.random(),
          name: "居家陪护专用券",
          amount: 50,
          condition: "满200元可用",
          startDate: "2023.10.01",
          endDate: "2023.12.31",
          status: activeTab as any,
        }));

      setList(isRefresh ? mockData : [...list, ...mockData]);
      setLoading(false);
      if (isRefresh) Taro.stopPullDownRefresh();
    }, 1000);
  };

  // 初始加载 & 切换Tab
  useEffect(() => {
    setList([]); // 切换Tab先清空，显示骨架屏
    loadData(true);
  }, [activeTab]);

  // 下拉刷新 (需要在 page.config.json 开启 enablePullDownRefresh)
  Taro.usePullDownRefresh(() => {
    loadData(true);
  });

  // 触底加载
  const handleScrollToLower = () => {
    if (!loading) {
      loadData(false);
    }
  };

  // 骨架屏组件
  const SkeletonCard = () => (
    <View className="mb-3 bg-white p-4 rounded-xl flex items-start justify-between animate-pulse-custom">
      <View className="w-20 h-22 bg-gray-200 rounded mr-4"></View>
      <View className="flex-1">
        <View className="w-3/4 h-6 bg-gray-200 rounded mb-2"></View>
        <View className="w-1/2 h-4 bg-gray-200 rounded"></View>
      </View>
      <View className="w-16 h-6 bg-gray-200 rounded-full self-end"></View>
    </View>
  );

  return (
    <View className="h-screen bg-gray-50 flex flex-col">
      {/* 顶部 Tabs */}
      <View className="bg-white flex justify-around pt-2 pb-0 shadow-sm z-10">
        {TABS.map((tab) => (
          <View
            key={tab.key}
            className={`
              py-3 px-4 relative flex flex-col items-center
              ${
                activeTab === tab.key
                  ? "text-orange-500 font-bold"
                  : "text-gray-500"
              }
            `}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className="text-base">{tab.label}</Text>
            {activeTab === tab.key && (
              <View className="absolute bottom-0 w-8 h-1 bg-orange-500 rounded-full" />
            )}
          </View>
        ))}
      </View>

      {/* 列表区域 */}
      <ScrollView
        scrollY
        className="flex-1 p-4 box-border"
        onScrollToLower={handleScrollToLower}
        lowerThreshold={50}
      >
        {loading && list.length === 0 ? (
          // 加载中显示骨架屏
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : list.length === 0 ? (
          // 空状态
          <View className="flex flex-col items-center pt-20 opacity-60">
            <View className="text-6xl grayscale">🎟️</View>
            <Text className="text-gray-400 mt-4">暂无相关优惠券</Text>
          </View>
        ) : (
          // 真实列表
          list.map((item) => (
            <View
              key={item.id}
              className={`
                coupon-card bg-white rounded-xl mb-3 flex overflow-hidden shadow-sm transition-all duration-300
                ${
                  item.status === "unused"
                    ? "opacity-100"
                    : "opacity-60 grayscale"
                }
              `}
              onClick={() => {
                // 跳转详情
                Taro.navigateTo({ url: paths.coupon.detail });
              }}
            >
              {/* 左侧金额区 */}
              <View
                className={`
                w-24 flex flex-col items-center justify-center text-white
                ${
                  item.status === "unused"
                    ? "bg-gradient-to-b from-orange-400 to-red-500"
                    : "bg-gray-400"
                }
              `}
              >
                <View className="flex items-baseline">
                  <Text className="text-sm">¥</Text>
                  <Text className="text-3xl font-bold">{item.amount}</Text>
                </View>
                <Text className="text-xs opacity-90">{item.condition}</Text>
              </View>

              {/* 右侧信息区 */}
              <View className="flex-1 p-3 flex flex-col justify-between relative">
                <View>
                  <View className="flex justify-between items-start">
                    <Text className="text-gray-800 font-bold text-lg">
                      {item.name}
                    </Text>
                    {/* 状态印章 (仅在非待使用状态显示) */}
                    {item.status !== "unused" && (
                      <View className="border-2 border-gray-300 text-gray-300 text-xs px-1 rounded transform -rotate-12 absolute right-2 top-0">
                        {item.status === "used" ? "已使用" : "已过期"}
                      </View>
                    )}
                  </View>
                  <Text className="text-gray-400 text-xs mt-1">
                    有效期：{item.startDate} - {item.endDate}
                  </Text>
                </View>

                <View className="flex justify-between items-center mt-3 border-t border-dashed border-gray-100 pt-2">
                  <Text className="text-orange-400 text-xs">查看详情 &gt;</Text>
                  {item.status === "unused" && (
                    <View className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
                      去使用
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))
        )}

        {/* 底部加载提示 */}
        {!loading && list.length > 0 && (
          <View className="text-center text-gray-300 text-xs py-4">
            - 到底了，没有更多了 -
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default CouponList;
