import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser } from '@/modules/base/auth/decorators';
import { UserAccessTokenClaims } from '@/modules/base/auth/dto/output-auth.dto';
import {
  CommunityCreateService,
  CommunityQueryService,
  CommunityJoinService,
  CommunityDeleteService,
  CommunityUpdateService,
} from '../services';
import {
  CreateCommunityDto,
  QueryCommunityDto,
  QueryMyJoinedCommunityDto,
  OutputCommunityDto,
  OutputCommunityListItemDto,
  JoinCommunityDto,
} from '../dto';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';

/**
 * App 端社区控制器
 *
 * 路由顺序：my、created 必须在 :id 之前
 */
@ApiTags('AppCommunity')
@Controller('app/communities')
@UseGuards(JwtAuthGuard)
export class AppCommunityController {
  constructor(
    private readonly createService: CommunityCreateService,
    private readonly queryService: CommunityQueryService,
    private readonly joinService: CommunityJoinService,
    private readonly deleteService: CommunityDeleteService,
    private readonly updateService: CommunityUpdateService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建社区' })
  @SwaggerApiResponse(OutputCommunityDto)
  async create(
    @Body() dto: CreateCommunityDto,
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<OutputCommunityDto> {
    const community = await this.createService.create(dto, user.id);
    return { data: community as unknown as OutputCommunityDto };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '社区列表（可发现+已加入）' })
  @SwaggerApiResponse([OutputCommunityListItemDto])
  async getList(@Query() dto: QueryCommunityDto, @CurrentUser() user: UserAccessTokenClaims) {
    return this.queryService.getList(dto, user.id);
  }

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: '我加入的社区列表' })
  @SwaggerApiResponse([OutputCommunityListItemDto])
  async getMyJoined(@Query() dto: QueryMyJoinedCommunityDto, @CurrentUser() user: UserAccessTokenClaims) {
    return this.queryService.getMyJoined(dto, user.id);
  }

  @Get('created')
  @ApiBearerAuth()
  @ApiOperation({ summary: '我创建的社区列表' })
  @SwaggerApiResponse([OutputCommunityDto])
  async getMyCreated(
    @CurrentUser() user: UserAccessTokenClaims,
    @Query('page') page: number = 0,
    @Query('pageSize') pageSize: number = 20,
    @Query('status') status?: string,
  ) {
    return this.queryService.getMyCreated(user.id, Number(page) || 0, Number(pageSize) || 20, status as any);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '社区详情' })
  @ApiParam({ name: 'id', description: '社区 ID' })
  @SwaggerApiResponse(OutputCommunityDto)
  async getDetail(
    @Param('id') id: string,
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<OutputCommunityDto> {
    const community = await this.queryService.getDetail(id, user.id);
    return { data: community };
  }

  @Post(':id/join')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '加入社区' })
  @ApiParam({ name: 'id', description: '社区 ID' })
  async join(
    @Param('id') id: string,
    @CurrentUser() user: UserAccessTokenClaims,
    @Body() dto?: JoinCommunityDto,
  ): PromiseApiResponse<void> {
    await this.joinService.join(id, user.id, dto ?? ({} as JoinCommunityDto));
    return { message: '加入成功' };
  }

  @Post(':id/leave')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '退出社区' })
  @ApiParam({ name: 'id', description: '社区 ID' })
  async leave(@Param('id') id: string, @CurrentUser() user: UserAccessTokenClaims): PromiseApiResponse<void> {
    await this.joinService.leave(id, user.id);
    return { message: '退出成功' };
  }

  @Post(':id/reset-invite-code')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '重置邀请码' })
  @ApiParam({ name: 'id', description: '社区 ID' })
  @SwaggerApiResponse(OutputCommunityDto, { description: '重置成功，返回更新后的社区信息（含新邀请码）' })
  async resetInviteCode(
    @Param('id') id: string,
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<OutputCommunityDto> {
    await this.updateService.resetInviteCode(id, user.id);
    const community = await this.queryService.getDetail(id, user.id);
    return { data: community };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除社区' })
  @ApiParam({ name: 'id', description: '社区 ID' })
  @SwaggerApiResponse(Boolean, { description: '删除成功' })
  async delete(@Param('id') id: string, @CurrentUser() user: UserAccessTokenClaims): PromiseApiResponse<void> {
    await this.deleteService.delete(id, user.id);
    return { message: '删除成功' };
  }
}
