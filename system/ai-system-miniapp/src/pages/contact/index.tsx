import React, { useState } from "react";
import { View, Text, ScrollView, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
// 假设你配置好了 tailwind，可以直接写 className
import "./index.less";
import { ContactItem } from "@/types/contact";
import { paths } from "@/route/paths";

// types/contact.ts

const ContactPage = () => {
  // 模拟数据
  const [contacts, setContacts] = useState<ContactItem[]>([
    {
      id: 1,
      name: "张建国",
      mobile: "138 0013 8000",
      rawMobile: "13800138000",
      tag: "本人",
      isDefault: true,
    },
    {
      id: 2,
      name: "张小明",
      mobile: "139 1234 5678",
      rawMobile: "13912345678",
      tag: "儿子",
      isDefault: false,
    },
    {
      id: 3,
      name: "李阿姨",
      mobile: "136 6666 8888",
      rawMobile: "13666668888",
      tag: "护工",
      isDefault: false,
    },
  ]);

  // 处理：设为默认
  const handleSetDefault = (id: string | number) => {
    const newList = contacts.map((item) => ({
      ...item,
      isDefault: item.id === id,
    }));
    setContacts(newList);
    Taro.showToast({ title: "已设为默认联系人", icon: "success" });
  };

  // 处理：编辑/添加
  const goToEdit = (id?: string | number) => {
    // 实际项目中跳转到 form 表单页
    console.log("跳转编辑/新增页面, ID:", id);
    Taro.navigateTo({ url: `/pages/contacts/edit?id=${id || ""}` });
  };

  // 处理：导入微信通讯录 (子女代操作神器)
  const handleImportWechat = async () => {
    try {
      // 这里的逻辑需要在 app.json 配置 permission
      const res = await Taro.chooseAddress();
      // 拿到 res.userName, res.telNumber 等填充到新数据中
      console.log("微信地址/联系人:", res);
    } catch (e) {
      // 用户取消
    }
  };

  return (
    <View className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* 1. 顶部温馨提示 (场景：老人可能忘记这个页面是干嘛的) */}
      <View className="bg-orange-50 p-4 flex items-start">
        <Text className="text-orange-500 text-lg mr-2">💡</Text>
        <Text className="text-orange-700 text-sm leading-5">
          请设置常联系的人，服务人员接单后会优先拨打“默认”电话。
        </Text>
      </View>

      {/* 2. 列表区域 */}
      <ScrollView scrollY className="flex-1 px-4 py-4 box-border">
        {contacts.length === 0 ? (
          // 空状态
          <View className="flex flex-col items-center justify-center pt-20 opacity-60">
            <View className="text-6xl mb-4">📇</View>
            <Text className="text-gray-500 text-lg">还没有添加联系人哦</Text>
          </View>
        ) : (
          contacts.map((item) => (
            <View
              key={item.id}
              className={`
                relative mb-4 p-5 rounded-2xl bg-white shadow-sm border transition-all duration-200
                ${
                  item.isDefault
                    ? "border-orange-500 ring-1 ring-orange-100"
                    : "border-transparent"
                }
              `}
              onClick={() => goToEdit(item.id)} // 点击卡片直接编辑，或者选择
            >
              {/* 默认标识徽章 - 绝对定位 */}
              {item.isDefault && (
                <View className="absolute right-0 top-0 bg-orange-500 text-white text-xs px-3 py-1 rounded-bl-xl rounded-tr-xl font-bold">
                  默认联系人
                </View>
              )}

              <View className="flex items-center justify-between">
                {/* 左侧主要信息 */}
                <View className="flex-1">
                  <View className="flex items-end mb-2">
                    <Text className="text-2xl font-bold text-gray-800 mr-3">
                      {item.name}
                    </Text>
                    {/* 关系标签：不同关系不同颜色，方便老人视觉识别 */}
                    <View
                      className={`
                      px-2 py-0.5 rounded text-sm font-medium
                      ${item.tag === "本人" ? "bg-blue-100 text-blue-600" : ""}
                      ${
                        item.tag === "儿子" || item.tag === "女儿"
                          ? "bg-green-100 text-green-600"
                          : ""
                      }
                      ${
                        !["本人", "儿子", "女儿"].includes(item.tag)
                          ? "bg-gray-100 text-gray-500"
                          : ""
                      }
                    `}
                    >
                      {item.tag}
                    </View>
                  </View>

                  {/* 大号电话号码 - 增加字间距方便阅读 */}
                  <Text className="text-xl text-gray-600 font-mono tracking-wide block mb-3">
                    {item.mobile}
                  </Text>
                </View>

                {/* 右侧编辑图标 - 视觉引导 */}
                <View
                  className="pl-4 border-l border-gray-100 flex flex-col items-center justify-center text-gray-400"
                  onClick={() => {
                    Taro.navigateTo({
                      url: paths.contact.edit,
                    });
                  }}
                >
                  <Text className="text-xl">✎</Text>
                  <Text className="text-xs mt-1">编辑</Text>
                </View>
              </View>

              {/* 底部操作条：分割线与快捷操作 */}
              <View className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <View
                  className="flex items-center p-2 -ml-2 rounded-lg active:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止冒泡
                    handleSetDefault(item.id);
                  }}
                >
                  <View
                    className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2
                    ${
                      item.isDefault
                        ? "border-orange-500 bg-orange-500"
                        : "border-gray-300 bg-white"
                    }
                  `}
                  >
                    {item.isDefault && (
                      <Text className="text-white text-xs">✓</Text>
                    )}
                  </View>
                  <Text
                    className={`text-base ${
                      item.isDefault
                        ? "text-orange-600 font-bold"
                        : "text-gray-500"
                    }`}
                  >
                    {item.isDefault ? "当前默认" : "设为默认"}
                  </Text>
                </View>

                {/* 拨打电话：场景是老人记不住号，直接点这里打给子女 */}
                <View
                  className="flex items-center px-3 py-1 rounded-full bg-green-50 text-green-600 active:bg-green-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    Taro.makePhoneCall({ phoneNumber: item.rawMobile });
                  }}
                >
                  <Text className="mr-1">📞</Text>
                  <Text className="text-sm font-medium">拨打</Text>
                </View>
              </View>
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>

      {/* 3. 底部固定按钮区 */}
      <View className="fixed bottom-0 w-full bg-white px-6 py-4 shadow-lg pb-safe-area flex flex-col gap-3 z-50 rounded-t-2xl">
        <View
          className="w-full bg-orange-500 text-white h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-orange active:opacity-90 active:scale-98 transition-transform"
          onClick={() => goToEdit()}
        >
          + 手动添加联系人
        </View>
        {/* <View
          className="w-full bg-green-50 text-green-700 border border-green-200 h-12 rounded-full flex items-center justify-center text-lg font-medium active:bg-green-100"
          onClick={handleImportWechat}
        >
          📲 微信一键导入 (推荐子女使用)
        </View> */}
      </View>
    </View>
  );
};

export default ContactPage;
