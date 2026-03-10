// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 获取好友列表 获取当前用户的好友列表，支持分页和筛选 GET /api/v1/app/user/friends */
export async function UserFriendControllerGetFriendListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.UserFriendControllerGetFriendListV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputUserFriendDtoArray>('/api/v1/app/user/friends', {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',

      ...params,
    },
    ...(options || {}),
  });
}

/** 发送好友请求 向指定用户发送好友请求 POST /api/v1/app/user/friends */
export async function UserFriendControllerSendFriendRequestV1(
  body: MyApi.CreateUserFriendDto,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseString>('/api/v1/app/user/friends', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取好友关系详情 获取与指定用户的好友关系详情 GET /api/v1/app/user/friends/${param0} */
export async function UserFriendControllerGetFriendRelationV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.UserFriendControllerGetFriendRelationV1Params,
  options?: { [key: string]: any },
) {
  const { friendId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputUserFriendDto>(`/api/v1/app/user/friends/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除好友 删除与指定用户的好友关系 DELETE /api/v1/app/user/friends/${param0} */
export async function UserFriendControllerDeleteFriendV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.UserFriendControllerDeleteFriendV1Params,
  options?: { [key: string]: any },
) {
  const { friendId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/app/user/friends/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 接受好友请求 接受指定用户发送的好友请求 POST /api/v1/app/user/friends/${param0}/accept */
export async function UserFriendControllerAcceptFriendRequestV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.UserFriendControllerAcceptFriendRequestV1Params,
  options?: { [key: string]: any },
) {
  const { friendId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/app/user/friends/${param0}/accept`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 屏蔽用户 屏蔽指定用户，屏蔽后将无法接收该用户的好友请求 POST /api/v1/app/user/friends/${param0}/block */
export async function UserFriendControllerBlockUserV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.UserFriendControllerBlockUserV1Params,
  options?: { [key: string]: any },
) {
  const { friendId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/app/user/friends/${param0}/block`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 拒绝好友请求 拒绝指定用户发送的好友请求 POST /api/v1/app/user/friends/${param0}/reject */
export async function UserFriendControllerRejectFriendRequestV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.UserFriendControllerRejectFriendRequestV1Params,
  options?: { [key: string]: any },
) {
  const { friendId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/app/user/friends/${param0}/reject`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新好友备注 更新对指定好友的备注名称 PATCH /api/v1/app/user/friends/${param0}/remark */
export async function UserFriendControllerUpdateRemarkV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.UserFriendControllerUpdateRemarkV1Params,
  options?: { [key: string]: any },
) {
  const { friendId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/app/user/friends/${param0}/remark`, {
    method: 'PATCH',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 取消屏蔽 取消对指定用户的屏蔽 POST /api/v1/app/user/friends/${param0}/unblock */
export async function UserFriendControllerUnblockUserV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.UserFriendControllerUnblockUserV1Params,
  options?: { [key: string]: any },
) {
  const { friendId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/app/user/friends/${param0}/unblock`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取待处理的好友请求列表 获取发送给当前用户的待处理好友请求 GET /api/v1/app/user/friends/requests/pending */
export async function UserFriendControllerGetPendingRequestsV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.UserFriendControllerGetPendingRequestsV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputUserFriendDtoArray>('/api/v1/app/user/friends/requests/pending', {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',

      ...params,
    },
    ...(options || {}),
  });
}
