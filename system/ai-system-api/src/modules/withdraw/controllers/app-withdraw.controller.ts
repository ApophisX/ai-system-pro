import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser } from '@/modules/base/auth/decorators';
import { OutputUserDto } from '@/modules/base/user/dto';
import { WithdrawService } from '../services/withdraw.service';
import { CreateWithdrawDto } from '../dto/create-withdraw.dto';
import { QueryWithdrawDto } from '../dto/query-withdraw.dto';
import { OutputWithdrawOrderDto } from '../dto/output-withdraw.dto';
import { OutputMerchantAccountDto } from '../dto/output-merchant-account.dto';
import { SwaggerApiResponse } from '@/common/decorators';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';

/**
 * 商家提现 App 端 Controller
 *
 * 提供商家申请提现、取消、查询等接口
 */
@ApiTags('AppWithdraw')
@Controller('app/withdraw')
@UseGuards(JwtAuthGuard)
export class AppWithdrawController {
  constructor(private readonly withdrawService: WithdrawService) {}

  @Get('account')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取商家账户余额',
    description: '获取可提现余额、冻结余额、总余额（同步 LessorFinance 后）',
  })
  @SwaggerApiResponse(OutputMerchantAccountDto, { description: '商家账户' })
  async getAccount(@CurrentUser() user: OutputUserDto): PromiseApiResponse<OutputMerchantAccountDto> {
    const result = await this.withdrawService.getAccount(user.id);
    return { data: result };
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '申请提现',
    description: '商家申请提现，支持微信/支付宝（银行卡预留）。需实名认证，校验余额、风控限制',
  })
  @SwaggerApiResponse(OutputWithdrawOrderDto, { description: '提现单' })
  async apply(
    @CurrentUser() user: OutputUserDto,
    @Body() dto: CreateWithdrawDto,
  ): PromiseApiResponse<OutputWithdrawOrderDto> {
    const result = await this.withdrawService.applyWithdraw(user.id, dto);
    return { data: result };
  }

  @Post(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '取消提现',
    description: '商户在待审核/审核中时主动取消',
  })
  @SwaggerApiResponse(OutputWithdrawOrderDto, { description: '提现单' })
  async cancel(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
  ): PromiseApiResponse<OutputWithdrawOrderDto> {
    const result = await this.withdrawService.cancelByMerchant(user.id, id);
    return { data: result };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '提现订单列表',
    description: '分页查询商家的提现订单',
  })
  @SwaggerApiResponse([OutputWithdrawOrderDto], { description: '提现订单列表' })
  async list(
    @CurrentUser() user: OutputUserDto,
    @Query() dto: QueryWithdrawDto,
  ): PromiseApiResponse<OutputWithdrawOrderDto[]> {
    const result = await this.withdrawService.findPageList(user.id, dto);
    return { data: result.data, meta: result.meta };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '提现单详情',
  })
  @SwaggerApiResponse(OutputWithdrawOrderDto, { description: '提现单' })
  async getById(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
  ): PromiseApiResponse<OutputWithdrawOrderDto> {
    const result = await this.withdrawService.getById(user.id, id);
    return { data: result };
  }
}
