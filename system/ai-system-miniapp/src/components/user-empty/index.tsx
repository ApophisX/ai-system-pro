import { ACCESS_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY, SYSTEM_IMAGES } from '@/constants/app';
import API from '@/services/API';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import { useRef, useState } from 'react';
import './index.less';
import { useAuthContext } from '@/auth/hooks';
import { SignInLegal } from '@/sections/login/components';

type Props = {
  onLoginSuccess?: () => void;
};

export default function UserEmpty({ onLoginSuccess }: Props) {
  const [isAgreed, setIsAgreed] = useState(false);
  const [shakeBtn, setShakeBtn] = useState(false);
  const isGetPhoneOpened = useRef<boolean>(false);
  const { checkUserSession, user } = useAuthContext();

  const isFirst = useRef(true);

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
        isGetPhoneOpened.current = false;
        onLoginSuccess?.();
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
            Taro.showToast({ title: '登录成功', icon: 'success' });
            onLoginSuccess?.();
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

  useDidShow(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (!user) {
      checkUserSession?.();
    }
    isFirst.current = true;
  });

  usePullDownRefresh(async () => {
    try {
      await checkUserSession?.();
    } catch (error) {
    } finally {
      Taro.stopPullDownRefresh();
    }
  });

  return (
    <View
      className="min-h-screen flex flex-col items-center justify-center px-8 safe-area-bottom"
      style={{ height: '100vh' }}
    >
      {/* 背景装饰 */}
      <View className="absolute inset-0 overflow-hidden pointer-events-none">
        <View className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-teal-50/80 via-indigo-50/50 to-transparent" />
        <View className="absolute -top-24 -right-24 w-72 h-72 bg-teal-200/40 rounded-full blur-3xl" />
        <View className="absolute top-1/3 -left-16 w-48 h-48 bg-indigo-200/30 rounded-full blur-3xl" />
        <View className="absolute bottom-1/4 right-0 w-40 h-40 bg-amber-200/30 rounded-full blur-3xl" />
      </View>

      {/* 主内容区 */}
      <View className="relative z-10 flex flex-col items-center w-full max-w-sm">
        {/* 头像占位 */}
        <View className="w-28 h-28 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 animate-float">
          <Image src={SYSTEM_IMAGES.logo} className="w-16 h-16" />
        </View>

        {/* 标题与描述 */}
        <Text className="text-xl font-semibold text-gray-800 mb-2 text-center animate-fade-in-up delay-100">
          登录后体验完整功能
        </Text>
        <Text className="text-sm text-gray-500 text-center leading-relaxed mb-10 animate-fade-in-up delay-200">
          收藏商品、发布商品、管理订单 {'\n'} 一站式服务等你探索
        </Text>

        {/* 去登录按钮 */}
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
      {/* 底部提示 */}
      <View className="py-10 animate-slide-up delay-300">
        <SignInLegal isAgreed={isAgreed} handleCheck={handleCheck} />
      </View>
    </View>
  );
}
