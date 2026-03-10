// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 查询支付记录 查询当前用户的支付记录 GET /api/v1/app/payment */
export async function PaymentControllerQueryPaymentsV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.PaymentControllerQueryPaymentsV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputPaymentDtoArray>('/api/v1/app/payment', {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',

      ...params,
    },
    ...(options || {}),
  });
}

/** 获取支付详情 根据支付 ID 获取支付详情 GET /api/v1/app/payment/${param0} */
export async function PaymentControllerGetPaymentByIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.PaymentControllerGetPaymentByIdV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputPaymentDto>(`/api/v1/app/payment/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 创建退款 创建退款申请 POST /api/v1/app/payment/refund */
export async function PaymentControllerCreateRefundV1(body: MyApi.CreateRefundDto, options?: { [key: string]: any }) {
  return request<any>('/api/v1/app/payment/refund', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
