// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 获取我的地址列表 获取当前用户的所有地址列表，支持分页和筛选 GET /api/v1/app/contact */
export async function AppContactControllerGetMyContactsV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppContactControllerGetMyContactsV1Params,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseOutputContactDtoArray>('/api/v1/app/contact', {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',

      ...params,
    },
    ...(options || {}),
  });
}

/** 创建地址 创建新的联系地址 POST /api/v1/app/contact */
export async function AppContactControllerCreateContactV1(
  body: MyApi.CreateContactDto,
  options?: { [key: string]: any },
) {
  return request<MyApi.ApiResponseString>('/api/v1/app/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取地址详情 获取指定地址的详细信息 GET /api/v1/app/contact/${param0} */
export async function AppContactControllerGetContactDetailV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppContactControllerGetContactDetailV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputContactDto>(`/api/v1/app/contact/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新地址 更新地址信息 PUT /api/v1/app/contact/${param0} */
export async function AppContactControllerUpdateContactV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppContactControllerUpdateContactV1Params,
  body: MyApi.UpdateContactDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/app/contact/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除地址 删除地址（软删除） DELETE /api/v1/app/contact/${param0} */
export async function AppContactControllerDeleteContactV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppContactControllerDeleteContactV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/app/contact/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 设置默认地址 将指定地址设为默认地址 PATCH /api/v1/app/contact/${param0}/set-default */
export async function AppContactControllerSetDefaultContactV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppContactControllerSetDefaultContactV1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseBoolean>(`/api/v1/app/contact/${param0}/set-default`, {
    method: 'PATCH',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取默认地址 获取当前用户的默认地址 GET /api/v1/app/contact/default/current */
export async function AppContactControllerGetDefaultContactV1(options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseOutputContactDto>('/api/v1/app/contact/default/current', {
    method: 'GET',
    ...(options || {}),
  });
}
