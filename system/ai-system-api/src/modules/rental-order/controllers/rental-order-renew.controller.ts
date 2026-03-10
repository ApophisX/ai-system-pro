import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser } from '@/modules/base/auth/decorators/current-user.decorator';
import { RentalOrderRenewService } from '../services/rental-order-renew.service';
import { RenewRentalOrderDto, RenewPreviewDto, OutputRentalOrderDto, OutputPayRentalOrderResultDto } from '../dto';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { OutputUserDto } from '@/modules/base/user/dto';
import { PayRenewalDto } from '../dto/pay-renewal.dto';

/**
 * 续租接口
 */
@ApiTags('RentalOrderRenew')
@UseGuards(JwtAuthGuard)
@Controller('app/rental-order')
export class RentalOrderRenewController {
  constructor(private readonly renewService: RentalOrderRenewService) {}

  /**
   * 发起续租
   */
  @Post(':orderId/renew')
  @ApiBearerAuth()
  @ApiOperation({ summary: '发起续租', description: '承租方在使用中订单发起续租申请，创建续租支付账单' })
  @ApiParam({ name: 'orderId', description: '订单 ID' })
  @SwaggerApiResponse(OutputRentalOrderDto)
  async renew(
    @CurrentUser() user: OutputUserDto,
    @Param('orderId') orderId: string,
    @Body() dto: RenewRentalOrderDto,
  ): PromiseApiResponse<OutputRentalOrderDto> {
    const order = await this.renewService.renewOrder(user.id, orderId, dto);
    return { data: order, message: '续租申请成功，请完成支付' };
  }

  /**
   * 续租预计算
   */
  @Get(':orderId/renew-preview')
  @ApiBearerAuth()
  @ApiOperation({ summary: '续租预计算', description: '查询续租价格与新租期结束日期' })
  @ApiParam({ name: 'orderId', description: '订单 ID' })
  @SwaggerApiResponse(RenewPreviewDto)
  async renewPreview(
    @CurrentUser() user: OutputUserDto,
    @Param('orderId') orderId: string,
    @Query('duration', ParseIntPipe) duration: number,
  ): PromiseApiResponse<RenewPreviewDto> {
    const preview = await this.renewService.renewPreview(user.id, orderId, duration);
    return { data: preview };
  }

  /**
   * 支付续租账单
   */
  @Post(':orderId/pay-renewal')
  @ApiBearerAuth()
  @ApiOperation({ summary: '支付续租账单', description: '承租方支付续租生成的待支付账单' })
  @ApiParam({ name: 'orderId', description: '订单 ID' })
  @SwaggerApiResponse(OutputPayRentalOrderResultDto)
  async payRenewal(
    @CurrentUser() user: OutputUserDto,
    @Param('orderId') orderId: string,
    @Body() dto: PayRenewalDto,
  ): PromiseApiResponse<OutputPayRentalOrderResultDto> {
    const result = await this.renewService.payRenewal(user.id, orderId, dto);
    return { data: result, message: '支付请求已创建' };
  }
}
