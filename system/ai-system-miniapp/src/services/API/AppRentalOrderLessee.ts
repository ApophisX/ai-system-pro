// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 查询订单列表（承租方） 查询当前用户作为承租方的订单列表 GET /api/v1/app/rental-order/lessee */
export async function AppRentalOrderLesseeControllerQueryOrdersV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLesseeControllerQueryOrdersV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputRentalOrderDto[]>('/api/v1/app/rental-order/lessee', {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',

      ...params,
    },
    ...(options || {}),
  });
}

/** 创建订单 创建租赁订单 POST /api/v1/app/rental-order/lessee */
export async function AppRentalOrderLesseeControllerCreateOrderV1(
  body: MyApi.CreateRentalOrderDto,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputRentalOrderDto>('/api/v1/app/rental-order/lessee', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取订单详情 根据订单 ID 获取订单详情（承租方） GET /api/v1/app/rental-order/lessee/${param0} */
export async function AppRentalOrderLesseeControllerGetOrderByIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLesseeControllerGetOrderByIdV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(`/api/v1/app/rental-order/lessee/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除订单 删除租赁订单,未支付订单可以删除（软删除） DELETE /api/v1/app/rental-order/lessee/${param0} */
export async function AppRentalOrderLesseeControllerDeleteOrderV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLesseeControllerDeleteOrderV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/app/rental-order/lessee/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 取消订单 取消租赁订单。待支付状态可直接取消；仅支付押金时可直接取消；已支付租金和押金时需要出租方同意 PUT /api/v1/app/rental-order/lessee/${param0}/cancel */
export async function AppRentalOrderLesseeControllerCancelOrderV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLesseeControllerCancelOrderV1Params,
  body: MyApi.CancelRentalOrderDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(`/api/v1/app/rental-order/lessee/${param0}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 取消取消订单申请 取消承租方的取消订单申请 PUT /api/v1/app/rental-order/lessee/${param0}/cancel-cancel */
export async function AppRentalOrderLesseeControllerRevokeCancelOrderV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLesseeControllerRevokeCancelOrderV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(`/api/v1/app/rental-order/lessee/${param0}/cancel-cancel`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 确认押金扣款申请 承租方对押金扣款申请进行确认（同意或拒绝） POST /api/v1/app/rental-order/lessee/${param0}/confirm-deposit-deduction */
export async function AppRentalOrderLesseeControllerConfirmDepositDeductionV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLesseeControllerConfirmDepositDeductionV1Params,
  body: MyApi.ConfirmDepositDeductionDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(
    `/api/v1/app/rental-order/lessee/${param0}/confirm-deposit-deduction`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    },
  );
}

/** 确认收货 承租方确认收货，订单进入使用中状态并开始计算租金 POST /api/v1/app/rental-order/lessee/${param0}/confirm-receipt */
export async function AppRentalOrderLesseeControllerConfirmReceiptV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLesseeControllerConfirmReceiptV1Params,
  body: MyApi.ConfirmReceiptDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(`/api/v1/app/rental-order/lessee/${param0}/confirm-receipt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 支付押金/押金免押 支付租赁订单押金/押金免押 POST /api/v1/app/rental-order/lessee/${param0}/pay-deposit */
export async function AppRentalOrderLesseeControllerPayDepositV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLesseeControllerPayDepositV1Params,
  body: MyApi.PayRentalOrderDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputPayDepositResultDto>(`/api/v1/app/rental-order/lessee/${param0}/pay-deposit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 支付分期账单 支付租赁订单分期账单 POST /api/v1/app/rental-order/lessee/${param0}/pay-installment */
export async function AppRentalOrderLesseeControllerPayInstallmentV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLesseeControllerPayInstallmentV1Params,
  body: MyApi.PayInstallmentDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputPayRentalOrderResultDto>(
    `/api/v1/app/rental-order/lessee/${param0}/pay-installment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    },
  );
}

/** 支付订单 支付租赁订单 POST /api/v1/app/rental-order/lessee/${param0}/pay-order */
export async function AppRentalOrderLesseeControllerPayOrderV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLesseeControllerPayOrderV1Params,
  body: MyApi.PayRentalOrderDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputPayRentalOrderResultDto>(
    `/api/v1/app/rental-order/lessee/${param0}/pay-order`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    },
  );
}

/** 支付超时使用费用 支付租赁订单超时使用费用 POST /api/v1/app/rental-order/lessee/${param0}/pay-overdue-use-fee */
export async function AppRentalOrderLesseeControllerPayOverdueUseFeeV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLesseeControllerPayOverdueUseFeeV1Params,
  body: MyApi.PayOverdueUseFeeDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputPayRentalOrderResultDto>(
    `/api/v1/app/rental-order/lessee/${param0}/pay-overdue-use-fee`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    },
  );
}

/** 归还资产 承租方归还资产，提交归还申请后订单进入「已归还待确认」状态 POST /api/v1/app/rental-order/lessee/${param0}/return-asset */
export async function AppRentalOrderLesseeControllerReturnAssetV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLesseeControllerReturnAssetV1Params,
  body: MyApi.ReturnAssetDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(`/api/v1/app/rental-order/lessee/${param0}/return-asset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
