import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { JwtAuthGuardForPublic } from '@/modules/base/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/base/auth/decorators/current-user.decorator';
import { NoAuth } from '@/common/decorators/no-auth.decorator';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import {
  CreateRentalReviewDto,
  QueryRentalReviewDto,
  OutputRentalReviewDto,
  OutputRentalReviewSummaryDto,
  ReplyRentalReviewDto,
} from '../dto';
import { OutputUserDto } from '@/modules/base/user/dto';
import { RentalReviewCreateService, RentalReviewQueryService, RentalReviewReplyService } from '../services';

/**
 * App 端租赁评价控制器
 *
 * 承租方：提交评价
 * 出租方：回复评价
 * 公开：查询资产评价列表、汇总
 */
@ApiTags('AppRentalReview')
@Controller('app/rental-review')
export class AppRentalReviewController {
  constructor(
    private readonly createService: RentalReviewCreateService,
    private readonly queryService: RentalReviewQueryService,
    private readonly replyService: RentalReviewReplyService,
  ) {}

  /**
   * 获取资产评价汇总（公开）
   * 注意：此路由须在 getList 之前，避免被误匹配
   */
  @Get('asset/:assetId/summary')
  @NoAuth()
  @UseGuards(JwtAuthGuardForPublic)
  @ApiOperation({
    summary: '获取资产评价汇总',
    description: '获取指定资产的评价数量、平均分、星级分布',
  })
  @ApiParam({ name: 'assetId', description: '资产 ID', example: 'uuid-of-asset' })
  @SwaggerApiResponse(OutputRentalReviewSummaryDto, { description: '评价汇总' })
  async getSummary(@Param('assetId') assetId: string): PromiseApiResponse<OutputRentalReviewSummaryDto> {
    const result = await this.queryService.getSummary(assetId);
    return { data: result };
  }

  /**
   * 承租方提交评价
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '提交评价',
    description: '承租方对已完成的租赁订单提交评价，一单一评，需审核通过后展示',
  })
  @SwaggerApiResponse(OutputRentalReviewDto, { description: '评价提交成功' })
  async create(
    @Body() dto: CreateRentalReviewDto,
    @CurrentUser() user: OutputUserDto,
  ): PromiseApiResponse<OutputRentalReviewDto> {
    const result = await this.createService.create(user.id, dto);
    return { data: result, message: '评价提交成功，等待审核' };
  }

  /**
   * 查询资产评价列表（公开）
   */
  @Get()
  @NoAuth()
  @UseGuards(JwtAuthGuardForPublic)
  @ApiOperation({
    summary: '查询资产评价列表',
    description: '获取指定资产的已通过审核的评价列表，支持分页、评分筛选',
  })
  @SwaggerApiResponse([OutputRentalReviewDto], { description: '评价列表' })
  async getList(@Query() dto: QueryRentalReviewDto) {
    return this.queryService.getList(dto);
  }

  /**
   * 出租方回复评价
   */
  @Put(':id/reply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '回复评价',
    description: '出租方对已通过审核的评价进行回复，仅允许回复一次',
  })
  @ApiParam({ name: 'id', description: '评价 ID', example: 'uuid-of-review' })
  @SwaggerApiResponse(Boolean, { description: '回复成功' })
  async reply(
    @Param('id') id: string,
    @Body() dto: ReplyRentalReviewDto,
    @CurrentUser() user: OutputUserDto,
  ): PromiseApiResponse<boolean> {
    await this.replyService.reply(user.id, id, dto);
    return { data: true, message: '回复成功' };
  }
}
