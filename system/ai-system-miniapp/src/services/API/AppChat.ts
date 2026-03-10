// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 获取会话列表 获取当前用户的聊天会话列表，支持分页和搜索 GET /api/v1/app/chat/conversations */
export async function AppChatControllerGetConversationsV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppChatControllerGetConversationsV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputChatConversationDtoArray>('/api/v1/app/chat/conversations', {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',

      ...params,
    },
    ...(options || {}),
  });
}

/** 获取会话详情 获取指定会话的详细信息 GET /api/v1/app/chat/conversations/${param0} */
export async function AppChatControllerGetConversationByIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppChatControllerGetConversationByIdV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputChatConversationDto>(`/api/v1/app/chat/conversations/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新会话 更新会话设置，如屏蔽/取消屏蔽会话 PUT /api/v1/app/chat/conversations/${param0} */
export async function AppChatControllerUpdateConversationV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppChatControllerUpdateConversationV1Params,
  body: MyApi.UpdateChatConversationDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputChatConversationDto>(`/api/v1/app/chat/conversations/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 标记会话为已读 将指定会话的所有未读消息标记为已读 PUT /api/v1/app/chat/conversations/${param0}/read */
export async function AppChatControllerMarkConversationAsReadV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppChatControllerMarkConversationAsReadV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/app/chat/conversations/${param0}/read`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取消息列表 获取指定会话的消息列表，支持分页、筛选、搜索 GET /api/v1/app/chat/messages */
export async function AppChatControllerGetMessagesV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppChatControllerGetMessagesV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputChatMessageDtoArray>('/api/v1/app/chat/messages', {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',

      ...params,
    },
    ...(options || {}),
  });
}

/** 发送消息 发送一条聊天消息，支持文本、图片、视频、语音、文件等类型 POST /api/v1/app/chat/messages */
export async function AppChatControllerSendMessageV1(
  body: MyApi.CreateChatMessageDto,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputChatMessageDto>('/api/v1/app/chat/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 撤回消息 撤回自己发送的消息（只能撤回2分钟内的消息） PUT /api/v1/app/chat/messages/${param0}/recall */
export async function AppChatControllerRecallMessageV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppChatControllerRecallMessageV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputChatMessageDto>(`/api/v1/app/chat/messages/${param0}/recall`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取未读消息总数 获取当前用户在所有会话中的未读消息总数 GET /api/v1/app/chat/unread/count */
export async function AppChatControllerGetUnreadCountV1(options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseNumber>('/api/v1/app/chat/unread/count', {
    method: 'GET',
    ...(options || {}),
  });
}
