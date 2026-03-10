import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { RolesGuard } from '@/modules/base/acl/guards';
import { Roles } from '@/modules/base/acl/decorators';
import { SystemRoleCode } from '@/modules/base/acl/enums';
import { CurrentUser } from '@/modules/base/auth/decorators';
import { UserAccessTokenClaims } from '@/modules/base/auth/dto/output-auth.dto';
import { CommunityQueryService, CommunityAuditService } from '../services';
import { QueryCommunityAdminDto, OutputCommunityDto, RejectCommunityDto, ForceCloseCommunityDto } from '../dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';

/**
 * 管理端社区控制器
 */
@ApiTags('AdminCommunity')
@Controller('admin/communities')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SystemRoleCode.PLATFORM_ADMIN)
export class AdminCommunityController {
  constructor(
    private readonly queryService: CommunityQueryService,
    private readonly auditService: CommunityAuditService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '社区审核列表' })
  @SwaggerApiResponse([OutputCommunityDto])
  async getList(@Query() dto: QueryCommunityAdminDto) {
    return this.queryService.getAdminList(dto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '社区详情（管理端）' })
  @ApiParam({ name: 'id', description: '社区 ID' })
  @SwaggerApiResponse(OutputCommunityDto)
  async getDetail(@Param('id') id: string) {
    return this.queryService.getAdminDetail(id);
  }

  @Post(':id/approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: '审核通过' })
  @ApiParam({ name: 'id', description: '社区 ID' })
  async approve(@Param('id') id: string, @CurrentUser() user: UserAccessTokenClaims) {
    const community = await this.auditService.approve(id, user.id);
    return { data: community, message: '审核通过' };
  }

  @Post(':id/reject')
  @ApiBearerAuth()
  @ApiOperation({ summary: '审核拒绝' })
  @ApiParam({ name: 'id', description: '社区 ID' })
  async reject(@Param('id') id: string, @Body() dto: RejectCommunityDto, @CurrentUser() user: UserAccessTokenClaims) {
    const community = await this.auditService.reject(id, dto, user.id);
    return { data: community, message: '已拒绝' };
  }

  @Post(':id/force-close')
  @ApiBearerAuth()
  @ApiOperation({ summary: '强制关闭社区' })
  @ApiParam({ name: 'id', description: '社区 ID' })
  async forceClose(
    @Param('id') id: string,
    @Body() dto: ForceCloseCommunityDto,
    @CurrentUser() user: UserAccessTokenClaims,
  ) {
    const community = await this.auditService.forceClose(id, dto, user.id);
    return { data: community, message: '已关闭' };
  }
}
