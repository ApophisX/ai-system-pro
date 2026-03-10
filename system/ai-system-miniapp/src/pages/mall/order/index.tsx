import { useState } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import "../goods/index.less";
import Taro from "@tarojs/taro";
import { paths } from "@/route/paths";

// 订单状态枚举
const TABS = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待发货" },
  { key: "shipped", label: "已发货" },
  { key: "completed", label: "已完成" },
];

const OrderList = () => {
  const [activeTab, setActiveTab] = useState("all");

  // 模拟订单数据
  const orders = [
    {
      id: "ORD20231001",
      title: "智能健康监测手环",
      price: "2800 积分",
      status: "shipped",
      date: "2023-10-01",
    },
    {
      id: "ORD20231005",
      title: "有机五常大米 5kg",
      price: "¥ 80.00",
      status: "pending",
      date: "2023-10-05",
    },
    {
      id: "ORD20230912",
      title: "居家理疗套餐",
      price: "5000 积分",
      status: "completed",
      date: "2023-09-12",
    },
  ];

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return { text: "待发货", color: "text-orange-500" };
      case "shipped":
        return { text: "运输中", color: "text-blue-500" };
      case "completed":
        return { text: "已完成", color: "text-gray-400" };
      default:
        return { text: "", color: "" };
    }
  };

  // 过滤逻辑
  const displayList =
    activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  return (
    <View className="h-screen bg-gray-50 flex flex-col">
      {/* 顶部 Tab */}
      <View className="bg-white flex justify-around py-3 shadow-sm z-10">
        {TABS.map((tab) => (
          <View
            key={tab.key}
            className={`relative px-2 py-1 flex flex-col items-center ${
              activeTab === tab.key
                ? "text-gray-900 font-bold"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className="text-sm">{tab.label}</Text>
            {activeTab === tab.key && (
              <View className="absolute bottom-0 w-6 h-0.5 bg-orange-500 rounded-full" />
            )}
          </View>
        ))}
      </View>

      <ScrollView scrollY className="flex-1 p-4">
        {displayList.map((item) => {
          const statusStyle = getStatusText(item.status);
          return (
            <View
              key={item.id}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm"
              onClick={() => {
                Taro.navigateTo({
                  url: paths.mall.order.detail,
                });
              }}
            >
              <View className="flex justify-between items-center mb-3 border-b border-gray-50 pb-2">
                <Text className="text-xs text-gray-400">订单号: {item.id}</Text>
                <Text className={`text-xs font-bold ${statusStyle.color}`}>
                  {statusStyle.text}
                </Text>
              </View>

              <View className="flex mb-3">
                <View className="w-16 h-16 bg-gray-100 rounded-lg mr-3 flex-shrink-0"></View>
                <View className="flex-1">
                  <View className="text-sm font-bold text-gray-800 mb-1">
                    {item.title}
                  </View>
                  <View>
                    <Text className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded inline-block">
                      规格: 默认
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex justify-between items-center">
                <Text className="text-xs text-gray-400">{item.date}</Text>
                <View className="flex items-center">
                  <Text className="text-xs text-gray-500 mr-2">实付:</Text>
                  <Text className="text-base font-bold text-gray-900">
                    {item.price}
                  </Text>
                </View>
              </View>

              {/* 底部按钮逻辑 */}
              <View className="mt-3 flex justify-end gap-2">
                {item.status === "shipped" && (
                  <View className="border border-gray-200 px-3 py-1 rounded-full text-xs text-gray-600 active:bg-gray-50">
                    查看物流
                  </View>
                )}
                {item.status === "completed" && (
                  <View className="border border-orange-200 text-orange-600 px-3 py-1 rounded-full text-xs active:bg-orange-50">
                    再次购买
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default OrderList;
