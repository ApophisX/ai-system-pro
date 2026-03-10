import { Controller, Get, Param, Query, UseGuards, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser } from '@/modules/base/auth/decorators/current-user.decorator';
import { DepositService } from '../services';
import { QueryDepositDto, OutputDepositDto, OutputLesseeDepositSummaryDto } from '../dto';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { OutputUserDto } from '@/modules/base/user/dto';

/**
 * 承租方押金控制器
 *
 * 为前端承租方展示押金相关数据
 */
@ApiTags('AppLesseeDeposit')
@UseGuards(JwtAuthGuard)
@Controller('app/deposit/lessee')
export class AppLesseeDepositController {
  constructor(private readonly depositService: DepositService) {
    //
  }

  /**
   * 押金明细列表
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '押金明细列表',
    description: '查询当前承租方的押金记录明细',
  })
  @SwaggerApiResponse([OutputDepositDto])
  async queryDeposits(
    @CurrentUser() user: OutputUserDto,
    @Query() dto: QueryDepositDto,
  ): PromiseApiResponse<OutputDepositDto[]> {
    const result = await this.depositService.queryDeposits(user.id, dto);
    return { data: result.data, meta: result.meta };
  }

  /**
   * 当前押金数据汇总
   */
  @Get('summary')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '当前押金数据',
    description: '获取当前承租方的押金汇总：冻结押金、已扣除、累计退还、可释放金额',
  })
  @SwaggerApiResponse(OutputLesseeDepositSummaryDto)
  async getDepositSummary(@CurrentUser() user: OutputUserDto): PromiseApiResponse<OutputLesseeDepositSummaryDto> {
    const summary = await this.depositService.getLesseeDepositSummary(user.id);
    return { data: summary };
  }

  /**
   * 根据订单 ID 获取押金
   */
  @Get('order/:orderId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '根据订单获取押金',
    description: '根据订单 ID 获取押金记录',
  })
  @ApiParam({ name: 'orderId', description: '订单 ID' })
  @SwaggerApiResponse(OutputDepositDto)
  async getDepositByOrderId(
    @CurrentUser() user: OutputUserDto,
    @Param('orderId') orderId: string,
  ): PromiseApiResponse<OutputDepositDto> {
    const deposit = await this.depositService.getDepositByOrderId(orderId);
    if (!deposit) {
      throw new NotFoundException('押金记录不存在');
    }
    if (deposit.userId !== user.id) {
      throw new ForbiddenException('无权查看此押金记录');
    }
    return { data: deposit };
  }

  /**
   * 获取押金详情
   */
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取押金详情',
    description: '根据押金 ID 获取押金详情',
  })
  @ApiParam({ name: 'id', description: '押金 ID' })
  @SwaggerApiResponse(OutputDepositDto)
  async getDepositById(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
  ): PromiseApiResponse<OutputDepositDto> {
    const deposit = await this.depositService.getDepositById(id, user.id);
    if (!deposit) {
      throw new NotFoundException('押金记录不存在');
    }
    return { data: deposit };
  }

  /**
   * 获取押金扣款记录列表
   */
  @Get(':id/deductions')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取押金扣款记录',
    description: '获取押金的所有扣款记录',
  })
  @ApiParam({ name: 'id', description: '押金 ID' })
  @SwaggerApiResponse([OutputDepositDto])
  async getDeductions(@CurrentUser() user: OutputUserDto, @Param('id') id: string): PromiseApiResponse<any> {
    await this.depositService.getDepositById(id, user.id);
    const deductions = await this.depositService.getDeductions(id);
    return { data: deductions };
  }
}
