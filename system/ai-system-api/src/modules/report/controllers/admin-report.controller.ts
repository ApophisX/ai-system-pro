import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { RolesGuard } from '@/modules/base/acl/guards';
import { Roles } from '@/modules/base/acl/decorators/roles.decorator';
import { SystemRoleCode } from '@/modules/base/acl/enums';
import { CurrentUser } from '@/modules/base/auth/decorators/current-user.decorator';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { AdminQueryReportDto, OutputReportDto, HandleReportDto } from '../dto';
import { OutputUserDto } from '@/modules/base/user/dto';
import { ReportQueryService, ReportHandleService } from '../services';

/**
 * Admin 端举报控制器
 *
 * 后台查询举报列表、处理举报
 */
@ApiTags('AdminReport')
@Controller('admin/report/specification')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SystemRoleCode.PLATFORM_ADMIN, SystemRoleCode.PLATFORM_OPERATOR, SystemRoleCode.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminReportController {
  constructor(
    private readonly queryService: ReportQueryService,
    private readonly handleService: ReportHandleService,
  ) {}

  /**
   * 分页查询举报列表
   */
  @Get()
  @ApiOperation({
    summary: '查询举报列表',
    description: '分页查询举报列表，支持按状态、原因、举报人、资产、时间筛选',
  })
  @SwaggerApiResponse([OutputReportDto], { description: '举报列表' })
  async getList(@Query() dto: AdminQueryReportDto) {
    return this.queryService.getAdminList(dto);
  }

  /**
   * 获取举报详情
   */
  @Get(':id')
  @ApiOperation({
    summary: '获取举报详情',
    description: '根据 ID 获取举报详情',
  })
  @ApiParam({ name: 'id', description: '举报 ID', example: 1 })
  @SwaggerApiResponse(OutputReportDto, { description: '举报详情' })
  async getById(@Param('id', ParseIntPipe) id: number): PromiseApiResponse<OutputReportDto> {
    const result = await this.queryService.getById(id);
    return { data: result };
  }

  /**
   * 处理举报
   */
  @Put(':id/handle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '处理举报',
    description: '审核举报：通过(approve)、驳回(reject)、标记恶意举报(mark_malicious)',
  })
  @ApiParam({ name: 'id', description: '举报 ID', example: 1 })
  @SwaggerApiResponse(Boolean, { description: '处理成功' })
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: HandleReportDto,
    @CurrentUser() user: OutputUserDto,
  ): PromiseApiResponse<boolean> {
    await this.handleService.handle(id, user.id, dto);
    return { data: true, message: '处理成功' };
  }
}
