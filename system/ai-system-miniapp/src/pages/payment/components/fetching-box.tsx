import { View, Text } from '@tarojs/components';
import { PaymentType, PaymentTypeConfig } from '../constants';

type FetchingBoxProps = {
  paymentType: PaymentType;
  typeConfig: PaymentTypeConfig;
};
export function FetchingBox({ paymentType, typeConfig }: FetchingBoxProps) {
  return (
    <View
      className={`bg-gradient-to-br from-white ${typeConfig.bgGradient}/30 rounded-2xl p-10 mb-4 shadow-xl border ${paymentType === 'deposit' ? 'border-blue-100/50' : paymentType === 'installment' || paymentType === 'renewal' ? 'border-purple-100/50' : paymentType === 'overdue-fee' ? 'border-red-100/50' : 'border-teal-100/50'} animate-fade-in overflow-hidden relative`}
    >
      {/* 背景装饰 */}
      <View
        className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-xl ${paymentType === 'deposit' ? 'bg-blue-100/20' : paymentType === 'installment' || paymentType === 'renewal' ? 'bg-purple-100/20' : paymentType === 'overdue-fee' ? 'bg-red-100/20' : 'bg-teal-100/20'}`}
      />
      <View
        className={`absolute bottom-0 left-0 w-24 h-24 rounded-full -ml-12 -mb-12 blur-xl ${paymentType === 'deposit' ? 'bg-blue-200/20' : paymentType === 'installment' || paymentType === 'renewal' ? 'bg-purple-200/20' : paymentType === 'overdue-fee' ? 'bg-red-200/20' : 'bg-teal-200/20'}`}
      />

      <View className="flex flex-col items-center justify-center relative z-10">
        {/* 主加载动画 - 多层旋转圆环 */}
        <View className="relative w-24 h-24 mb-8">
          {/* 外层旋转圆环 - 大圆 */}
          <View
            className={`absolute top-0 left-0 right-0 bottom-0 border-4 rounded-full ${paymentType === 'deposit' ? 'border-blue-100/60' : paymentType === 'installment' || paymentType === 'renewal' ? 'border-purple-100/60' : paymentType === 'overdue-fee' ? 'border-red-100/60' : 'border-teal-100/60'}`}
          />
          <View
            className={`absolute top-0 left-0 right-0 bottom-0 border-4 border-transparent rounded-full animate-spin-slow ${paymentType === 'deposit' ? 'border-t-blue-500' : paymentType === 'installment' || paymentType === 'renewal' ? 'border-t-purple-500' : paymentType === 'overdue-fee' ? 'border-t-red-500' : 'border-t-teal-500'}`}
          />

          {/* 中层旋转圆环 - 中圆 */}
          <View
            className={`absolute top-3 left-3 right-3 bottom-3 border-3 rounded-full ${paymentType === 'deposit' ? 'border-blue-50/80' : paymentType === 'installment' || paymentType === 'renewal' ? 'border-purple-50/80' : paymentType === 'overdue-fee' ? 'border-red-50/80' : 'border-teal-50/80'}`}
          />
          <View
            className={`absolute top-3 left-3 right-3 bottom-3 border-3 border-transparent rounded-full animate-spin-reverse ${paymentType === 'deposit' ? 'border-r-blue-400' : paymentType === 'installment' || paymentType === 'renewal' ? 'border-r-purple-400' : paymentType === 'overdue-fee' ? 'border-r-red-400' : 'border-r-teal-400'}`}
          />

          {/* 内层旋转圆环 - 小圆 */}
          <View
            className={`absolute top-6 left-6 right-6 bottom-6 border-2 rounded-full ${paymentType === 'deposit' ? 'border-blue-100/50' : paymentType === 'installment' || paymentType === 'renewal' ? 'border-purple-100/50' : paymentType === 'overdue-fee' ? 'border-red-100/50' : 'border-teal-100/50'}`}
          />
          <View
            className={`absolute top-6 left-6 right-6 bottom-6 border-2 border-transparent rounded-full animate-spin-slow ${paymentType === 'deposit' ? 'border-b-blue-300' : paymentType === 'installment' || paymentType === 'renewal' ? 'border-b-purple-300' : paymentType === 'overdue-fee' ? 'border-b-red-300' : 'border-b-teal-300'}`}
          />

          {/* 中心脉冲圆点 */}
          <View className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
            <View
              className={`w-4 h-4 rounded-full animate-pulse shadow-lg ${paymentType === 'deposit' ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-200' : paymentType === 'installment' || paymentType === 'renewal' ? 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-200' : paymentType === 'overdue-fee' ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-200' : 'bg-gradient-to-br from-teal-400 to-teal-600 shadow-teal-200'}`}
            />
          </View>
        </View>

        {/* 三个跳动的圆点 */}
        <View className="flex flex-row items-center justify-center mb-6" style={{ gap: '10px' }}>
          <View
            className={`w-3 h-3 rounded-full animate-bounce-delay-1 shadow-md ${paymentType === 'deposit' ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-200' : paymentType === 'installment' || paymentType === 'renewal' ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-200' : paymentType === 'overdue-fee' ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-200' : 'bg-gradient-to-br from-teal-500 to-teal-600 shadow-teal-200'}`}
          />
          <View
            className={`w-3 h-3 rounded-full animate-bounce-delay-2 shadow-md ${paymentType === 'deposit' ? 'bg-gradient-to-br from-blue-400 to-blue-500 shadow-blue-200' : paymentType === 'installment' || paymentType === 'renewal' ? 'bg-gradient-to-br from-purple-400 to-purple-500 shadow-purple-200' : paymentType === 'overdue-fee' ? 'bg-gradient-to-br from-red-400 to-red-500 shadow-red-200' : 'bg-gradient-to-br from-teal-400 to-teal-500 shadow-teal-200'}`}
          />
          <View
            className={`w-3 h-3 rounded-full animate-bounce-delay-3 shadow-md ${paymentType === 'deposit' ? 'bg-gradient-to-br from-blue-300 to-blue-400 shadow-blue-200' : paymentType === 'installment' || paymentType === 'renewal' ? 'bg-gradient-to-br from-purple-300 to-purple-400 shadow-purple-200' : paymentType === 'overdue-fee' ? 'bg-gradient-to-br from-red-300 to-red-400 shadow-red-200' : 'bg-gradient-to-br from-teal-300 to-teal-400 shadow-teal-200'}`}
          />
        </View>

        {/* 加载文字 */}
        <View className="text-center mb-4">
          <Text className="text-gray-700 text-base font-semibold mb-1 block">正在加载订单信息</Text>
          <Text className="text-gray-400 text-xs">请稍候，马上就好...</Text>
        </View>

        {/* 进度条动画 */}
        <View className="w-40 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden shadow-inner">
          <View
            className={`h-full rounded-full animate-progress shadow-sm ${paymentType === 'deposit' ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400' : paymentType === 'installment' || paymentType === 'renewal' ? 'bg-gradient-to-r from-purple-400 via-purple-500 to-purple-400' : paymentType === 'overdue-fee' ? 'bg-gradient-to-r from-red-400 via-red-500 to-red-400' : 'bg-gradient-to-r from-teal-400 via-teal-500 to-teal-400'}`}
            style={{ width: '50%' }}
          />
        </View>
      </View>
    </View>
  );
}
