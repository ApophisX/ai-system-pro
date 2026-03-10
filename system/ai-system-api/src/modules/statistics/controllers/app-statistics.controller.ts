import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/base/auth/decorators/current-user.decorator';
import { UserAccessTokenClaims } from '@/modules/base/auth/dto/output-auth.dto';
import { StatisticsService } from '../services';
import {
  OutputLesseeStatisticsDto,
  OutputLesseeOrderStatisticsDto,
  OutputLessorStatisticsDto,
  OutputLessorPendingOrderStatisticsDto,
  OutputLessorFinanceStatisticsDto,
  OutputLessorOrderStatisticsDto,
  QueryLessorFinanceStatisticsDto,
} from '../dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';

/**
 * 统计控制器（App端）
 *
 * 提供各种统计数据的查询接口
 */
@ApiTags('AppStatistics')
@Controller('app/statistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppStatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {
    //
  }

  /**
   * 获取承租方统计数据
   *
   * 用于"我的"页面展示承租方相关统计信息：
   * - 订单总数
   * - 待支付订单数量
   * - 押金总金额
   * - 收藏的资产数量
   */
  @Get('lessee')
  @ApiOperation({ summary: '获取承租方统计数据', description: '获取订单数量、待支付订单数量、押金金额和收藏数量' })
  @SwaggerApiResponse(OutputLesseeStatisticsDto, { description: '承租方统计数据' })
  async getLesseeStatistics(@CurrentUser() user: UserAccessTokenClaims): PromiseApiResponse<OutputLesseeStatisticsDto> {
    const result = await this.statisticsService.getLesseeStatistics(user.id);
    return {
      data: result,
    };
  }

  /**
   * 获取承租方订单统计数量
   *
   * 用于"我的订单"页面展示各个状态的订单数量：
   * - 待支付订单数量
   * - 使用中订单数量
   * - 已逾期订单数量
   * - 已完成订单数量
   * - 售后中（争议中）订单数量
   */
  @Get('lessee/orders')
  @ApiOperation({
    summary: '获取承租方订单统计数量',
    description: '获取承租方各个状态的订单数量：待支付、使用中、已逾期、已完成、售后中（争议中）',
  })
  @SwaggerApiResponse(OutputLesseeOrderStatisticsDto, { description: '承租方订单统计数量' })
  async getLesseeOrderStatistics(
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<OutputLesseeOrderStatisticsDto> {
    const result = await this.statisticsService.getLesseeOrderStatistics(user.id);
    return {
      data: result,
    };
  }

  /**
   * 获取出租方统计数据
   *
   * 用于统计出租方相关数据：
   * - 已发布的资产数量
   * - 进行中的订单数量
   * - 待处理订单数量
   * - 累计收入
   */
  @Get('lessor')
  @ApiOperation({
    summary: '获取出租方统计数据',
    description: '获取已发布的资产数量、进行中的订单、待处理订单、累计收入',
  })
  @SwaggerApiResponse(OutputLessorStatisticsDto, { description: '出租方统计数据' })
  async getLessorStatistics(@CurrentUser() user: UserAccessTokenClaims): PromiseApiResponse<OutputLessorStatisticsDto> {
    const result = await this.statisticsService.getLessorStatistics(user.id);
    return {
      data: result,
    };
  }

  /**
   * 获取出租方待处理订单数据
   *
   * 用于统计出租方待处理的订单数量：
   * - 已支付数量（待收货）
   * - 取消订单确认数量
   * - 逾期订单数量（包含超时使用）
   * - 已归还待确认数量
   * - 待归还数量
   * - 争议中数量
   */
  @Get('lessor/pending-orders')
  @ApiOperation({
    summary: '获取出租方待处理订单统计数据',
    description: '获取已支付、取消订单确认、逾期、已归还待确认、待归还、争议中的订单数量',
  })
  @SwaggerApiResponse(OutputLessorPendingOrderStatisticsDto, { description: '出租方待处理订单统计数据' })
  async getLessorPendingOrderStatistics(
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<OutputLessorPendingOrderStatisticsDto> {
    const result = await this.statisticsService.getLessorPendingOrderStatistics(user.id);
    return {
      data: result,
    };
  }

  /**
   * 获取出租方订单统计数据
   */
  @Get('lessor/orders')
  @ApiOperation({
    summary: '获取出租方订单统计数据',
    description: '获取出租方各个状态的订单数量：待支付、使用中、已逾期、已完成、售后中（争议中）',
  })
  @SwaggerApiResponse(OutputLessorOrderStatisticsDto, { description: '出租方订单统计数据' })
  async getLessorOrderStatistics(
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<OutputLessorOrderStatisticsDto> {
    const result = await this.statisticsService.getLessorOrderStatistics(user.id);
    return {
      data: result,
    };
  }

  /**
   * 获取出租方财务统计数据
   *
   * 用于展示出租方的财务统计信息：
   * - 累计结算：已提现的金额
   * - 可提现余额：已入账收入 - 已提现 - 已退款租金
   * - 待入账金额：已支付但订单还未完成的金额
   * 支持按 startDate、endDate 筛选，时间按业务发生时间（businessOccurredAt）过滤
   */
  @Get('lessor/finance')
  @ApiOperation({
    summary: '获取出租方财务统计数据',
    description: '获取累计结算、可提现余额、待入账金额。支持按 startDate、endDate 筛选时间范围，按业务发生时间过滤。',
  })
  @SwaggerApiResponse(OutputLessorFinanceStatisticsDto, { description: '出租方财务统计数据' })
  async getLessorFinanceStatistics(
    @CurrentUser() user: UserAccessTokenClaims,
    @Query() dto: QueryLessorFinanceStatisticsDto,
  ): PromiseApiResponse<OutputLessorFinanceStatisticsDto> {
    const result = await this.statisticsService.getLessorFinanceStatistics(user.id, dto);
    return {
      data: result,
    };
  }
}
