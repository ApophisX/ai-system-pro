// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 获取承租方统计数据 获取订单数量、待支付订单数量、押金金额和收藏数量 GET /api/v1/app/statistics/lessee */
export async function AppStatisticsControllerGetLesseeStatisticsV1(options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseOutputLesseeStatisticsDto>('/api/v1/app/statistics/lessee', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取承租方订单统计数量 获取承租方各个状态的订单数量：待支付、使用中、已逾期、已完成、售后中（争议中） GET /api/v1/app/statistics/lessee/orders */
export async function AppStatisticsControllerGetLesseeOrderStatisticsV1(options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseOutputLesseeOrderStatisticsDto>('/api/v1/app/statistics/lessee/orders', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取出租方统计数据 获取已发布的资产数量、进行中的订单、待处理订单、累计收入 GET /api/v1/app/statistics/lessor */
export async function AppStatisticsControllerGetLessorStatisticsV1(options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseOutputLessorStatisticsDto>('/api/v1/app/statistics/lessor', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取出租方财务统计数据 获取累计结算、可提现余额、待入账金额。支持按 startDate、endDate 筛选时间范围，按业务发生时间过滤。 GET /api/v1/app/statistics/lessor/finance */
export async function AppStatisticsControllerGetLessorFinanceStatisticsV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppStatisticsControllerGetLessorFinanceStatisticsV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputLessorFinanceStatisticsDto>('/api/v1/app/statistics/lessor/finance', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取出租方订单统计数据 获取出租方各个状态的订单数量：待支付、使用中、已逾期、已完成、售后中（争议中） GET /api/v1/app/statistics/lessor/orders */
export async function AppStatisticsControllerGetLessorOrderStatisticsV1(options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseOutputLessorOrderStatisticsDto>('/api/v1/app/statistics/lessor/orders', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取出租方待处理订单统计数据 获取已支付、取消订单确认、逾期、已归还待确认、待归还、争议中的订单数量 GET /api/v1/app/statistics/lessor/pending-orders */
export async function AppStatisticsControllerGetLessorPendingOrderStatisticsV1(options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseOutputLessorPendingOrderStatisticsDto>(
    '/api/v1/app/statistics/lessor/pending-orders',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}
