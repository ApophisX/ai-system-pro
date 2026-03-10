import { View, Text, Image, Button, ScrollView } from "@tarojs/components";
import Taro, { useShareAppMessage } from "@tarojs/taro";
import "../../goods/index.less";
import { paths } from "@/route/paths";

const MallDetail = () => {
  // 模拟数据
  const product = {
    title: "高端定制居家理疗套餐 (含3次上门)",
    points: 5000,
    price: 500.0,
    desc: "专业理疗师上门服务，包含推拿、艾灸等传统中医理疗项目，适合腰腿疼痛的老年人...",
    images: ["https://via.placeholder.com/400x400"],
    stock: 12,
  };

  useShareAppMessage(() => {
    return {
      title: "邀请你加入陪诊平台",
      path: "/pages/index/index",
    };
  });
  // 假设用户积分
  const userPoints = 8866;
  const canAfford = userPoints >= product.points;

  const handleBuy = (type: "points" | "money") => {
    Taro.navigateTo({
      url: `${paths.mall.checkout}?type=${type}&points=${product.points}&price=${product.price}`,
    });
  };

  return (
    <View className="h-screen flex flex-col bg-white">
      <ScrollView scrollY className="flex-1">
        {/* 顶部大图 */}
        <Image
          src={product.images[0]}
          mode="widthFix"
          className="w-full bg-gray-100"
        />

        {/* 核心信息区 */}
        <View className="p-5">
          <View className="flex items-baseline mb-2">
            <Text className="text-3xl font-bold text-orange-600 mr-1">
              {product.points}
            </Text>
            <Text className="text-sm text-orange-600 font-bold mr-3">积分</Text>
            <Text className="text-gray-400 text-sm line-through">
              ¥{product.price}
            </Text>
          </View>

          <Text className="text-xl font-bold text-gray-900 leading-snug mb-4 block">
            {product.title}
          </Text>

          {/* 权益标签 */}
          <View className="flex gap-2 mb-6">
            {["正品保证", "极速发货", "售后无忧"].map((tag) => (
              <View
                key={tag}
                className="flex items-center text-xs text-gray-500"
              >
                <Text className="text-orange-500 mr-1">✓</Text>
                {tag}
              </View>
            ))}
          </View>

          <View className="h-2 bg-gray-50 -mx-5 mb-6" />

          {/* 详情介绍 */}
          <View>
            <Text className="font-bold text-base mb-3 block border-l-4 border-orange-500 pl-3">
              商品详情
            </Text>
            <Text className="text-gray-600 text-sm leading-relaxed">
              {product.desc}
              {/* 这里通常是 RichText 解析 HTML */}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View className="bg-white bottom-action-bar px-4 py-3 flex items-center border-t border-gray-100 z-50">
        <View className="flex flex-col items-center mr-6 px-2">
          <Text className="text-xl">🎧</Text>
          <Text className="text-xs text-gray-500">客服</Text>
        </View>

        <View className="flex-1 flex gap-2">
          {/* 现金购买按钮 */}
          <View
            className="flex-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-sm font-bold flex flex-col items-center justify-center leading-none py-1"
            onClick={() => handleBuy("money")}
          >
            <Text>¥{product.price}</Text>
            <Text className="text-xs font-normal mt-0.5">现金购买</Text>
          </View>

          {/* 积分兑换按钮 (如果积分不够，变灰) */}
          <Button
            className={`
              flex-1 rounded-full text-white text-sm font-bold flex flex-col items-center justify-center leading-none py-1 shadow-lg
              ${
                canAfford
                  ? "bg-gradient-to-r from-orange-500 to-red-500"
                  : "bg-gray-300"
              }
            `}
            disabled={!canAfford}
            onClick={() => handleBuy("points")}
          >
            <Text>{product.points} 积分</Text>
            <Text className="text-xs opacity-90 mt-0.5 font-normal">
              {canAfford ? "立即兑换" : "积分不足"}
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
};

export default MallDetail;
