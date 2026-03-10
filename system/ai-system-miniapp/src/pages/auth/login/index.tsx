import { useRef, useState } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import './index.less';
import API from '@/services/API';
import { ACCESS_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY, SOURCE_PAGE_KEY, SYSTEM_IMAGES } from '@/constants/app';
import { SignInLegal } from '@/sections/login/components';

export default function Login() {
  const [isAgreed, setIsAgreed] = useState(false);
  const [shakeBtn, setShakeBtn] = useState(false);
  const isGetPhoneOpened = useRef<boolean>(false);

  // 切换勾选状态
  const handleCheck = () => {
    setIsAgreed(!isAgreed);
    // 如果勾选了，移除摇晃状态
    if (!isAgreed) setShakeBtn(false);
  };

  // 点击“假”按钮时的逻辑（未勾选协议）
  const handleFakeLogin = () => {
    // 触发摇晃动画
    setShakeBtn(true);
    // 动画结束后重置状态，以便下次还能摇晃
    setTimeout(() => setShakeBtn(false), 500);

    Taro.showToast({
      title: '请先阅读并同意协议',
      icon: 'none',
      duration: 2000,
    });
  };

  // 通过openid登录
  const loginByOpenid = async (): Promise<MyApi.OutputAuthDto | null> => {
    return new Promise(async (resolve, reject) => {
      // TODO 支持支付宝登录
      Taro.login({
        success: async e => {
          try {
            const result = await API.WeappAuth.WeappAuthControllerSignInByCodeV1({
              code: e.code,
            });
            resolve(result.data);
          } catch (error) {
            resolve(null);
          }
        },
        fail: e => {
          reject(e);
        },
      });
    });
  };

  // 设置会话
  const setSession = (session: MyApi.OutputAuthDto) => {
    Taro.setStorageSync(ACCESS_TOKEN_STORAGE_KEY, session.accessToken);
    Taro.setStorageSync(REFRESH_TOKEN_STORAGE_KEY, session.refreshToken);
  };

  // 获取手机号回调（已勾选协议）
  const getPhoneNumber = async e => {
    if (isGetPhoneOpened.current) return;
    isGetPhoneOpened.current = true;

    // 先尝试使用code2session换取手机号
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      Taro.showLoading({ title: '登录中...' });
      const result = await loginByOpenid();

      if (result) {
        setSession(result);
        Taro.showToast({ title: '登录成功', icon: 'success' });
        Taro.navigateBack({});
        Taro.setStorageSync('login_success_refresh', true);
        isGetPhoneOpened.current = false;
        return;
      }

      const { code } = e.detail;

      Taro.login({
        success: async ({ code: jsCode }) => {
          const result = await API.WeappAuth.WeappAuthControllerSignInV1({
            jsCode,
            code,
          });
          if (result.data) {
            setSession(result.data);
            Taro.setStorageSync('login_success_refresh', true);
            Taro.showToast({ title: '登录成功', icon: 'success' });
            Taro.navigateBack({});
          } else {
            Taro.showToast({ title: '登录失败，请重试...', icon: 'none' });
          }
        },
        complete: () => {
          isGetPhoneOpened.current = false;
        },
      });

      // setTimeout(() => {
      //   Taro.hideLoading();
      //   Taro.showToast({ title: "欢迎回家", icon: "success" });
      //   // 跳转到首页
      //   Taro.switchTab({ url: "/pages/index/index" });
      // }, 1500);
    } else {
      // 用户拒绝授权
      Taro.showToast({ title: '为了提供服务，请授权登录', icon: 'none' });
    }
  };

  useLoad(params => {
    console.log('>>>>>>>>>>>');
    console.log(params);
    Taro.setStorageSync(SOURCE_PAGE_KEY, 'login');
  });

  return (
    <View className="min-h-screen flex flex-col bg-white relative overflow-hidden">
      {/* 1. 背景装饰 (顶部柔和渐变与圆弧) */}
      <View className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-teal-50 to-white -z-10 rounded-b-[60px]" />
      <View className="absolute -top-20 -right-20 w-60 h-60 bg-teal-100/50 rounded-full blur-3xl" />
      <View className="absolute top-20 -left-10 w-40 h-40 bg-orange-100/50 rounded-full blur-3xl" />

      {/* 2. 核心内容区 */}
      <View className="flex-1 flex flex-col items-center justify-center px-8 w-full">
        {/* Logo 与 欢迎语 */}
        <View className="flex flex-col items-center animate-slide-up">
          <View className="w-28 h-28 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 animate-float">
            <Image src={SYSTEM_IMAGES.logo} className="w-16 h-16" />
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-2">一键登录 · 安全快捷</Text>
          <Text className="text-sm text-gray-400 tracking-wider">尊享服务 · 贴心守护</Text>
        </View>

        {/* 占位，把按钮挤到下面一点 */}
        <View className="h-20" />

        {/* 3. 登录操作区 (Login Action) */}
        <View className="w-full animate-slide-up delay-200">
          {/* 
             关键交互逻辑：
             如果不勾选：显示普通 View/Button，点击触发 Shake 动画。
             如果勾选：显示真正的 open-type Button。
          */}
          <View className={shakeBtn ? 'animate-shake' : ''}>
            {!isAgreed ? (
              <Button
                className="w-full h-12 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-200 active:bg-teal-700 transition-all font-bold text-base border-none"
                onClick={handleFakeLogin}
              >
                手机号快捷登录
              </Button>
            ) : (
              <Button
                className="w-full h-12 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-200 active:scale-[0.98] transition-all font-bold text-base border-none"
                openType="getPhoneNumber"
                onGetPhoneNumber={getPhoneNumber}
              >
                手机号快捷登录
              </Button>
            )}
          </View>

          {/* <Button
            className="mt-4 w-full h-12 bg-transparent text-gray-500 rounded-full flex items-center justify-center font-medium text-sm border-none active:bg-gray-50 border "
            style={{ borderWidth: 1, borderStyle: "solid" }}
            onClick={() => Taro.navigateTo({ url: "/pages/login/phone" })} // 备用方案
          >
            手机号码验证登录
          </Button> */}
        </View>
      </View>

      {/* 4. 底部协议区域 (Legal) */}
      <View className="pb-10 px-8 animate-slide-up delay-300">
        <SignInLegal isAgreed={isAgreed} handleCheck={handleCheck} />
      </View>
    </View>
  );
}
