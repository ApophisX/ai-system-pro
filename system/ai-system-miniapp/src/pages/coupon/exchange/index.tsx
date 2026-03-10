import { useState } from "react";
import { View, Text, Input, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.less";

const ExchangePage = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successInfo, setSuccessInfo] = useState<any>(null);

  // 处理输入：自动大写 + 每4位加空格 (视觉优化)
  const handleInput = (e) => {
    let val = e.detail.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    // 限制最大长度（假设兑换码16位）
    if (val.length > 16) val = val.slice(0, 16);
    setCode(val);
  };

  // 获取展示用的格式化字符串 (ABCD 1234 ...)
  const getDisplayValue = () => {
    return code.replace(/(.{4})/g, "$1 ").trim();
  };

  // 1. 粘贴功能
  const handlePaste = async () => {
    try {
      const res = await Taro.getClipboardData();
      if (res.data) {
        const val = res.data.toUpperCase().replace(/[^A-Z0-9]/g, "");
        setCode(val);
        Taro.showToast({ title: "已粘贴", icon: "none" });
      }
    } catch (err) {
      Taro.showToast({ title: "粘贴失败", icon: "none" });
    }
  };

  // 2. 扫码功能 (补充功能：老人最爱)
  const handleScan = async () => {
    try {
      const res = await Taro.scanCode({ onlyFromCamera: true });
      if (res.result) {
        // 假设扫码结果就是兑换码，或者是包含 code=xxx 的链接
        // 这里做简单的提取逻辑，视具体业务而定
        const val = res.result.toUpperCase().replace(/[^A-Z0-9]/g, "");
        setCode(val);
        Taro.vibrateShort(); // 震动反馈
      }
    } catch (error) {
      // 用户取消扫码
    }
  };

  // 3. 提交兑换
  const handleSubmit = () => {
    if (!code || code.length < 8) {
      // 简单校验
      Taro.showToast({ title: "请输入正确的兑换码", icon: "none" });
      return;
    }

    setLoading(true);
    // 模拟 API 请求
    setTimeout(() => {
      setLoading(false);
      // 模拟成功数据
      setSuccessInfo({
        name: "居家养老体验券",
        amount: 100,
        type: "无门槛",
      });
      setShowSuccessModal(true);
    }, 1500);
  };

  // 关闭弹窗并跳转
  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setCode(""); // 清空输入
    // 跳转到卡券列表
    Taro.redirectTo({ url: "/pages/coupon/index" });
  };

  return (
    <View className="min-h-screen bg-gray-50 flex flex-col items-center pt-8 px-5">
      {/* 顶部标题区 */}
      <View className="w-full mb-8">
        <Text className="text-2xl font-bold text-gray-800 block">
          兑换优惠券
        </Text>
        <Text className="text-gray-400 text-sm mt-1">
          请输入实体卡或短信收到的兑换码
        </Text>
      </View>

      {/* 核心输入区域 - 拟物化卡片设计 */}
      <View className="w-full bg-white rounded-2xl p-6 shadow-lg mb-8 relative overflow-hidden">
        {/* 装饰背景圆 */}
        <View className="absolute -right-6 -top-6 w-24 h-24 bg-orange-100 rounded-full opacity-50 pointer-events-none"></View>

        <Text className="text-sm font-bold text-gray-500 mb-4 block uppercase tracking-wider">
          Redemption Code
        </Text>

        <View className="relative">
          <Input
            className="h-14 w-full text-2xl font-mono font-bold text-gray-800 border-b-2 border-gray-200 focus:border-orange-500 transition-colors pr-24 pb-2"
            placeholder="ABCD 1234 EFGH"
            placeholderClass="text-gray-300 text-xl"
            value={getDisplayValue()}
            // 注意：因为我们要控制展示格式，实际逻辑略复杂，简单做法是：
            // 真实Input透明覆盖在上方，或者直接用Input但处理显示
            // 这里为了代码简洁，直接绑定 value，注意上面的 handleInput 逻辑可能需要根据实际 Taro Input 行为微调
            // 简单方案：不自动加空格显示，或者只在 onBlur 时格式化。
            // 修正方案：Input 绑定原始 code，显示时不做空格，或者使用 type="idcard"
            // value={code} // 这里绑定无空格的code更稳定，下方文字提示空格格式
            onInput={handleInput}
            maxlength={16}
          />

          {/* 右侧快捷按钮组 */}
          <View className="absolute right-0 top-2 flex items-center gap-3 z-10">
            {code.length > 0 ? (
              // 有内容时显示清空
              <View
                className="bg-gray-200 w-6 h-6 rounded-full flex items-center justify-center"
                onClick={() => setCode("")}
              >
                <Text className="text-gray-500 text-xs">✕</Text>
              </View>
            ) : (
              // 无内容时显示粘贴
              <View
                className="bg-orange-50 px-3 py-1 rounded text-orange-600 text-xs font-bold active:bg-orange-100"
                onClick={handlePaste}
              >
                粘贴
              </View>
            )}
            {/* 扫码图标 */}
            <View onClick={handleScan} className="active:opacity-70">
              <Text className="text-2xl">📸</Text>
            </View>
          </View>
        </View>

        {/* 辅助提示 */}
        <View className="mt-3 flex justify-between">
          <Text className="text-xs text-orange-500">
            {code.length > 0
              ? `已输入 ${code.length}/16 位`
              : "支持粘贴或直接扫码"}
          </Text>
        </View>
      </View>

      {/* 提交按钮 */}
      <Button
        className={`
          w-full rounded-full h-12 flex items-center justify-center text-lg font-bold text-white shadow-orange transition-all duration-300
          ${
            code.length >= 8
              ? "bg-orange-500 scale-100"
              : "bg-gray-300 scale-95 opacity-80"
          }
        `}
        disabled={code.length < 8 || loading}
        onClick={handleSubmit}
      >
        {loading ? (
          <View className="flex items-center">
            <View className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></View>
            兑换中...
          </View>
        ) : (
          "立即兑换"
        )}
      </Button>

      {/* 底部常见问题 (补充功能：减少客服压力) */}
      <View className="mt-12 w-full">
        <Text className="text-sm font-bold text-gray-700 mb-3 block">
          常见问题
        </Text>
        <View className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <View className="flex items-start">
            <Text className="text-orange-500 mr-2 text-xs">●</Text>
            <View>
              <Text className="text-xs text-gray-800 font-bold">
                兑换码在哪里找？
              </Text>
              <Text className="text-xs text-gray-500 mt-1">
                通常在实体卡的背面涂层下，或短信通知中。
              </Text>
            </View>
          </View>
          <View className="flex items-start">
            <Text className="text-orange-500 mr-2 text-xs">●</Text>
            <View>
              <Text className="text-xs text-gray-800 font-bold">
                兑换失败怎么办？
              </Text>
              <Text className="text-xs text-gray-500 mt-1">
                请检查是否输入了字母O和数字0，建议直接使用扫码。
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* --- 兑换成功弹窗 (Modal) --- */}
      {showSuccessModal && (
        <View className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 遮罩层 */}
          <View className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"></View>

          {/* 弹窗主体 */}
          <View className="modal-content bg-white w-4/5 rounded-3xl p-6 relative z-10 flex flex-col items-center">
            {/* 顶部插画 */}
            <View className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-4xl">
              🎉
            </View>

            <Text className="text-2xl font-bold text-gray-800 mb-2">
              兑换成功!
            </Text>
            <Text className="text-gray-500 text-sm mb-6">
              优惠券已放入您的卡包
            </Text>

            {/* 券展示 */}
            <View className="w-full bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center mb-6 relative overflow-hidden">
              {/* 锯齿效果示意 */}
              <View className="absolute -left-2 top-1/2 w-4 h-4 bg-white rounded-full transform -translate-y-1/2"></View>
              <View className="absolute -right-2 top-1/2 w-4 h-4 bg-white rounded-full transform -translate-y-1/2"></View>

              <View className="flex-1">
                <Text className="text-lg font-bold text-orange-600 block">
                  {successInfo?.name}
                </Text>
                <Text className="text-xs text-orange-400">
                  有效期至 2023.12.31
                </Text>
              </View>
              <Text className="text-3xl font-bold text-orange-600">
                ¥{successInfo?.amount}
              </Text>
            </View>

            <Button
              className="w-full bg-orange-500 text-white rounded-full h-11 text-base font-bold shadow-lg"
              onClick={handleCloseModal}
            >
              去查看
            </Button>

            <View
              className="mt-4 text-gray-400 text-sm py-2"
              onClick={() => setShowSuccessModal(false)}
            >
              继续兑换
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ExchangePage;
