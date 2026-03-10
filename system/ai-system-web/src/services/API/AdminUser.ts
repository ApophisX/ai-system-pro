// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 分页获取 C 端用户列表 GET /api/v1/admin/user */
export async function AdminUserControllerGetAdminUserListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminUserControllerGetAdminUserListV1Params,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputAdminUserListItemDtoArray>(
    "/api/v1/admin/user",
    {
      method: "GET",
      params: {
        // pageSize has a default value: 10
        pageSize: "10",

        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 获取用户详情 GET /api/v1/admin/user/${param0} */
export async function AdminUserControllerGetAdminUserDetailV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminUserControllerGetAdminUserDetailV1Params,
  options?: { [key: string]: any }
) {
  const { userId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputUserDetailDto>(
    `/api/v1/admin/user/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 管理端更新用户信息 PUT /api/v1/admin/user/${param0} */
export async function AdminUserControllerUpdateAdminUserV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminUserControllerUpdateAdminUserV1Params,
  body: MyApi.AdminUpdateUserDto,
  options?: { [key: string]: any }
) {
  const { userId: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputUserDto>(
    `/api/v1/admin/user/${param0}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    }
  );
}

/** 封禁用户 POST /api/v1/admin/user/${param0}/ban */
export async function AdminUserControllerBanUserV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminUserControllerBanUserV1Params,
  options?: { [key: string]: any }
) {
  const { userId: param0, ...queryParams } = params;
  return request<any>(`/api/v1/admin/user/${param0}/ban`, {
    method: "POST",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 审核通过企业认证 POST /api/v1/admin/user/${param0}/enterprise-verification/approve */
export async function AdminUserControllerApproveEnterpriseVerificationV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminUserControllerApproveEnterpriseVerificationV1Params,
  options?: { [key: string]: any }
) {
  const { userId: param0, ...queryParams } = params;
  return request<any>(
    `/api/v1/admin/user/${param0}/enterprise-verification/approve`,
    {
      method: "POST",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 审核拒绝企业认证 POST /api/v1/admin/user/${param0}/enterprise-verification/reject */
export async function AdminUserControllerRejectEnterpriseVerificationV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminUserControllerRejectEnterpriseVerificationV1Params,
  body: MyApi.RejectEnterpriseVerificationDto,
  options?: { [key: string]: any }
) {
  const { userId: param0, ...queryParams } = params;
  return request<any>(
    `/api/v1/admin/user/${param0}/enterprise-verification/reject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    }
  );
}

/** 将已通过的企业认证恢复为待审核 POST /api/v1/admin/user/${param0}/enterprise-verification/revert-to-pending */
export async function AdminUserControllerRevertEnterpriseVerificationToPendingV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminUserControllerRevertEnterpriseVerificationToPendingV1Params,
  options?: { [key: string]: any }
) {
  const { userId: param0, ...queryParams } = params;
  return request<any>(
    `/api/v1/admin/user/${param0}/enterprise-verification/revert-to-pending`,
    {
      method: "POST",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 冻结用户 POST /api/v1/admin/user/${param0}/freeze */
export async function AdminUserControllerFreezeUserV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminUserControllerFreezeUserV1Params,
  options?: { [key: string]: any }
) {
  const { userId: param0, ...queryParams } = params;
  return request<any>(`/api/v1/admin/user/${param0}/freeze`, {
    method: "POST",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 解封用户 POST /api/v1/admin/user/${param0}/unban */
export async function AdminUserControllerUnbanUserV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminUserControllerUnbanUserV1Params,
  options?: { [key: string]: any }
) {
  const { userId: param0, ...queryParams } = params;
  return request<any>(`/api/v1/admin/user/${param0}/unban`, {
    method: "POST",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 解冻用户 POST /api/v1/admin/user/${param0}/unfreeze */
export async function AdminUserControllerUnfreezeUserV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminUserControllerUnfreezeUserV1Params,
  options?: { [key: string]: any }
) {
  const { userId: param0, ...queryParams } = params;
  return request<any>(`/api/v1/admin/user/${param0}/unfreeze`, {
    method: "POST",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 分页获取企业用户申请列表 GET /api/v1/admin/user/enterprise-applications */
export async function AdminUserControllerGetEnterpriseApplicationListV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AdminUserControllerGetEnterpriseApplicationListV1Params,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputEnterpriseApplicationListItemDtoArray>(
    "/api/v1/admin/user/enterprise-applications",
    {
      method: "GET",
      params: {
        // pageSize has a default value: 10
        pageSize: "10",

        ...params,
      },
      ...(options || {}),
    }
  );
}
