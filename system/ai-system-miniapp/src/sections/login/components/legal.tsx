import { paths, webPaths } from '@/route/paths';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

type Props = {
  isAgreed: boolean;
  handleCheck: () => void;
};
export function SignInLegal({ isAgreed, handleCheck }: Props) {
  return (
    <View className="flex items-start justify-center">
      {/* 自定义 Checkbox 交互区域，扩大点击范围 */}
      <View className="flex items-center pt-0.5 pr-2" onClick={handleCheck}>
        <View
          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
            isAgreed ? 'bg-teal-600 border-teal-600' : 'border-gray-300 bg-white'
          }`}
        >
          {isAgreed && <Text className="text-white text-[14px] font-bold">✓</Text>}
        </View>
      </View>

      <View className="text-xs text-gray-400 leading-5">
        <Text onClick={handleCheck}>我已阅读并同意 </Text>
        <Text
          className="text-teal-600 font-medium"
          onClick={() => {
            Taro.navigateTo({ url: paths.webview(webPaths.terms.userAgreement) });
          }}
        >
          《用户服务协议》
        </Text>
        <Text> 和 </Text>
        <Text
          className="text-teal-600 font-medium"
          onClick={() => {
            Taro.navigateTo({ url: paths.webview(webPaths.terms.privacyPolicy) });
          }}
        >
          《隐私政策》
        </Text>
        <Text onClick={handleCheck}>，未注册手机号登录时将自动创建账号。</Text>
      </View>
    </View>
  );
}
