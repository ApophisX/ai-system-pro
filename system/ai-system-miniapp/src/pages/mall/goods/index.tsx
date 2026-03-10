import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView } from "@tarojs/components";
import Taro, { useShareAppMessage } from "@tarojs/taro";
import "./index.less";
import { paths } from "@/route/paths";

// 模拟商品数据
const MOCK_PRODUCTS = [
  {
    id: 1,
    title: "高端定制居家理疗套餐",
    points: 5000,
    price: 500,
    image:
      "https://cdn.pixabay.com/photo/2024/12/17/10/20/wheelchair-9272780_1280.jpg",
    sold: 120,
    tag: "热兑",
  },
  {
    id: 2,
    title: "智能健康监测手环",
    points: 2800,
    price: 280,
    image:
      "https://media.istockphoto.com/id/1446491079/photo/using-fitbit-fitness-bracelet-and-mobile-phone-hands-with-sport-smartwatch-and-holding.jpg?s=1024x1024&w=is&k=20&c=E2nZmXru3PyaxZVv4TD6wK76Q7fI4XIpn2Ovuc4tG94=",
    sold: 850,
    tag: "限量",
  },
  {
    id: 3,
    title: "有机五常大米 5kg",
    points: 800,
    price: 80,
    image:
      "https://media.istockphoto.com/id/872343048/photo/raw-rice-grain-and-dry-rice-plant-on-wooden-table.jpg?s=1024x1024&w=is&k=20&c=D-Sh9CMlxIssUlqv77fp-Wy5lg3xQANowjJXoIk2Zqc=",
    sold: 2000,
    tag: "",
  },
  {
    id: 4,
    title: "适老化防滑浴室拖鞋",
    points: 300,
    price: 30,
    image:
      "https://cdn.pixabay.com/photo/2015/11/23/05/14/beach-1057766_1280.jpg",
    sold: 500,
    tag: "新品",
  },
];

const MallList = () => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<any[]>([]);
  const [myPoints, setMyPoints] = useState(8866); // 用户当前积分
  const [myMoney, setMyMoney] = useState(0); // 用户当前金额
  const [refreshing, setRefreshing] = useState(false); // 是否在刷新中
  const [loadingMore, setLoadingMore] = useState(false); // 是否在加载更多中

  useShareAppMessage(() => {
    return {
      title: "邀请你加入陪诊平台",
      path: "/pages/index/index",
    };
  });

  // 模拟加载
  const loadData = (refresh = false) => {
    if (refresh) setLoading(true);
    setTimeout(() => {
      setList(refresh ? MOCK_PRODUCTS : [...list, ...MOCK_PRODUCTS]);
      setLoading(false);
      if (refresh) Taro.stopPullDownRefresh();
    }, 1500);
  };

  useEffect(() => {
    loadData(true);
  }, []);

  // 上拉刷新
  Taro.usePullDownRefresh(() => {
    setRefreshing(true);
    loadData(true);
    setRefreshing(false);
  });

  // 下拉加载更多
  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setList([...list, ...MOCK_PRODUCTS]);
      setLoadingMore(false);
    }, 1500);
  };
  // 骨架屏组件
  const SkeletonCard = () => (
    <View className="bg-white rounded-xl overflow-hidden mb-4 shadow-sm">
      <View className="w-full h-40 skeleton-bg"></View>
      <View className="p-3">
        <View className="w-3/4 h-4 skeleton-bg mb-2 rounded"></View>
        <View className="w-1/2 h-4 skeleton-bg rounded"></View>
      </View>
    </View>
  );

  return (
    <View className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部积分看板 */}
      <View className="bg-gray-900 text-white px-6 py-6 pb-12 rounded-b-[40rpx] shadow-lg z-10 relative overflow-hidden">
        {/*积分光斑*/}
        <View className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-[60px] opacity-20" />
        <View className="flex justify-between items-center relative z-10">
          <View>
            <Text className="text-xs text-gray-400 block mb-1">
              当前可用积分
            </Text>
            <Text className="text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">
              {myPoints.toLocaleString()}
            </Text>
          </View>
          <View className="flex flex-row justify-center items-center bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            <Text className="text-xs">积分记录 {">"}</Text>
          </View>
        </View>
      </View>

      {/* 商品列表区域 */}
      <ScrollView
        scrollY
        className="flex-1 px-4 -mt-6 z-20"
        onScrollToLower={loadMore}
      >
        <View className="grid grid-cols-2 gap-3 pb-6">
          {loading && list.length === 0 ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            list.map((item, index) => (
              <View
                key={`${item.id}-${index}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm active:scale-95 transition-transform duration-200"
                onClick={() => {
                  Taro.navigateTo({
                    url: paths.mall.goods.detail,
                  });
                }}
              >
                <View className="relative w-full h-40 bg-gray-100">
                  <Image
                    src={item.image}
                    mode="aspectFill"
                    className="w-full h-full"
                  />
                  {item.tag && (
                    <View className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-br-lg z-10">
                      {item.tag}
                    </View>
                  )}
                </View>

                <View className="p-3">
                  <View className="text-sm font-bold text-gray-800 line-clamp-2  leading-tight">
                    {item.title}
                  </View>

                  <View className="flex items-baseline mb-1">
                    <Text className="text-lg font-bold text-orange-600 mr-1">
                      {item.points}
                    </Text>
                    <Text className="text-xs text-orange-400">积分</Text>
                  </View>

                  <View className="flex justify-between items-center">
                    <Text className="text-xs text-gray-400 line-through">
                      ¥{item.price}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {item.sold}人已换
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
        {/* 加载更多提示 */}
        {!loading && list.length > 0 && (
          <View className="text-center text-gray-300 text-xs py-4">
            {!loadingMore ? (
              <Text>- 到底啦，快去兑换吧 -</Text>
            ) : (
              <View className="w-4 h-4 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin mr-2"></View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default MallList;
