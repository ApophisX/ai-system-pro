import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
  CreateRentalOrderDto,
  PayRentalOrderDto,
  PayInstallmentDto,
  CancelRentalOrderDto,
  QueryRentalOrderDto,
  OutputRentalOrderDto,
  OutputPayRentalOrderResultDto,
  OutputPayDepositResultDto,
  ConfirmDepositDeductionDto,
  DepositDeductionResponseType,
  ConfirmReceiptDto,
  ReturnAssetDto,
  PayOverdueUseFeeDto,
} from '../dto';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { OutputUserDto } from '@/modules/base/user/dto';
import { ReqContext } from '@/common/decorators/req-context.decorator';
import { RequestContext } from '@/common/dtos/request-context.dto';
import { RentalOrderStatus } from '../enums';

/**
 * 租赁订单控制器 - 承租方
 * 提供承租方相关的订单操作接口
 */
@ApiTags('AppRentalOrderLessee')
@UseGuards(JwtAuthGuard)
@Controller('app/rental-order/lessee')
export class AppRentalOrderLesseeController {
  constructor(private readonly orderService: RentalOrderService) {
    //
  }

  /**
   * 创建订单
   */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建订单', description: '创建租赁订单' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  @HttpCode(HttpStatus.OK)
  async createOrder(
    @CurrentUser() user: OutputUserDto,
    @Body() dto: CreateRentalOrderDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.createOrder(user.id, dto);
    return { data: order, message: '订单创建成功' };
  }

  /**
   * 查询订单列表（承租方）
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '查询订单列表（承租方）',
    description: '查询当前用户作为承租方的订单列表',
  })
  @SwaggerApiResponse(OutputRentalOrderDto, { isArray: true })
  async queryOrders(
    @CurrentUser() user: OutputUserDto,
    @Query() dto: QueryRentalOrderDto,
  ): PromiseApiResponse<OutputRentalOrderDto[]> {
    const result = await this.orderService.queryOrders(user.id, dto, 'lessee');
    return { data: result.data, meta: result.meta };
  }

  /**
   * 获取订单详情
   */
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取订单详情',
    description: '根据订单 ID 获取订单详情（承租方）',
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
   * 支付订单
   */
  @Post(':id/pay-order')
  @ApiBearerAuth()
  @ApiOperation({ summary: '支付订单', description: '支付租赁订单' })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @HttpCode(HttpStatus.OK)
  @SwaggerApiResponse(OutputPayRentalOrderResultDto)
  async payOrder(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: PayRentalOrderDto,
    @ReqContext() ctx: RequestContext,
  ): PromiseApiResponse<OutputPayRentalOrderResultDto> {
    const result = await this.orderService.payOrder(user.id, { ...dto, orderId: id }, ctx);
    return { data: result, message: '订单支付成功' };
  }

  /**
   * 支付押金/押金免押
   */
  @Post(':id/pay-deposit')
  @ApiBearerAuth()
  @ApiOperation({ summary: '支付押金/押金免押', description: '支付租赁订单押金/押金免押' })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @HttpCode(HttpStatus.OK)
  @SwaggerApiResponse(OutputPayDepositResultDto)
  async payDeposit(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: PayRentalOrderDto,
    @ReqContext() ctx: RequestContext,
  ): PromiseApiResponse<OutputPayDepositResultDto> {
    const result = await this.orderService.payDeposit(user.id, { ...dto, orderId: id }, ctx);
    return { data: result, message: '押金支付成功' };
  }

  /**
   * 支付分期账单
   */
  @Post(':id/pay-installment')
  @ApiBearerAuth()
  @ApiOperation({ summary: '支付分期账单', description: '支付租赁订单分期账单' })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @HttpCode(HttpStatus.OK)
  @SwaggerApiResponse(OutputPayRentalOrderResultDto)
  async payInstallment(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: PayInstallmentDto,
    @ReqContext() ctx: RequestContext,
  ): PromiseApiResponse<OutputPayRentalOrderResultDto> {
    const result = await this.orderService.payInstallment(user.id, { ...dto, orderId: id }, ctx);
    return { data: result, message: '账单支付成功' };
  }

  /**
   * 支付超时使用费用
   */
  @Post(':id/pay-overdue-use-fee')
  @ApiBearerAuth()
  @ApiOperation({ summary: '支付超时使用费用', description: '支付租赁订单超时使用费用' })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @HttpCode(HttpStatus.OK)
  @SwaggerApiResponse(OutputPayRentalOrderResultDto)
  async payOverdueUseFee(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: PayOverdueUseFeeDto,
  ): PromiseApiResponse<OutputPayRentalOrderResultDto> {
    const result = await this.orderService.payOverdueUseFee(user.id, id, dto);
    return { data: result, message: '超时使用费用支付成功' };
  }

  /**
   * 承租方取消订单
   */
  @Put(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '取消订单',
    description: '取消租赁订单。待支付状态可直接取消；仅支付押金时可直接取消；已支付租金和押金时需要出租方同意',
  })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: CancelRentalOrderDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.cancelOrderByLessee(user.id, id, dto);
    const message =
      order.status === RentalOrderStatus.CANCEL_PENDING ? '取消申请已提交，等待出租方确认' : '订单取消成功';
    return { data: order, message };
  }

  /**
   * 撤销取消订单的申请
   */
  @Put(':id/cancel-cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消取消订单申请', description: '取消承租方的取消订单申请' })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  @HttpCode(HttpStatus.OK)
  async revokeCancelOrder(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.revokeCancelOrder(user.id, id);
    return { data: order, message: '撤销成功' };
  }

  /**
   * 删除订单
   * TODO: 需要权限控制，只有承租方可以删除订单，删除订单不影响出租方权益、出租方仍然可以查看订单
   */
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '删除订单',
    description: '删除租赁订单,未支付订单可以删除（软删除）',
  })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @HttpCode(HttpStatus.OK)
  @SwaggerApiResponse(Boolean, { description: '删除租赁订单' })
  async deleteOrder(@CurrentUser() user: OutputUserDto, @Param('id') id: string): PromiseApiResponse<void> {
    await this.orderService.deleteOrder(user.id, id);
    return { data: undefined, message: '订单删除成功' };
  }

  /**
   * 承租方对押金扣款申请进行确认
   *
   * 业务规则：
   * 1. 承租方可以对押金扣款申请进行确认
   * 2. 同意：记录承租方同意信息，状态自动标记为平台已审核，审核原因填写用户同意说明
   * 3. 拒绝：必须提交拒绝说明或凭证，状态标记为【用户拒绝】
   * 4. 只能确认状态为【待用户确认】的扣款申请
   * 5. 扣款申请必须属于该订单
   */
  @Post(':id/confirm-deposit-deduction')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '确认押金扣款申请',
    description: '承租方对押金扣款申请进行确认（同意或拒绝）',
  })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @HttpCode(HttpStatus.OK)
  @SwaggerApiResponse(OutputRentalOrderDto)
  async confirmDepositDeduction(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: ConfirmDepositDeductionDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.confirmDepositDeduction(user.id, id, dto);
    const message =
      dto.responseType === DepositDeductionResponseType.APPROVED
        ? '扣款申请已同意，已自动标记为平台已审核'
        : '扣款申请已拒绝，等待平台审核';
    return { data: order, message };
  }

  /**
   * 承租方确认收货
   *
   * 当订单绑定资产实例后，承租方可以确认收货。确认收货后：
   * - 订单状态进入使用中（IN_USE）
   * - 开始计算租金
   * - 订单进入使用中后不可取消
   */
  @Post(':id/confirm-receipt')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '确认收货',
    description: '承租方确认收货，订单进入使用中状态并开始计算租金',
  })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @HttpCode(HttpStatus.OK)
  @SwaggerApiResponse(OutputRentalOrderDto)
  async confirmReceipt(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: ConfirmReceiptDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.confirmReceipt(user.id, id, dto);
    return { data: order, message: '收货确认成功，祝您租用愉快！' };
  }

  /**
   * 承租方归还资产
   *
   * 1. 承租方在订单处于「使用中」状态时，可提交归还申请。
   * 2. 承租方提交归还后：
   *    - 订单归还状态进入「已归还待确认」
   *    - 记录承租方提交的归还凭证信息
   *    - 固定归还时间为承租方提交归还的时间（作为计费停止时间）
   * 3. 出租方可在 24 小时内确认归还或发起异议。
   * 4. 若出租方在 24 小时内未进行任何操作，
   *    系统将自动确认归还，订单归还状态进入「已归还」。
   * 5. 系统自动确认不影响出租方事后发起异议或进入仲裁流程的权利。
   */
  @Post(':id/return-asset')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '归还资产',
    description: '承租方归还资产，提交归还申请后订单进入「已归还待确认」状态',
  })
  @ApiParam({ name: 'id', description: '订单 ID' })
  @HttpCode(HttpStatus.OK)
  @SwaggerApiResponse(OutputRentalOrderDto)
  async returnAsset(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: ReturnAssetDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.orderService.returnAsset(user.id, id, dto);
    return { data: order, message: '归还申请已提交，等待出租方确认' };
  }
}
