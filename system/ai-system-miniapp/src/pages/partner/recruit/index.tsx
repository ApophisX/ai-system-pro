import { useState, useEffect } from "react";
import {
  View,
  Text,
  Input,
  Button,
  ScrollView,
  Swiper,
  SwiperItem,
} from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.less";
import { BottomSafeView } from "@/components/bottom-safe";

const RecruitPage = () => {
  const [formData, setFormData] = useState({ name: "", phone: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [joinCount, setJoinCount] = useState(12856); // 虚拟人数

  // 1. 初始化倒计时秒数：2小时45分18秒 = 9918秒
  const [timeLeft, setTimeLeft] = useState(2 * 3600 + 45 * 60 + 18);

  // 2. 定时器逻辑
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          // 倒计时结束后，重置回 2小时45分，造成“活动一直火爆”的假象
          return 2 * 3600 + 45 * 60 + 18;
        }
        return prev - 1;
      });
    }, 1000);

    // 组件卸载时清除定时器，防止内存泄漏
    return () => clearInterval(timer);
  }, []);

  // 3. 格式化时间的辅助函数 (补零：5 -> 05)
  const padZero = (num: number) => num.toString().padStart(2, "0");

  // 4. 计算时分秒
  const hours = padZero(Math.floor(timeLeft / 3600));
  const minutes = padZero(Math.floor((timeLeft % 3600) / 60));
  const seconds = padZero(timeLeft % 60);

  // 5. 扩充一下数据，确保数据量 > displayMultipleItems，这样 circular 循环才不会闪烁
  const JOIN_LIST = [
    { name: "王**", city: "北京", money: "2,300" },
    { name: "李**", city: "上海", money: "5,600" },
    { name: "张**", city: "成都", money: "1,200" },
    { name: "赵**", city: "杭州", money: "8,900" },
    { name: "刘**", city: "深圳", money: "4,500" }, // 新增
    { name: "陈**", city: "武汉", money: "3,200" }, // 新增
    { name: "杨**", city: "南京", money: "6,100" }, // 新增
  ];

  // 模拟人数增长
  useEffect(() => {
    const timer = setInterval(() => {
      setJoinCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      Taro.showToast({ title: "请填写联系方式", icon: "none" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Taro.showToast({ title: "申请提交成功！", icon: "success" });
      // 跳转到等待审核或加群页面
    }, 1500);
  };

  // 滚动至表单区域
  const scrollToForm = () => {
    Taro.createSelectorQuery()
      .select("#join-form")
      .boundingClientRect(
        (rect: Taro.NodesRef.BoundingClientRectCallbackResult) => {
          Taro.pageScrollTo({ scrollTop: rect.top, duration: 300 });
        }
      )
      .exec();
  };

  return (
    <View className="min-h-screen bg-slate-900 text-white pb-32 relative overflow-hidden">
      {/* --- 背景氛围 --- */}
      {/* 顶部放射光 */}
      <View className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[800rpx] bg-gradient-to-b from-orange-600/20 to-transparent blur-3xl pointer-events-none" />
      {/* 漂浮元素 */}
      <View className="absolute top-20 right-10 text-6xl opacity-40 float-icon z-0">
        🪙
      </View>
      <View
        className="absolute top-40 left-5 text-4xl opacity-30 float-icon z-0"
        style={{ animationDelay: "1s" }}
      >
        🚀
      </View>

      <ScrollView scrollY className="h-full z-10 relative">
        {/* 1. Hero Section (首屏冲击) */}
        <View className="pt-20 pb-10 px-6 text-center relative">
          <View className="flex inline-flex item-center px-4 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 mb-4">
            <Text className="text-yellow-400 text-xs font-bold tracking-widest">
              👑 官方唯一指定通道
            </Text>
          </View>

          <Text className="block text-5xl font-extrabold mb-2 leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
            养老万亿蓝海
          </Text>
          <Text className="block text-6xl font-black mb-6 text-gold-flow italic">
            招募城市合伙人
          </Text>

          <Text className="block text-gray-400 text-sm mb-8 px-8 leading-relaxed">
            错过淘宝，错过抖音，不要再错过
            <Text className="text-white font-bold">老龄化红利</Text>。
            0门槛入驻，坐享全城订单分成。
          </Text>

          {/* 数据看板 */}
          <View className="flex justify-center gap-6 mb-10">
            <View className="text-center">
              <Text className="block text-3xl font-bold text-white">40%</Text>
              <Text className="text-xs text-gray-500">最高分佣</Text>
            </View>
            <View className="w-px h-10 bg-gray-700"></View>
            <View className="text-center">
              <Text className="block text-3xl font-bold text-white">T+1</Text>
              <Text className="text-xs text-gray-500">极速结算</Text>
            </View>
            <View className="w-px h-10 bg-gray-700"></View>
            <View className="text-center">
              <Text className="block text-3xl font-bold text-white">
                {joinCount}
              </Text>
              <Text className="text-xs text-gray-500">已加入人数</Text>
            </View>
          </View>

          {/* 倒计时条 */}
          <View className="mx-4 bg-gradient-to-r from-red-900/50 to-slate-800 rounded-lg p-3 flex justify-between items-center border border-red-500/30">
            <View className="flex items-center">
              {/* 火焰动画: animate-pulse 让它不停闪烁 */}
              <Text className="animate-pulse mr-2 text-lg">🔥</Text>
              <Text className="text-sm font-bold text-red-100">
                本期仅剩{" "}
                <Text className="text-yellow-400 font-black text-lg mx-1">
                  15
                </Text>{" "}
                个名额
              </Text>
            </View>
            {/* 倒计时数字区域 */}
            <View className="flex gap-1 items-center">
              <View className="bg-red-600 text-white text-xs px-1.5 py-1 rounded min-w-[36rpx] text-center font-mono font-bold shadow-sm">
                {hours}
              </View>
              <Text className="text-red-400 font-bold text-xs">:</Text>

              <View className="bg-red-600 text-white text-xs px-1.5 py-1 rounded min-w-[36rpx] text-center font-mono font-bold shadow-sm">
                {minutes}
              </View>
              <Text className="text-red-400 font-bold text-xs">:</Text>

              <View className="bg-red-600 text-white text-xs px-1.5 py-1 rounded min-w-[36rpx] text-center font-mono font-bold shadow-sm">
                {seconds}
              </View>
            </View>
          </View>
        </View>

        {/* 2. 为什么加入 (痛点与红利) */}
        <View className="px-4 mb-12">
          <View className="glass-card rounded-3xl p-6">
            <Text className="text-center text-xl font-bold mb-8 block text-gold-flow">
              躺赚模式 · 管道收益
            </Text>

            <View className="grid grid-cols-2 gap-4">
              {[
                { icon: "💎", title: "高额分佣", desc: "每单最高提成40%" },
                { icon: "📈", title: "市场广阔", desc: "2.6亿老人的刚需" },
                { icon: "🛡️", title: "官方扶持", desc: "提供流量+技术支持" },
                { icon: "💰", title: "被动收入", desc: "绑定用户永久分润" },
              ].map((item, idx) => (
                <View
                  key={idx}
                  className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex flex-col items-center text-center"
                >
                  <Text className="text-3xl mb-2">{item.icon}</Text>
                  <Text className="text-white font-bold mb-1">
                    {item.title}
                  </Text>
                  <Text className="text-xs text-gray-500">{item.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 3. 收益模拟器 (刺激欲望) */}
        <View className="px-4 mb-12">
          <Text className="text-lg font-bold mb-4 flex items-center">
            <Text className="text-yellow-500 mr-2">▌</Text>
            看看你能赚多少？
          </Text>
          <View className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl p-1">
            <View className="bg-slate-900 rounded-3xl p-6">
              <View className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                <Text className="text-gray-400">假设每月推广</Text>
                <Text className="text-xl font-bold text-white">50 位老人</Text>
              </View>

              <View className="space-y-4">
                <View className="flex justify-between">
                  <Text className="text-gray-400 text-sm">服务下单分润</Text>
                  <Text className="text-yellow-400 font-bold">+ ¥3,500</Text>
                </View>
                <View className="flex justify-between">
                  <Text className="text-gray-400 text-sm">付费会员提成</Text>
                  <Text className="text-yellow-400 font-bold">+ ¥5,000</Text>
                </View>
                <View className="flex justify-between">
                  <Text className="text-gray-400 text-sm">商品复购返利</Text>
                  <Text className="text-yellow-400 font-bold">+ ¥2,000</Text>
                </View>
              </View>

              <View className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-baseline">
                <Text className="text-sm text-gray-300">月预估收益</Text>
                <View className="flex items-baseline">
                  <Text className="text-lg text-red-500 font-bold mr-1">¥</Text>
                  <Text className="text-4xl text-red-500 font-black italic">
                    10,500
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-gray-600 mt-2 text-right">
                *仅为估算，多劳多得上不封顶
              </Text>
            </View>
          </View>
        </View>

        {/* 4. 实时加入动态 (社会认同) */}
        <View className="px-4 mb-12">
          <View className="bg-slate-800 rounded-2xl p-4 h-40 overflow-hidden relative marquee-mask">
            {/* 使用 Swiper 实现垂直滚动 */}
            <Swiper
              className="h-full" // 撑满父容器高度
              vertical // 开启垂直滚动
              autoplay // 自动播放
              circular // 开启无缝循环
              interval={2000} // 滚动间隔 (毫秒)
              duration={500} // 滚动动画时长
              displayMultipleItems={4} // 一次显示4行 (重要：高度需匹配)
            >
              {JOIN_LIST.map((item, i) => (
                <SwiperItem key={i}>
                  {/* 单行内容容器：使用 flex 垂直居中 */}
                  <View className="h-full flex justify-between items-center text-xs px-1">
                    <View className="flex items-center">
                      {/* 头像占位 */}
                      <View className="w-6 h-6 rounded-full bg-gray-600 mr-2 border border-gray-500"></View>
                      <Text className="text-gray-300">
                        {item.name}{" "}
                        <Text className="text-gray-500">({item.city})</Text>
                      </Text>
                      <Text className="ml-2 text-gray-500 bg-gray-700/50 px-1 rounded scale-90">
                        刚刚加入
                      </Text>
                    </View>
                    <Text className="text-yellow-400 font-mono">
                      +¥{item.money}
                    </Text>
                  </View>
                </SwiperItem>
              ))}
            </Swiper>
          </View>
        </View>
        {/* 5. 极简表单 (收网) */}
        <View id="join-form" className="px-4 mb-8">
          <View className="glass-card rounded-3xl p-6 relative overflow-hidden">
            {/* 装饰 */}
            <View className="absolute -top-10 -right-10 w-32 h-32 bg-red-600 rounded-full blur-[50px] opacity-20" />

            <View className="mb-2">
              <Text className="text-center text-2xl font-bold mb-2">
                立即申请名额
              </Text>
              <Text className="text-center text-xs text-gray-400 mb-6">
                专属顾问将在 24h 内与您联系
              </Text>
            </View>

            <View className="space-y-4">
              <View>
                <View className="text-xs text-gray-400 mb-2 ml-1">
                  您的称呼
                </View>
                <Input
                  className="h-12 bg-slate-800/80 rounded-xl px-4 text-white border border-white/10 focus:border-yellow-500 transition-colors"
                  placeholder="请输入姓名"
                  placeholderClass="text-gray-600"
                  value={formData.name}
                  onInput={(e) =>
                    setFormData({ ...formData, name: e.detail.value })
                  }
                />
              </View>
              <View>
                <View className="text-xs text-gray-400 mb-2 ml-1">
                  联系电话
                </View>
                <Input
                  className="h-12 bg-slate-800/80 rounded-xl px-4 text-white border border-white/10 focus:border-yellow-500 transition-colors"
                  placeholder="请输入手机号"
                  type="number"
                  placeholderClass="text-gray-600"
                  value={formData.phone}
                  onInput={(e) =>
                    setFormData({ ...formData, phone: e.detail.value })
                  }
                />
              </View>
              <View>
                <View className="text-xs text-gray-400 mb-2 ml-1">
                  意向城市
                </View>
                <Input
                  className="h-12 bg-slate-800/80 rounded-xl px-4 text-white border border-white/10 focus:border-yellow-500 transition-colors"
                  placeholder="例如：北京朝阳区"
                  placeholderClass="text-gray-600"
                  value={formData.city}
                  onInput={(e) =>
                    setFormData({ ...formData, city: e.detail.value })
                  }
                />
              </View>
            </View>

            <View className="mt-8">
              <Button
                className="w-full h-14 rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-xl shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center justify-center btn-heartbeat"
                onClick={handleSubmit}
                loading={loading}
              >
                {loading ? "提交中..." : "立即抢占名额"}
              </Button>
              <Text className="text-center text-xs text-gray-500 mt-3">
                * 点击即表示同意《合伙人入驻协议》
              </Text>
            </View>
          </View>
        </View>

        {/* 底部 Logo */}
        <View className="text-center pb-8 opacity-30">
          <Text className="text-xs font-mono tracking-widest">
            ELDERLY CARE PARTNER
          </Text>
        </View>
      </ScrollView>

      {/* 底部吸底按钮 (当页面滚动未到底部时显示，这里简化为常驻但被表单区域遮挡时隐藏逻辑，或者直接做成悬浮条) */}
      <View className="fixed bottom-0 w-full bg-slate-900/90 backdrop-blur-md border-t border-white/5 p-4 z-50">
        <View className="flex items-center justify-between">
          <View>
            <Text className="text-xs text-gray-400 block">距离活动结束</Text>
            <Text className="text-yellow-500 font-bold">
              {hours}:{minutes}:{seconds}
            </Text>
          </View>
          <Button
            className="m-0 h-11 px-8 rounded-full bg-white text-slate-900 font-bold shadow-lg"
            onClick={scrollToForm}
          >
            快速报名
          </Button>
        </View>
        <BottomSafeView />
      </View>
    </View>
  );
};

export default RecruitPage;
