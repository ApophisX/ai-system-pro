// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 获取信用账户 获取当前用户的信用分、等级、免押/分期权益 GET /api/v1/app/credit/account */
export async function AppCreditControllerGetAccountV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppCreditControllerGetAccountV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputCreditAccountDto>('/api/v1/app/credit/account', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取信用记录 分页查询当前用户的信用事件流水 GET /api/v1/app/credit/records */
export async function AppCreditControllerGetRecordsV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppCreditControllerGetRecordsV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputCreditRecordDtoArray>('/api/v1/app/credit/records', {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',

      ...params,
    },
    ...(options || {}),
  });
}
