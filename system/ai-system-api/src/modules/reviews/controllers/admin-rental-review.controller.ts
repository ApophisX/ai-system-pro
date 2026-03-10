import { Controller, Get, Put, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { Roles } from '@/modules/base/acl/decorators';
import { RolesGuard } from '@/modules/base/acl/guards';
import { SystemRoleCode } from '@/modules/base/acl/enums';
import { CurrentUser } from '@/modules/base/auth/decorators/current-user.decorator';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { RejectRentalReviewDto, QueryRentalReviewAdminDto, OutputRentalReviewAdminDto } from '../dto';
import { OutputUserDto } from '@/modules/base/user/dto';
import { RentalReviewAuditService, RentalReviewQueryService } from '../services';

/**
 * 后台租赁评价审核控制器
 *
 * 分页查询评价列表（审核与查看）、审核通过/拒绝、隐藏
 */
@ApiTags('AdminRentalReview')
@Controller('admin/rental-review')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SystemRoleCode.SUPER_ADMIN, SystemRoleCode.PLATFORM_ADMIN, SystemRoleCode.PLATFORM_OPERATOR)
@ApiBearerAuth()
export class AdminRentalReviewController {
  constructor(
    private readonly auditService: RentalReviewAuditService,
    private readonly queryService: RentalReviewQueryService,
  ) {}

  /**
   * 分页查询评价列表（支持按状态、资产、出租方、评分筛选，关键字搜索）
   */
  @Get()
  @ApiOperation({
    summary: '分页查询评价列表',
    description:
      '后台分页查询租赁评价，支持按状态（待审核/已通过/已拒绝/已隐藏）、资产、出租方、评分筛选，关键字搜索评论内容',
  })
  @SwaggerApiResponse([OutputRentalReviewAdminDto], {
    description: '评价列表，data 为列表项，meta 为分页信息',
  })
  async getList(@Query() dto: QueryRentalReviewAdminDto): PromiseApiResponse<OutputRentalReviewAdminDto[]> {
    const { data, meta } = await this.queryService.getAdminList(dto);
    return { data, meta };
  }

  /**
   * 审核通过
   */
  @Put(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '审核通过',
    description: '审核通过评价，更新资产统计并公开展示',
  })
  @ApiParam({ name: 'id', description: '评价 ID', example: 'uuid-of-review' })
  @SwaggerApiResponse(Boolean, { description: '审核通过' })
  async approve(@Param('id') id: string, @CurrentUser() user: OutputUserDto): PromiseApiResponse<boolean> {
    await this.auditService.approve(id, user.id);
    return { data: true, message: '审核通过' };
  }

  /**
   * 审核拒绝
   */
  @Put(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '审核拒绝',
    description: '审核拒绝评价，不展示',
  })
  @ApiParam({ name: 'id', description: '评价 ID', example: 'uuid-of-review' })
  @SwaggerApiResponse(Boolean, { description: '审核拒绝' })
  async reject(@Param('id') id: string, @Body() dto: RejectRentalReviewDto): PromiseApiResponse<boolean> {
    await this.auditService.reject(id, dto);
    return { data: true, message: '审核拒绝' };
  }

  /**
   * 隐藏评价（举报/违规后）
   */
  @Put(':id/hide')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '隐藏评价',
    description: '隐藏已通过的评价，回滚资产统计',
  })
  @ApiParam({ name: 'id', description: '评价 ID', example: 'uuid-of-review' })
  @SwaggerApiResponse(Boolean, { description: '隐藏成功' })
  async hide(@Param('id') id: string): PromiseApiResponse<boolean> {
    await this.auditService.hide(id);
    return { data: true, message: '隐藏成功' };
  }
}
