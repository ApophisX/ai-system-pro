import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser } from '@/modules/base/auth/decorators/current-user.decorator';
import { PaymentService } from '../services';
import { CreatePaymentDto, CreateRefundDto, QueryPaymentDto, OutputPaymentDto } from '../dto';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { OutputUserDto } from '@/modules/base/user/dto';

/**
 * 支付控制器
 */
@ApiTags('AppPayment')
@UseGuards(JwtAuthGuard)
@Controller('app/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * 查询支付记录
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '查询支付记录',
    description: '查询当前用户的支付记录',
  })
  @SwaggerApiResponse([OutputPaymentDto])
  async queryPayments(
    @CurrentUser() user: OutputUserDto,
    @Query() dto: QueryPaymentDto,
  ): PromiseApiResponse<OutputPaymentDto[]> {
    const result = await this.paymentService.queryPayments(user.id, dto);
    return { data: result.data, meta: result.meta };
  }

  /**
   * 获取支付详情
   */
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取支付详情',
    description: '根据支付 ID 获取支付详情',
  })
  @ApiParam({ name: 'id', description: '支付 ID' })
  @SwaggerApiResponse(OutputPaymentDto)
  async getPaymentById(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
  ): PromiseApiResponse<OutputPaymentDto> {
    const payment = await this.paymentService.getPaymentById(id, user.id);
    if (!payment) {
      throw new Error('支付记录不存在');
    }
    return { data: payment };
  }

  /**
   * 创建退款
   */
  @Post('refund')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建退款', description: '创建退款申请' })
  @HttpCode(HttpStatus.OK)
  async createRefund(@CurrentUser() user: OutputUserDto, @Body() dto: CreateRefundDto): PromiseApiResponse<any> {
    const refund = await this.paymentService.createRefund(user.id, dto);
    return { data: refund };
  }
}
