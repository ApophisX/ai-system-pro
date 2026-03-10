import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser } from '@/modules/base/auth/decorators/current-user.decorator';
import { RentalOrderService } from '../services';
import {
  ApproveCancelOrderDto,
  CancelByLessorDto,
  QueryRentalOrderDto,
  QueryPendingRentalOrderDto,
  OutputRentalOrderDto,
  OutputLessorOperationPermissionDto,
  EndOrderDto,
  CreateDepositDeductionDto,
  RefundPaymentRecordDto,
  RefundDepositDto,
  CancelDepositDeductionDto,
  BindAssetInventoryDto,
  RebindAssetInventoryDto,
  ConfirmReturnAssetDto,
  ForceCloseOrderDto,
  SetDiscountDto,
  SetPaymentDiscountDto,
  SetOverdueUseDiscountDto,
} from '../dto';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { OutputUserDto } from '@/modules/base/user/dto';

/**
 * 租赁订单控制器 - 出租方
 * 提供出租方相关的订单操作接口
 */
@ApiTags('AppRentalOrderLessor')
@UseGuards(JwtAuthGuard)
@Controller('app/rental-order/lessor')
export class AppRentalOrderLessorController {
  constructor(private readonly orderService: RentalOrderService) {
    //
  }
  /**
   * 设置订单金额优惠（仅非分期订单）
   *
   * 非分期订单待支付时，出租方可设置整单优惠金额。
   * 分期订单请使用「设置分期账单、续租账单优惠」接口。
   *
   * 前置条件：非分期订单、订单状态为待支付（首笔租金待支付或续租账单待支付）
   */
  @Put(':id/set-discount')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '设置订单金额优惠（仅非分期订单）',
    description: '非分期订单待支付时，出租方设置整单优惠金额。分期订单请使用 set-payment-discount 接口',
  })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  @HttpCode(HttpStatus.OK)
  async setOrderDiscount(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: SetDiscountDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.setOrderDiscount(user.id, id, dto);
    return { data: order, message: '优惠金额已设置' };
  }

  /**
   * 设置分期账单、续租账单优惠金额（单笔）
   *
   * 分期账单或续租账单待支付时，出租方可单独设置某一笔账单的优惠金额。
   * 需传入 paymentId 指定要优惠的账单。
   *
   * 前置条件：账单状态为待支付
   */
  @Put(':id/set-payment-discount')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '设置分期账单、续租账单优惠金额（单笔）',
    description: '分期账单或续租账单待支付时，出租方单独设置某一笔账单的优惠金额，需传入 paymentId',
  })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  @HttpCode(HttpStatus.OK)
  async setPaymentDiscount(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: SetPaymentDiscountDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.setPaymentDiscount(user.id, id, dto);
    return { data: order, message: '优惠金额已设置' };
  }

  /**
   * 设置超期使用优惠金额
   * 超期使用费用待支付时，出租方可设置超期使用优惠金额。
   *
   * 前置条件：overdueStatus = OVERDUE_USE（超时使用），先付后用、非分期订单
   */
  @Put(':id/set-overdue-use-discount')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '设置超期使用优惠金额',
    description:
      '超期使用费用待支付时，出租方设置超期使用费优惠金额。仅适用于先付后用、非分期订单，且订单处于超时使用状态',
  })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  @HttpCode(HttpStatus.OK)
  async setOverdueUseDiscount(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: SetOverdueUseDiscountDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.setOverdueUseDiscount(user.id, id, dto);
    return { data: order, message: '超期使用优惠金额已设置' };
  }

  /**
   * 查询待处理订单
   * 待处理订单状态：cancel_pending、returned_pending、dispute、overdue_use、overdue、wait_return、paid
   */
  @Get('pending')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '查询待处理订单（出租方）',
    description:
      '查询当前用户作为出租方的待处理订单列表（包括：等待取消确认、已归还待确认、争议中、超时使用、逾期、待归还、已支付等状态）',
  })
  @SwaggerApiResponse(OutputRentalOrderDto, { isArray: true })
  async queryPendingOrders(
    @CurrentUser() user: OutputUserDto,
    @Query() dto: QueryPendingRentalOrderDto,
  ): PromiseApiResponse<OutputRentalOrderDto[]> {
    const result = await this.orderService.queryPendingOrders(user.id, dto);
    return { data: result.data, meta: result.meta };
  }

  /**
   * 查询订单列表（出租方）
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '查询订单列表（出租方）',
    description: '查询当前用户作为出租方的订单列表',
  })
  @SwaggerApiResponse([OutputRentalOrderDto])
  async queryOrders(
    @CurrentUser() user: OutputUserDto,
    @Query() dto: QueryRentalOrderDto,
  ): PromiseApiResponse<OutputRentalOrderDto[]> {
    const result = await this.orderService.queryOrders(user.id, dto, 'lessor');
    return { data: result.data, meta: result.meta };
  }

  /**
   * 获取订单详情
   */
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取订单详情',
    description: '根据订单 ID 获取订单详情（出租方）',
  })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  async getOrderById(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.getOrderById(id, user.id);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    return { data: order };
  }

  /**
   * 出租方同意/拒绝承租方发起的取消订单申请
   */
  @Put(':id/approve-cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: '同意/拒绝取消订单', description: '出租方处理承租方的取消订单申请' })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  @HttpCode(HttpStatus.OK)
  async approveCancelOrder(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: ApproveCancelOrderDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.approveCancelOrder(user.id, id, dto);
    const message = dto.approved ? '已同意取消订单，退款处理中' : '已拒绝取消申请，订单已进入争议状态，等待平台处理';
    return { data: order, message };
  }

  /**
   * 商家取消订单（出租方）
   * 当订单处于待收货（PAID）状态时，因商家库存不足等原因，可商家取消订单
   */
  @Put(':id/cancel-by-lessor')
  @ApiBearerAuth()
  @ApiOperation({ summary: '商家取消订单', description: '出租方商家取消订单，订单状态必须为待收货（PAID）' })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  @HttpCode(HttpStatus.OK)
  async cancelByLessorOrder(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: CancelByLessorDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.cancelByLessorOrder(user.id, id, dto);
    return { data: order, message: '订单已关闭，退款处理中' };
  }

  /**
   * 结束订单（由出租方发起）
   * 可能线下达成一致或者其他原因，出租方需要结束订单，出租方可以提交凭证，目前不需要平台审核
   * 结束订单后，订单状态为已完成、所有账单状态为已关闭，支付账单不需要退款
   * 注意：押金退款由单独的接口处理，结束订单时不会自动退款押金
   */
  @Post(':id/end-order')
  @ApiBearerAuth()
  @ApiOperation({ summary: '结束订单', description: '出租方结束订单，可提交凭证。押金退款需单独调用押金退款接口' })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  @HttpCode(HttpStatus.OK)
  async endOrder(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: EndOrderDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.endOrder(user.id, id, dto);
    return { data: order, message: '订单已结束' };
  }

  /**
   * 在租订单强制关闭（出租方）
   * 出租方在特殊场景下可强制关闭在租订单。
   * 适用状态：已收货、使用中（及业务允许的其他在租态）。
   * 必须提交凭证，用来留痕，当前无需平台审核。
   * 处理结果：订单关闭；未支付/待支付的账单与押金相关支付项同步关闭（或作废），已支付的账单，押金状态保持不变，资产状态变更为可用
   */
  @Put(':id/force-close')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '出租方强制关闭在租订单',
    description: '出租方在特殊场景下强制关闭在租订单，需提交凭证，当前无需平台审核。',
  })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  @HttpCode(HttpStatus.OK)
  async forceCloseOrder(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: ForceCloseOrderDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.forceCloseOrder(user.id, id, dto);
    return { data: order, message: '订单已强制关闭' };
  }

  /**
   * 押金退款规则说明
   *
   * 1. 退款条件：
   *    - 只有出租方可以发起押金退款
   *    - 订单状态必须为已完成、使用中、已归还等状态
   *    - 押金状态必须为已冻结、已支付或部分扣除
   *
   * 2. 退款金额：
   *    - 可退金额 = 押金总额 - 已扣除金额
   *    - 如果押金已全部扣除，则无法退款
   *
   * 3. 退款处理：
   *    - 系统会自动计算可退押金金额
   *    - 退款通过支付系统异步处理
   *    - 退款完成后，押金状态更新为已退款
   */
  @Post(':id/refund-deposit')
  @ApiBearerAuth()
  @ApiOperation({ summary: '押金退款', description: '出租方发起订单押金退款' })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  @HttpCode(HttpStatus.OK)
  async refundDeposit(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: RefundDepositDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.refundDeposit(user.id, id, dto.remark);
    return { data: order, message: '押金退款申请已提交' };
  }

  /**
   * 押金扣款申请与执行规则说明
   *
   * 1. 押金为平台托管资金，出租方无权单方面直接扣除。
   * 2. 同一订单下：
   *    - 押金累计最多可成功扣除 3 次（失败或被拒绝不计入）。
   *    - 最多发起3次扣款申请，如果3次都失败或被拒绝，则不能再发起扣款申请。
   *    - 单次扣款金额不得超过当前可用押金余额。
   *    - 累计扣款金额不得超过初始押金金额。
   * 3. 出租方仅可发起押金扣款申请：
   *    - 申请提交后，押金扣款记录状态为【待审核】。
   *    - 必须提交扣款说明，且至少提供一项凭证（图片/视频/文件）,校验交给DTO来处理。
   * 4. 承租方可在订单详情页对扣款申请进行确认：
   *    - 同意：记录承租方同意信息，状态自动标记为平台已审核，审核原因填写用户同意说明。
   *    - 拒绝：必须提交拒绝说明或凭证，状态标记为【用户拒绝】。
   * 5. 当出现用户拒绝或争议时，扣款申请进入平台审核流程：
   *    - 平台管理员依据规则及证据进行裁决。
   *    - 承租方在扣款申请发起后超过 72 小时未进行任何操作（未同意亦未拒绝），视为超时未响应。
   *      超时未响应不视为承租方同意，仅触发平台介入审核，由平台依据规则及证据进行裁决。
   * 6. 平台审核结果：
   *    - 审核通过：押金扣款记录状态为【已审核】，进入可执行状态。
   *    - 审核拒绝：押金扣款记录状态为【已拒绝】，流程终止。
   * 7. 已审核的押金扣款记录不可修改，仅可用于后续押金结算或提现申请。
   */
  @Post(':id/deduct-deposit')
  @ApiBearerAuth()
  @ApiOperation({ summary: '押金扣款申请', description: '出租方发起押金扣款申请' })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  @HttpCode(HttpStatus.OK)
  async deductDeposit(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: CreateDepositDeductionDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.deductDeposit(user.id, id, dto);
    return { data: order, message: '押金扣款申请已提交，等待审核' };
  }

  /**
   * 出租方取消押金扣款申请
   * 只有在扣款状态属于 【待用户确认】、【待平台审核】时，才能取消扣款申请
   */
  @Post(':id/cancel-deposit-deduction')
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消押金扣款申请', description: '出租方取消押金扣款申请' })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  @HttpCode(HttpStatus.OK)
  async cancelDepositDeduction(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: CancelDepositDeductionDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.cancelDepositDeduction(user.id, id, dto);
    return { data: order, message: '押金扣款申请已取消' };
  }

  /**
   * 单笔账单退款规则说明（由出租方发起）
   *
   * 1. 退款适用于以下类型的租赁账单（paymentType 限制）：
   *    - 分期租赁产生的已支付账单（INSTALLMENT）；
   *    - 单次短租产生的已支付账单（RENTAL/ORDER）；
   *    - 续租产生的已支付账单（RENEWAL）。
   *    不支持：逾期费（OVERDUE_FEE）、押金（DEPOSIT）等。
   *
   * 2. 账单状态要求：
   *    - 仅支持状态为【已支付】且【未全额退款】的账单；
   *    - 已完成（履约结束并结算完成）的订单下账单不可发起退款。
   *
   * 3. 退款方式：
   *    - 支持对同一笔账单进行多次部分退款；
   *    - 单次退款金额不得超过该账单的剩余可退款金额；
   *    - 累计退款金额不得超过该账单的已支付金额。
   *
   * 4. 退款发起与执行：
   *    - 退款由出租方发起申请；
   *    - 平台根据账单状态及规则校验退款合法性后执行退款操作。
   *
   * 5. 退款是基于 payment_record 表发起的，并同步 payment 表的退款状态
   */
  @Post(':id/refund-payment-record')
  @ApiBearerAuth()
  @ApiOperation({ summary: '单笔账单退款', description: '申请单笔账单退款' })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  @HttpCode(HttpStatus.OK)
  async refundPaymentRecord(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: RefundPaymentRecordDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.refundPaymentRecord(user.id, id, dto);
    return { data: order };
  }

  /**
   * 绑定资产实例
   *
   * 前置条件：订单状态为「待收货」(PAID)；资产实例归属当前出租方且状态为「可用」。
   * 绑定后实例状态变为「租赁中」，可填写物流信息并发货。
   * 未发货前允许重新绑定（将先解绑原实例再绑定新实例）。
   */
  @Post(':id/bind-asset-inventory')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '绑定资产实例',
    description:
      '出租方为订单绑定资产实例。仅「待收货」订单可操作；所选实例须属于订单资产且可用；支持重新绑定（先解绑再绑）',
  })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  @HttpCode(HttpStatus.OK)
  async bindAssetInventory(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: BindAssetInventoryDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.bindAssetInventory(user.id, id, dto);
    return { data: order, message: '资产实例已绑定，待用户确认。' };
  }

  /**
   * 换绑资产实例
   *
   * 前置条件：订单已绑定过资产实例；将当前绑定实例换绑为目标实例，并写入换绑记录。
   * 支持上传换绑留痕图片（evidenceUrls），用于记录与争议追溯。
   */
  @Post(':id/rebind-asset-inventory')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '换绑资产实例',
    description:
      '出租方将订单从当前绑定的资产实例换绑到新实例。仅「待收货」且已绑定实例的订单可操作；会记录换绑历史；支持上传留痕图片用于追溯',
  })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  @HttpCode(HttpStatus.OK)
  async rebindAssetInventory(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: RebindAssetInventoryDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.rebindAssetInventory(user.id, id, dto);
    return { data: order, message: '资产实例已换绑' };
  }

  /**
   * 出租方获取操作订单权限
   *
   * 用于前端在订单详情/操作区做条件判断与 UI 展示，例如：
   * - 押金扣款：可否发起、不可时的原因
   * - 取消扣款：是否存在可取消的扣款申请
   * - 同意/拒绝取消、商家取消、结束订单、押金退款、单笔账单退款 等是否可用
   */
  @Get(':id/get-operation-permission')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取订单操作权限',
    description:
      '出租方获取当前订单的可操作权限，用于前端按钮显隐、引导文案等。包含：押金扣款、取消扣款、同意/拒绝取消、商家取消、结束订单、押金退款、单笔账单退款等',
  })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @SwaggerApiResponse(OutputLessorOperationPermissionDto)
  async getOperationPermission(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
  ): PromiseApiResponse<OutputLessorOperationPermissionDto> {
    const permission = await this.orderService.getLessorOperationPermission(user.id, id);
    return { data: permission };
  }

  /**
   * 出租方确认归还资产
   *
   * 1. 出租方仅可在订单归还状态为「已归还待确认」时，对承租方的归还申请进行确认或拒绝。
   * 2. 出租方确认归还后：
   *    - 订单归还状态进入「已归还」
   *    - 归还完成时间记录为确认时间（用于流程审计）
   * 3. 计费停止时间始终以承租方提交归还的时间为准，不因出租方确认时间变化。
   * 4. 出租方可提交确认凭证并填写归还说明，作为确认或争议依据。
   * 5. 出租方如拒绝归还申请，需填写拒绝原因并提交相关凭证，订单进入「争议中」状态，等待平台仲裁处理。
   */
  @Put(':id/confirm-return')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '确认归还资产',
    description:
      '出租方对承租方的归还申请进行确认或拒绝。确认归还后订单归还状态进入「已归还」，拒绝归还后订单进入「争议中」状态',
  })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  @HttpCode(HttpStatus.OK)
  async confirmReturn(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: ConfirmReturnAssetDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.confirmReturn(user.id, id, dto);
    const message = dto.confirmed
      ? '已确认归还资产，订单归还状态已更新为「已归还」'
      : '已拒绝归还申请，订单已进入「争议中」状态，等待平台仲裁处理';
    return { data: order, message };
  }
}
