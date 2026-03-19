import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import API from '@/services/API';
import './index.less';
import { PAYMENT_RESULT_STORAGE_KEY, SOURCE_PAGE_KEY } from '@/constants/app';
import { ErrorMessage, ErrorPlaceholder, FetchingBox, PaymentTip, SectionOrderInfo } from './components';
import { PAYMENT_TYPES, PAYMENT_TYPE_CONFIG, PaymentType } from './constants';

type PaymentParams = {
  orderId?: string;
  orderNo?: string;
  returnUrl?: string;
  type?: PaymentType;
  paymentId?: string;
};

export default function Payment() {
  const router = useRouter<PaymentParams>();
  const { orderId, orderNo, type, paymentId } = router.params;
  const [loading, setLoading] = useState(false);

  const [fetchingOrder, setFetchingOrder] = useState(true);

  const isFetchingOrder = useRef(false);

  const [error, setError] = useState<string>('');
  const [orderInfo, setOrderInfo] = useState<MyApi.OutputRentalOrderDto | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<MyApi.OutputPaymentDto | null>(null);

  // 验证支付类型
  const paymentType: PaymentType = type && PAYMENT_TYPES.includes(type) ? (type as PaymentType) : 'order';

  const typeConfig = PAYMENT_TYPE_CONFIG[paymentType];

  // 处理支付
  const handlePayment = useCallback(async () => {
    if (!orderId) {
      Taro.showToast({
        title: '缺少订单ID',
        icon: 'none',
        duration: 2000,
      });
      setTimeout(Taro.navigateBack, 1500);
      return;
    }

    try {
      setLoading(true);
      let paymentResult;
      if (paymentType === 'deposit') {
        paymentResult = await API.AppRentalOrderLessee.AppRentalOrderLesseeControllerPayDepositV1(
          { id: orderId },
          {
            orderId: orderId,
            provider: 'wechat',
          },
        );
      } else if (paymentType === 'installment' && paymentId) {
        paymentResult = await API.AppRentalOrderLessee.AppRentalOrderLesseeControllerPayInstallmentV1(
          { id: orderId },
          {
            orderId: orderId,
            provider: 'wechat',
            paymentId: paymentId,
          },
        );
      } else if (paymentType === 'overdue-fee') {
        paymentResult = await API.AppRentalOrderLessee.AppRentalOrderLesseeControllerPayOverdueUseFeeV1(
          { id: orderId },
          {
            provider: 'wechat',
          },
        );
      } else if (paymentType === 'order') {
        paymentResult = await API.AppRentalOrderLessee.AppRentalOrderLesseeControllerPayOrderV1(
          { id: orderId },
          {
            orderId: orderId,
            provider: 'wechat',
          },
        );
      } else if (paymentType === 'renewal' && paymentId) {
        paymentResult = await API.RentalOrderRenew.RentalOrderRenewControllerPayRenewalV1(
          { orderId: orderId },
          {
            paymentId: paymentId,
            provider: 'wechat',
          },
        );
      } else {
        throw new Error('暂不支持的支付方式');
      }

      if (paymentResult.data && paymentResult.data.wxJsapiPay) {
        Taro.requestPayment({
          ...paymentResult.data.wxJsapiPay,
          success: () => {
            console.log('支付成功');
            Taro.setStorageSync(PAYMENT_RESULT_STORAGE_KEY, 'success');
            Taro.navigateBack();
            setLoading(false);
          },
          fail: err => {
            console.log('支付失败', err);
            Taro.setStorageSync(PAYMENT_RESULT_STORAGE_KEY, 'cancel');
            setLoading(false);
          },
        });
      }
    } catch (error) {
      const message = error?.message || '支付失败，请重试';
      setError(message);
      setLoading(false);
      Taro.showToast({
        title: message,
        icon: 'none',
        duration: 2000,
      });
    }
  }, []);

  // 验证支付类型
  useEffect(() => {
    if (type && !PAYMENT_TYPES.includes(type)) {
      setError(
        `无效的支付类型: ${type}。支持的支付类型：订单支付(order)、押金支付(deposit)、分期支付(installment)、超时费用支付(overdue-fee)、续租支付(renewal)`,
      );
      setFetchingOrder(false);
      setTimeout(() => {
        Taro.navigateBack();
      }, 3000);
    }
  }, [type]);

  // 获取订单信息、支付信息、发起支付
  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) {
        Taro.showToast({ title: '缺少订单ID', icon: 'none', duration: 2000 });
        setTimeout(Taro.navigateBack, 3000);
        return;
      }
      if (isFetchingOrder.current) return;
      isFetchingOrder.current = true;

      if (type && !PAYMENT_TYPES.includes(type)) {
        setError(`无效的支付类型: ${type}。支持的支付类型：订单支付、押金支付、分期支付、超时费用支付、续租支付`);
        return;
      }

      if (paymentType === 'renewal' && !paymentId) {
        setError('缺少续租支付单ID，请从续租页面重新进入');
        return;
      }

      setFetchingOrder(true);
      setError('');

      const needPaymentInfo = (paymentType === 'renewal' || paymentType === 'installment') && paymentId;

      const fetchPaymentInfo = async () => {
        const res = await API.AppPayment.PaymentControllerGetPaymentByIdV1({
          id: paymentId!,
        });
        return res.data;
      };

      let orderInfoData: MyApi.OutputRentalOrderDto | null = null;
      let paymentInfoData: MyApi.OutputPaymentDto | null = null;

      // 1. 获取订单信息
      try {
        const orderResult = await API.AppRentalOrderLessee.AppRentalOrderLesseeControllerGetOrderByIdV1({
          id: orderId,
        });
        orderInfoData = orderResult.data ?? null;
        if (orderInfoData) setOrderInfo(orderInfoData);
      } catch (err: any) {
        if (paymentType !== 'renewal' || !paymentId) {
          setError(err?.message || '获取信息失败，请重试');
          return;
        }
        // 续租降级：订单失败仍尝试获取支付信息
      }

      // 2. 获取支付信息（分期/续租）
      if (needPaymentInfo) {
        try {
          paymentInfoData = await fetchPaymentInfo();
          if (paymentInfoData) setPaymentInfo(paymentInfoData);
        } catch (err: any) {
          setError(err?.message || (paymentType === 'renewal' ? '获取续租支付信息失败' : '获取支付信息失败'));
          return;
        }
      }

      // 3. 续租降级：订单失败但支付信息成功时，清除错误并发起支付
      if (paymentType === 'renewal' && !orderInfoData && paymentInfoData) {
        setError('');
      }

      // 4. 发起支付（无需 paymentInfo 的类型直接发起；需要的类型则需已获取成功）
      const canTriggerPayment = !needPaymentInfo || paymentInfoData;
      if (canTriggerPayment) {
        await handlePayment();
      }
    };

    const run = async () => {
      try {
        await fetchData();
      } finally {
        setFetchingOrder(false);
        isFetchingOrder.current = false;
      }
    };
    run();
  }, [orderId, paymentType, paymentId, handlePayment]);

  useDidShow(() => {
    Taro.setStorageSync(SOURCE_PAGE_KEY, 'payment');
  });

  const isInstallment = paymentType === 'installment' && paymentInfo && orderInfo;
  const isRenewal = paymentType === 'renewal' && paymentInfo;

  const showError =
    (!fetchingOrder && !orderInfo && !error) ||
    (paymentType === 'installment' && paymentId && !paymentInfo) ||
    (paymentType === 'renewal' && paymentId && !paymentInfo);

  return (
    <View
      // 可滚动
      className={`min-h-screen bg-gradient-to-b ${typeConfig.bgGradient} via-white to-gray-50 overflow-y-auto pb-12`}
    >
      {/* 顶部装饰性背景 */}
      <View className={`relative bg-gradient-to-r ${typeConfig.color} pt-12 pb-20 px-6 overflow-hidden`}>
        <View
          className={`absolute top-0 right-0 w-64 h-64 bg-opacity-20 rounded-full opacity-20 -mr-32 -mt-32 ${paymentType === 'deposit' ? 'bg-blue-400' : paymentType === 'installment' || paymentType === 'renewal' ? 'bg-purple-400' : paymentType === 'overdue-fee' ? 'bg-red-400' : 'bg-teal-400'}`}
        />
        <View
          className={`absolute bottom-0 left-0 w-48 h-48 bg-opacity-20 rounded-full opacity-20 -ml-24 -mb-24 ${paymentType === 'deposit' ? 'bg-blue-300' : paymentType === 'installment' || paymentType === 'renewal' ? 'bg-purple-300' : paymentType === 'overdue-fee' ? 'bg-red-300' : 'bg-teal-300'}`}
        />

        <View className="relative z-10 text-center">
          <View className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-lg">
            <Text className="text-4xl">{typeConfig.icon}</Text>
          </View>
          <Text className="text-white text-2xl font-bold block mb-2">{typeConfig.title}</Text>
          {orderNo && (
            <View className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 inline-block mt-2 shadow-md">
              <Text className="text-white text-xs font-mono">订单号: {orderNo}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 主要内容区域 */}
      <View className="px-4 -mt-10 relative z-10">
        {/* 加载状态 */}
        {fetchingOrder && <FetchingBox paymentType={paymentType} typeConfig={typeConfig} />}

        {/* 支付信息卡片 */}
        {!fetchingOrder && (orderInfo || (paymentType === 'renewal' && paymentInfo)) && (
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-xl border border-gray-100 animate-fade-in overflow-hidden relative">
            {/* 背景装饰 */}
            <View
              className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -mr-16 -mt-16 blur-xl ${paymentType === 'deposit' ? 'bg-blue-200' : paymentType === 'installment' || paymentType === 'renewal' ? 'bg-purple-200' : paymentType === 'overdue-fee' ? 'bg-red-200' : 'bg-teal-200'}`}
            />

            {/* 订单支付 */}
            {paymentType === 'order' && <SectionOrderInfo orderInfo={orderInfo} />}
          </View>
        )}

        {/* 无订单信息时的占位 */}
        {showError && !fetchingOrder && <ErrorPlaceholder />}

        {/* 错误提示 */}
        {error && !fetchingOrder && <ErrorMessage message={error} />}

        {/* 提示信息 */}
        {!fetchingOrder && (orderInfo || (paymentType === 'renewal' && paymentInfo)) && (
          <PaymentTip paymentType={paymentType} />
        )}

        {/* 支付按钮 */}
        <View className="fixed bottom-0 left-0 w-full bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 py-4 safe-area-bottom">
          <Button
            className={`w-full rounded-full py-4 text-base font-bold shadow-lg transition-all ${
              loading || !orderId || fetchingOrder
                ? 'bg-gray-300 text-gray-500'
                : `bg-gradient-to-r ${(orderInfo?.overdueStatus ?? 'none') === 'none' ? 'from-teal-600 to-teal-500' : 'from-red-600 to-red-500'} text-white active:scale-95 active:shadow-md`
            }`}
            // loading={loading}
            disabled={loading || !orderId || fetchingOrder}
            onClick={handlePayment}
            style={{
              border: 'none',
              lineHeight: 'normal',
            }}
          >
            {loading ? (
              <View className="flex items-center justify-center">
                <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                <Text>支付中...</Text>
              </View>
            ) : fetchingOrder ? (
              <View className="flex items-center justify-center">
                <Text>加载中...</Text>
              </View>
            ) : (
              <View className="flex items-center justify-center">
                <Text className="mr-2">立即支付</Text>
                <Text>→</Text>
              </View>
            )}
          </Button>
        </View>
      </View>

      {/* 底部安全区域占位 */}
      <View className="h-20" />
    </View>
  );
}
