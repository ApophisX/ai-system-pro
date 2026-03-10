// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 获取消息列表 获取当前用户的消息列表，支持分页、筛选、搜索 GET /api/v1/app/message */
export async function AppMessageControllerGetListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppMessageControllerGetListV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputMessageDtoArray>('/api/v1/app/message', {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',

      ...params,
    },
    ...(options || {}),
  });
}

/** 获取消息详情 获取指定消息的详细信息，查看时自动标记为已读 GET /api/v1/app/message/${param0} */
export async function AppMessageControllerGetByIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppMessageControllerGetByIdV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputMessageDto>(`/api/v1/app/message/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新消息 更新消息状态，如标记为已读 PUT /api/v1/app/message/${param0} */
export async function AppMessageControllerUpdateV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppMessageControllerUpdateV1Params,
  body: MyApi.UpdateMessageDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputMessageDto>(`/api/v1/app/message/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除消息 删除指定的消息（软删除） DELETE /api/v1/app/message/${param0} */
export async function AppMessageControllerDeleteV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppMessageControllerDeleteV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/app/message/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 批量更新消息 批量更新消息状态，如批量标记为已读 PUT /api/v1/app/message/batch */
export async function AppMessageControllerBatchUpdateV1(
  body: MyApi.BatchUpdateMessageDto,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseBoolean>('/api/v1/app/message/batch', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量删除消息 批量删除指定的消息（软删除） DELETE /api/v1/app/message/batch */
export async function AppMessageControllerBatchDeleteV1(
  body: MyApi.BatchDeleteMessageDto,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseBoolean>('/api/v1/app/message/batch', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 标记所有消息为已读 将当前用户的所有未读消息标记为已读，可指定消息类型 PUT /api/v1/app/message/read-all */
export async function AppMessageControllerMarkAllAsReadV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppMessageControllerMarkAllAsReadV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseBoolean>('/api/v1/app/message/read-all', {
    method: 'PUT',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取未读消息数量 获取当前用户的未读消息数量，可指定消息类型 GET /api/v1/app/message/unread/count */
export async function AppMessageControllerGetUnreadCountV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppMessageControllerGetUnreadCountV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseNumber>('/api/v1/app/message/unread/count', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取各类型未读消息数量统计 获取当前用户各类型消息的未读数量统计 GET /api/v1/app/message/unread/count-by-type */
export async function AppMessageControllerGetUnreadCountByTypeV1(options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseOutputUnreadCountByTypeDto>('/api/v1/app/message/unread/count-by-type', {
    method: 'GET',
    ...(options || {}),
  });
}
