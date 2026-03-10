import { Controller, Get, Post, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser } from '@/modules/base/auth/decorators/current-user.decorator';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { CreateReportDto, AppQueryReportDto, OutputReportDto } from '../dto';
import { OutputUserDto } from '@/modules/base/user/dto';
import { ReportCreateService, ReportQueryService } from '../services';

/**
 * App 端举报控制器
 *
 * 用户提交举报、查询自己的举报记录
 */
@ApiTags('AppReport')
@Controller('app/report/specification')
@UseGuards(JwtAuthGuard)
export class AppReportController {
  constructor(
    private readonly createService: ReportCreateService,
    private readonly queryService: ReportQueryService,
  ) {}

  /**
   * 提交举报
   */
  @Post()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '提交举报',
    description: '用户对资产规格信息（价格、图片、描述等）进行举报',
  })
  @SwaggerApiResponse(OutputReportDto, { description: '举报提交成功' })
  async create(@Body() dto: CreateReportDto, @CurrentUser() user: OutputUserDto): PromiseApiResponse<OutputReportDto> {
    const result = await this.createService.create(user.id, dto);
    return { data: result, message: '举报已提交，我们会尽快处理' };
  }

  /**
   * 查询自己的举报记录
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '查询我的举报记录',
    description: '分页查询当前用户的举报列表，支持按状态、原因、资产筛选',
  })
  @SwaggerApiResponse([OutputReportDto], { description: '举报列表' })
  async getMyList(@Query() dto: AppQueryReportDto, @CurrentUser() user: OutputUserDto) {
    return this.queryService.getMyList(user.id, dto);
  }
}
