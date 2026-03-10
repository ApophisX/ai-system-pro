// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 查询订单列表（出租方） 查询当前用户作为出租方的订单列表 GET /api/v1/app/rental-order/lessor */
export async function AppRentalOrderLessorControllerQueryOrdersV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLessorControllerQueryOrdersV1Params,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputRentalOrderDtoArray>(
    "/api/v1/app/rental-order/lessor",
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

/** 获取订单详情 根据订单 ID 获取订单详情（出租方） GET /api/v1/app/rental-order/lessor/${param0} */
export async function AppRentalOrderLessorControllerGetOrderByIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLessorControllerGetOrderByIdV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(
    `/api/v1/app/rental-order/lessor/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 同意/拒绝取消订单 出租方处理承租方的取消订单申请 PUT /api/v1/app/rental-order/lessor/${param0}/approve-cancel */
export async function AppRentalOrderLessorControllerApproveCancelOrderV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLessorControllerApproveCancelOrderV1Params,
  body: MyApi.ApproveCancelOrderDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(
    `/api/v1/app/rental-order/lessor/${param0}/approve-cancel`,
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

/** 绑定资产实例 出租方为订单绑定资产实例。仅「待收货」订单可操作；所选实例须属于订单资产且可用；支持重新绑定（先解绑再绑） POST /api/v1/app/rental-order/lessor/${param0}/bind-asset-inventory */
export async function AppRentalOrderLessorControllerBindAssetInventoryV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLessorControllerBindAssetInventoryV1Params,
  body: MyApi.BindAssetInventoryDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(
    `/api/v1/app/rental-order/lessor/${param0}/bind-asset-inventory`,
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

/** 商家取消订单 出租方商家取消订单，订单状态必须为待收货（PAID） PUT /api/v1/app/rental-order/lessor/${param0}/cancel-by-lessor */
export async function AppRentalOrderLessorControllerCancelByLessorOrderV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLessorControllerCancelByLessorOrderV1Params,
  body: MyApi.CancelByLessorDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(
    `/api/v1/app/rental-order/lessor/${param0}/cancel-by-lessor`,
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

/** 取消押金扣款申请 出租方取消押金扣款申请 POST /api/v1/app/rental-order/lessor/${param0}/cancel-deposit-deduction */
export async function AppRentalOrderLessorControllerCancelDepositDeductionV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLessorControllerCancelDepositDeductionV1Params,
  body: MyApi.CancelDepositDeductionDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(
    `/api/v1/app/rental-order/lessor/${param0}/cancel-deposit-deduction`,
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

/** 确认归还资产 出租方对承租方的归还申请进行确认或拒绝。确认归还后订单归还状态进入「已归还」，拒绝归还后订单进入「争议中」状态 PUT /api/v1/app/rental-order/lessor/${param0}/confirm-return */
export async function AppRentalOrderLessorControllerConfirmReturnV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLessorControllerConfirmReturnV1Params,
  body: MyApi.ConfirmReturnAssetDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(
    `/api/v1/app/rental-order/lessor/${param0}/confirm-return`,
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

/** 押金扣款申请 出租方发起押金扣款申请 POST /api/v1/app/rental-order/lessor/${param0}/deduct-deposit */
export async function AppRentalOrderLessorControllerDeductDepositV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLessorControllerDeductDepositV1Params,
  body: MyApi.CreateDepositDeductionDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(
    `/api/v1/app/rental-order/lessor/${param0}/deduct-deposit`,
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

/** 结束订单 出租方结束订单，可提交凭证。押金退款需单独调用押金退款接口 POST /api/v1/app/rental-order/lessor/${param0}/end-order */
export async function AppRentalOrderLessorControllerEndOrderV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLessorControllerEndOrderV1Params,
  body: MyApi.EndOrderDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(
    `/api/v1/app/rental-order/lessor/${param0}/end-order`,
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

/** 出租方强制关闭在租订单 出租方在特殊场景下强制关闭在租订单，需提交凭证，当前无需平台审核。 PUT /api/v1/app/rental-order/lessor/${param0}/force-close */
export async function AppRentalOrderLessorControllerForceCloseOrderV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLessorControllerForceCloseOrderV1Params,
  body: MyApi.ForceCloseOrderDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(
    `/api/v1/app/rental-order/lessor/${param0}/force-close`,
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

/** 获取订单操作权限 出租方获取当前订单的可操作权限，用于前端按钮显隐、引导文案等。包含：押金扣款、取消扣款、同意/拒绝取消、商家取消、结束订单、押金退款、单笔账单退款等 GET /api/v1/app/rental-order/lessor/${param0}/get-operation-permission */
export async function AppRentalOrderLessorControllerGetOperationPermissionV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLessorControllerGetOperationPermissionV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputLessorOperationPermissionDto>(
    `/api/v1/app/rental-order/lessor/${param0}/get-operation-permission`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 换绑资产实例 出租方将订单从当前绑定的资产实例换绑到新实例。仅「待收货」且已绑定实例的订单可操作；会记录换绑历史；支持上传留痕图片用于追溯 POST /api/v1/app/rental-order/lessor/${param0}/rebind-asset-inventory */
export async function AppRentalOrderLessorControllerRebindAssetInventoryV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLessorControllerRebindAssetInventoryV1Params,
  body: MyApi.RebindAssetInventoryDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(
    `/api/v1/app/rental-order/lessor/${param0}/rebind-asset-inventory`,
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

/** 押金退款 出租方发起订单押金退款 POST /api/v1/app/rental-order/lessor/${param0}/refund-deposit */
export async function AppRentalOrderLessorControllerRefundDepositV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLessorControllerRefundDepositV1Params,
  body: MyApi.RefundDepositDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(
    `/api/v1/app/rental-order/lessor/${param0}/refund-deposit`,
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

/** 单笔账单退款 申请单笔账单退款 POST /api/v1/app/rental-order/lessor/${param0}/refund-payment-record */
export async function AppRentalOrderLessorControllerRefundPaymentRecordV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLessorControllerRefundPaymentRecordV1Params,
  body: MyApi.RefundPaymentRecordDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(
    `/api/v1/app/rental-order/lessor/${param0}/refund-payment-record`,
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

/** 设置订单金额优惠（仅非分期订单） 非分期订单待支付时，出租方设置整单优惠金额。分期订单请使用 set-payment-discount 接口 PUT /api/v1/app/rental-order/lessor/${param0}/set-discount */
export async function AppRentalOrderLessorControllerSetOrderDiscountV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLessorControllerSetOrderDiscountV1Params,
  body: MyApi.SetDiscountDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(
    `/api/v1/app/rental-order/lessor/${param0}/set-discount`,
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

/** 设置超期使用优惠金额 超期使用费用待支付时，出租方设置超期使用费优惠金额。仅适用于先付后用、非分期订单，且订单处于超时使用状态 PUT /api/v1/app/rental-order/lessor/${param0}/set-overdue-use-discount */
export async function AppRentalOrderLessorControllerSetOverdueUseDiscountV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLessorControllerSetOverdueUseDiscountV1Params,
  body: MyApi.SetOverdueUseDiscountDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(
    `/api/v1/app/rental-order/lessor/${param0}/set-overdue-use-discount`,
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

/** 设置分期账单、续租账单优惠金额（单笔） 分期账单或续租账单待支付时，出租方单独设置某一笔账单的优惠金额，需传入 paymentId PUT /api/v1/app/rental-order/lessor/${param0}/set-payment-discount */
export async function AppRentalOrderLessorControllerSetPaymentDiscountV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLessorControllerSetPaymentDiscountV1Params,
  body: MyApi.SetPaymentDiscountDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<MyApi.ApiResponseOutputRentalOrderDto>(
    `/api/v1/app/rental-order/lessor/${param0}/set-payment-discount`,
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

/** 查询待处理订单（出租方） 查询当前用户作为出租方的待处理订单列表（包括：等待取消确认、已归还待确认、争议中、超时使用、逾期、待归还、已支付等状态） GET /api/v1/app/rental-order/lessor/pending */
export async function AppRentalOrderLessorControllerQueryPendingOrdersV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: MyApi.AppRentalOrderLessorControllerQueryPendingOrdersV1Params,
  options?: { [key: string]: any }
) {
  return request<MyApi.ApiResponseOutputRentalOrderDto[]>(
    "/api/v1/app/rental-order/lessor/pending",
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
