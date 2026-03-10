import wx from 'weixin-js-sdk';

/**
 * 支付订单
 * @param order
 * @returns
 */
export function payOrder(order: MyApi.OutputRentalOrderDto) {
  return pay(order, 'order');
}

/**
 * 支付押金
 */
export function payDeposit(order: MyApi.OutputRentalOrderDto) {
  return pay(order, 'deposit');
}

/**
 * 支付超时费用
 */
export function payOverdueFee(order: MyApi.OutputRentalOrderDto) {
  return pay(order, 'overdue-fee');
}

/**
 * 支付续租租金
 */
export function payRenewal(order: MyApi.OutputRentalOrderDto, paymentId: string) {
  return new Promise((resolve, reject) => {
    const payUrlParams = new URLSearchParams();
    payUrlParams.set('orderId', order.id);
    payUrlParams.set('orderNo', order.orderNo);
    payUrlParams.set('paymentId', paymentId);
    payUrlParams.set('type', 'renewal');
    wx.miniProgram.navigateTo({
      url: '/pages/payment/index?' + payUrlParams.toString(),
      success: () => {
        resolve(true);
      },
      fail: () => {
        reject('跳转支付续租页面失败');
      },
    });
  });
}

/**
 * 授权免押
 */
export function authorizeFreeDeposit(order: MyApi.OutputRentalOrderDto) {
  return new Promise((resolve, reject) => {
    const payUrlParams = new URLSearchParams();
    payUrlParams.set('orderId', order.id);
    payUrlParams.set('orderNo', order.orderNo);
    payUrlParams.set('type', 'authorize-free-deposit');
    wx.miniProgram.navigateTo({
      url: '/pages/payment/index?' + payUrlParams.toString(),
      success: (result: any) => {
        resolve(true);
      },
      fail: (error: any) => {
        reject('跳转授权免押页面失败');
      },
    });
  });
}

/**
 * 支付分期
 */
export function payInstallment(order: MyApi.OutputRentalOrderDto, paymentId: string) {
  return new Promise((resolve, reject) => {
    const payUrlParams = new URLSearchParams();
    payUrlParams.set('orderId', order.id);
    payUrlParams.set('orderNo', order.orderNo);
    payUrlParams.set('paymentId', paymentId);
    payUrlParams.set('type', 'installment');
    wx.miniProgram.navigateTo({
      url: '/pages/payment/index?' + payUrlParams.toString(),
      success: (result: any) => {
        resolve(true);
      },
      fail: (error: any) => {
        reject('跳转支付分期页面失败');
      },
    });
  });
}

/**
 * 支付
 */
function pay(
  order: MyApi.OutputRentalOrderDto,
  type: 'order' | 'deposit' | 'overdue-fee' | 'installment' | 'renewal'
) {
  return new Promise((resolve, reject) => {
    const payUrlParams = new URLSearchParams();
    payUrlParams.set('orderId', order.id);
    payUrlParams.set('orderNo', order.orderNo);
    payUrlParams.set('type', type);
    wx.miniProgram.navigateTo({
      url: '/pages/payment/index?' + payUrlParams.toString(),
      success: (result: any) => {
        resolve(true);
      },
      fail: (error: any) => {
        reject('跳转支付页面失败');
      },
    });
  });
}
