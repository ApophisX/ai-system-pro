import { Controller, Get, Put, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser } from '@/modules/base/auth/decorators/current-user.decorator';
import { Roles } from '@/modules/base/acl/decorators';
import { RolesGuard } from '@/modules/base/acl/guards';
import { SystemRoleCode } from '@/modules/base/acl/enums';
import { AssetService } from '../services';
import {
  QueryAssetAdminDto,
  AuditAssetDto,
  ForceOfflineAssetDto,
  OutputAssetAdminListItemDto,
  OutputAssetAdminDetailDto,
} from '../dto';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { OutputUserDto } from '@/modules/base/user/dto';
import { plainToInstance } from 'class-transformer';

/**
 * 后台 - 资产管理
 *
 * 管理员查看所有商家资产、审核、强制下架等操作
 */
@ApiTags('AdminAsset')
@Controller('admin/assets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SystemRoleCode.SUPER_ADMIN, SystemRoleCode.PLATFORM_ADMIN, SystemRoleCode.PLATFORM_OPERATOR)
@ApiBearerAuth()
export class AdminAssetController {
  constructor(private readonly assetService: AssetService) {}

  /**
   * 分页查询资产列表（支持按商家、状态、审核状态、分类、关键字筛选）
   */
  @Get()
  @ApiOperation({
    summary: '分页查询资产列表',
    description: '后台分页查询所有商家的资产，按出租方、资产状态、审核状态、分类、关键字筛选',
  })
  @SwaggerApiResponse([OutputAssetAdminListItemDto], {
    description: '资产列表，data 为列表项，meta 为分页信息',
  })
  async getList(@Query() dto: QueryAssetAdminDto): PromiseApiResponse<OutputAssetAdminListItemDto[]> {
    const { data, meta } = await this.assetService.getAdminList(dto);
    const list = plainToInstance(OutputAssetAdminListItemDto, data, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
    return { data: list, meta };
  }

  /**
   * 根据 ID 获取资产详情
   */
  @Get(':id')
  @ApiOperation({
    summary: '获取资产详情',
    description: '根据资产 ID 获取详情，含出租方、分类、租赁方案等',
  })
  @ApiParam({ name: 'id', description: '资产 ID' })
  @SwaggerApiResponse(OutputAssetAdminDetailDto, { description: '资产详情' })
  async getById(@Param('id') id: string): PromiseApiResponse<OutputAssetAdminDetailDto> {
    const asset = await this.assetService.getAdminDetail(id);
    const dto = plainToInstance(OutputAssetAdminDetailDto, asset, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
    return { data: dto };
  }

  /**
   * 审核资产（通过/拒绝）
   */
  @Put(':id/audit')
  @ApiOperation({
    summary: '审核资产',
    description:
      '对状态为【待审核】或【审核中】的资产进行审核。通过则资产可对外展示；拒绝则需填写审核意见，出租方将收到通知。',
  })
  @ApiParam({ name: 'id', description: '资产 ID' })
  @SwaggerApiResponse(OutputAssetAdminDetailDto, { description: '审核后的资产' })
  async audit(
    @Param('id') id: string,
    @Body() dto: AuditAssetDto,
    @CurrentUser() user: OutputUserDto,
  ): PromiseApiResponse<OutputAssetAdminDetailDto> {
    const asset = await this.assetService.auditByAdmin(id, dto, user.id);
    return { data: asset as OutputAssetAdminDetailDto, message: '审核成功' };
  }

  /**
   * 强制下架资产
   */
  @Put(':id/force-offline')
  @ApiOperation({
    summary: '强制下架资产',
    description: '平台强制下架资产，无论资产当前状态如何。下架后用户端不可见，出租方将收到通知。',
  })
  @ApiParam({ name: 'id', description: '资产 ID' })
  @SwaggerApiResponse(OutputAssetAdminDetailDto, { description: '下架后的资产' })
  async forceOffline(
    @Param('id') id: string,
    @Body() dto: ForceOfflineAssetDto,
  ): PromiseApiResponse<OutputAssetAdminDetailDto> {
    const asset = await this.assetService.forceOfflineByAdmin(id, dto.reason);
    return { data: asset as OutputAssetAdminDetailDto, message: '资产已强制下架' };
  }
}
