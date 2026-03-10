import { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Textarea,
  Picker,
} from "@tarojs/components";
import "./index.less";
import { BottomSafeView } from "@/components/bottom-safe";
import Taro from "@tarojs/taro";
import { paths } from "@/route/paths";
import { useGetLocation } from "@/hooks/use-get-location";

// 模拟上个页面传来的服务数据
const MOCK_SERVICE = {
  id: 1,
  title: "三甲医院全程陪诊",
  type: "medical",
  price: 298,
  image:
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&h=200&fit=crop",
  duration: "4小时",
};

const MOCK_SERVICE_TAGS = [
  { id: "1", name: "行动自如" },
  { id: "2", name: "需轮椅" },
  { id: "3", name: "需辅助" },
];

// 模拟已有的就诊人/长辈列表
const MOCK_ELDERS = [
  {
    id: 1,
    name: "张建国",
    age: 72,
    tag: "父亲",
    mobile: "138****1234",
    condition: "行动自如",
  },
  {
    id: 2,
    name: "李淑芬",
    age: 69,
    tag: "母亲",
    mobile: "139****5678",
    condition: "需轮椅",
  },
];

export default function ConfirmOrder() {
  const [selectedElderId, setSelectedElderId] = useState(1);
  const [time, setTime] = useState("09:00");
  const [date, setDate] = useState("2023-12-25");
  const [note, setNote] = useState("");
  const [checkedTag, setCheckedTag] = useState<
    { id: string; name: string } | undefined
  >();

  const { location, chooseLocation } = useGetLocation({ value: null });

  // 当前选中的老人
  const currentElder = MOCK_ELDERS.find((e) => e.id === selectedElderId);

  return (
    <View className="min-h-screen bg-gray-50 pb-32">
      {/* 1. 顶部导航 (通常Taro自带，这里写个占位或自定义Header) */}
      <View className="bg-teal-600 px-4 pt-12 pb-6 rounded-b-3xl shadow-lg mb-4">
        <Text className="text-white text-xl font-bold">确认订单</Text>
        <Text className="text-teal-100 text-sm block mt-1">
          请核对服务信息，我们将尽快安排专业人员
        </Text>
      </View>

      <ScrollView scrollY className="h-full px-4 -mt-8">
        {/* 2. 选择服务对象 (卡片悬浮效果) */}
        <View className="bg-white rounded-xl p-4 mb-4 animate-fade-in-up">
          <View className="flex justify-between items-center mb-3">
            <Text className="font-bold text-gray-800 text-lg">服务对象</Text>
            <View
              className="flex items-center space-x-1 text-teal-600"
              onClick={() => {
                Taro.navigateTo({
                  url: paths.contact.root,
                });
              }}
            >
              <Text className="text-sm font-medium">+ 新增档案</Text>
            </View>
          </View>

          {/* 老人选择列表 */}
          <ScrollView scrollX className="whitespace-nowrap flex pb-2">
            {MOCK_ELDERS.map((elder) => (
              <View
                key={elder.id}
                onClick={() => setSelectedElderId(elder.id)}
                style={{
                  borderWidth: "1.5px",
                }}
                className={`inline-block w-40 p-3 mr-3 rounded-xl bg-gray-50 border transition-all duration-200 ${
                  selectedElderId === elder.id
                    ? "bg-teal-50 border-teal-500 ring-1 ring-teal-500"
                    : "border-gray-100"
                }`}
              >
                <View className="flex items-center justify-between mb-2">
                  <Text className="font-bold text-gray-800 truncate">
                    {elder.name}
                  </Text>
                  <Text
                    className={`text-xs px-1.5 py-0.5 rounded text-white ${
                      elder.tag === "父亲" ? "bg-blue-400" : "bg-pink-400"
                    }`}
                  >
                    {elder.tag}
                  </Text>
                </View>
                <Text className="text-xs text-gray-500 block">
                  年龄：{elder.age}岁
                </Text>
                {/* <Text className="text-xs text-gray-500 block mt-1">
                  状况：{elder.condition}
                </Text> */}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 3. 服务详情卡片 */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4 animate-fade-in-up delay-100">
          <View className="flex">
            <Image
              src={MOCK_SERVICE.image}
              className="w-20 h-20 rounded-lg object-cover bg-gray-200"
            />
            <View className="ml-3 flex-1 flex flex-col justify-between py-1">
              <View>
                <Text className="text-gray-900 font-bold text-base block">
                  {MOCK_SERVICE.title}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  服务时长：{MOCK_SERVICE.duration} (不含交通耗时)
                </Text>
              </View>
              <View className="flex justify-between items-center">
                <Text className="text-teal-600 text-xs bg-teal-50 px-2 py-0.5 rounded">
                  专业陪护 · 官方认证
                </Text>
                <Text className="text-gray-900 font-bold">
                  ¥{MOCK_SERVICE.price}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4. 预约信息表单 (核心交互区) */}
        <View className="bg-white rounded-xl px-4 py-2 shadow-sm mb-4 animate-fade-in-up delay-200 divide-y divide-gray-100">
          {/* 时间选择 */}
          <View className="py-4 flex justify-between items-center">
            <Text className="text-gray-700 font-medium">预约日期</Text>
            <Picker
              mode="date"
              value={date}
              start="2023-01-01"
              onChange={(e) => setDate(e.detail.value)}
            >
              <View className="flex items-center">
                <Text className="text-gray-800 font-bold text-base">
                  {date}
                </Text>
                <Text className="text-gray-500 text-xl ml-2">›</Text>
              </View>
            </Picker>
          </View>

          <View className="py-4 flex justify-between items-center">
            <Text className="text-gray-700 font-medium">上门/集合时间</Text>
            <Picker
              mode="time"
              value={time}
              start="08:00"
              end="18:00"
              onChange={(e) => setTime(e.detail.value)}
            >
              <View className="flex items-center">
                <Text className="text-gray-800 font-bold text-base">
                  {time}
                </Text>
                <Text className="text-gray-500 text-xl ml-2">›</Text>
              </View>
            </Picker>
          </View>

          {/* 地点选择 - 如果是陪诊则需要医院，如果是居家则需要家庭地址 */}
          <View
            className="py-4 flex justify-between items-center"
            onClick={chooseLocation}
          >
            <View className="flex-shrink-0">
              <Text className="text-gray-700 font-medium block">服务地点</Text>
              {MOCK_SERVICE.type === "medical" && (
                <Text className="text-xs text-gray-400">选择要去的医院</Text>
              )}
            </View>
            <View className="flex items-center justify-end flex-1 ml-4 overflow-hidden">
              {location ? (
                <View className="w-full">
                  <View className="text-gray-800 font-bold text-right truncate">
                    {location.fullAddress}
                  </View>
                  <View className="text-gray-500 text-xs text-right truncate pl-2">
                    {location.getFullAddress()}
                  </View>
                </View>
              ) : (
                <View className="text-gray-500 text-md">请选择地址</View>
              )}

              <Text className="text-gray-500 flex-shrink-0 text-xl ml-2">
                ›
              </Text>
            </View>
          </View>

          {/* 风险控制字段 */}
          <View className="py-4">
            <Text className="text-gray-700 font-medium mb-3 block">
              老人行动能力
            </Text>
            <View className="flex space-x-3">
              {MOCK_SERVICE_TAGS.map((item) => (
                <View
                  key={item.id}
                  className={`px-3 py-2 rounded-lg text-xs border ${
                    item.id === checkedTag?.id
                      ? "bg-orange-50 border-orange-500 text-orange-600"
                      : "bg-gray-50 border-gray-100 text-gray-500"
                  }`}
                  onClick={() => {
                    setCheckedTag(item);
                  }}
                >
                  {item.name}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 5. 备注与叮嘱 */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4 animate-fade-in-up delay-300">
          <Text className="text-gray-700 font-medium mb-2 block">
            给陪诊师的叮嘱
          </Text>
          <View className="bg-gray-50 rounded-lg p-3">
            <Textarea
              placeholder="例如：老人听力不太好，请耐心一点；需要帮忙取之前的检查报告..."
              className="w-full h-20 text-sm text-gray-700 bg-transparent"
              placeholderClass="text-gray-400"
              maxlength={200}
              value={note}
              onInput={(e) => setNote(e.detail.value)}
            />
            <Text className="text-right text-xs text-gray-400 block mt-1">
              {note.length}/200
            </Text>
          </View>
        </View>

        {/* 6. 费用明细 */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-6 animate-fade-in-up delay-300">
          <View className="flex justify-between mb-2">
            <Text className="text-gray-500 text-sm">服务费</Text>
            <Text className="text-gray-800 text-sm">¥298.00</Text>
          </View>
          <View className="flex justify-between mb-2">
            <Text className="text-gray-500 text-sm">优惠券</Text>
            <Text className="text-red-500 text-sm">- ¥50.00</Text>
          </View>
          <View className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
            <Text className="text-gray-900 font-bold">总计</Text>
            <View className="flex items-baseline">
              <Text className="text-xs text-red-500 font-bold">¥</Text>
              <Text className="text-xl text-red-500 font-bold">248</Text>
            </View>
          </View>
        </View>

        {/* 占位，防止底部遮挡 */}
        <View className="h-10"></View>
      </ScrollView>

      {/* 7. 底部固定结算栏 */}
      <View className="fixed bottom-0 left-0 w-full bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] animate-slide-up z-50">
        <View className="flex items-center justify-between px-4 py-3">
          <View className="flex flex-col">
            <View className="flex items-baseline">
              <Text className="text-xs text-red-500 font-bold">¥</Text>
              <Text className="text-2xl text-red-500 font-bold mr-1">248</Text>
              <Text className="text-xs text-gray-400 line-through">¥298</Text>
            </View>
            <Text className="text-xs text-teal-600">已为您节省 50 元</Text>
          </View>

          <View
            className="bg-teal-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-teal-200 active:scale-95 transition-transform"
            onClick={() => {
              Taro.redirectTo({
                url: paths.order.list,
                success: () => {
                  Taro.navigateTo({
                    url: paths.order.detail,
                  });
                },
              });
            }}
          >
            立即支付
          </View>
        </View>
        <BottomSafeView />
      </View>
    </View>
  );
}
