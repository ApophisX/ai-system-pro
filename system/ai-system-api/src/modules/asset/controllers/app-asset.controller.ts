import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser, PublicOrAuth } from '@/modules/base/auth/decorators';
import { AssetService } from '../services';
import {
  CreateAssetDto,
  UpdateAssetDto,
  AppQueryAssetDto,
  MyAssetQueryDto,
  OutputAssetListItemDto,
  OutputAssetDetailDto,
  OutputMyAssetListItemDto,
  OutputAssetCreationStatsDto,
} from '../dto';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { OutputUserDto } from '@/modules/base/user/dto';
import { JwtAuthGuardForPublic } from '@/modules/base/auth/guards/jwt-auth.guard';
/**
 * App 端资产控制器
 *
 * 提供资产的发布、管理、查询等接口
 */
@ApiTags()
@Controller('app/asset')
@UseGuards(JwtAuthGuard)
export class AppAssetController {
  constructor(private readonly assetService: AssetService) {
    //
  }

  // ========== 用户接口（需要登录）==========

  /**
   * 获取资产创建统计信息
   */

  @Get('my/creation-stats')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取资产创建统计信息',
    description: '获取当前用户的资产创建数量统计，用于判断是否可以继续创建资产',
  })
  @SwaggerApiResponse(OutputAssetCreationStatsDto)
  async getCreationStats(@CurrentUser() user: OutputUserDto): PromiseApiResponse<OutputAssetCreationStatsDto> {
    const stats = await this.assetService.getCreationStats(user.id);
    return { data: stats };
  }

  // ========== 公开接口（无需登录）==========

  /**
   * 获取资产列表（公开），不查询社区资产
   */
  @Get()
  @PublicOrAuth()
  @UseGuards(JwtAuthGuardForPublic)
  @ApiOperation({
    summary: '获取资产列表',
    description: '获取可租赁的资产列表，支持分页、搜索、筛选、排序',
  })
  @SwaggerApiResponse([OutputAssetListItemDto], {
    description: '获取可租赁的资产列表，支持分页、搜索、筛选、排序',
  })
  async getAssetList(@CurrentUser() user: OutputUserDto | undefined, @Query() dto: AppQueryAssetDto) {
    return this.assetService.getPublicList(dto, user?.id);
  }

  /**
   * 获取资产详情（公开）
   */
  @Get(':id')
  @PublicOrAuth()
  @UseGuards(JwtAuthGuardForPublic)
  @ApiOperation({
    summary: '获取资产详情',
    description: '获取资产详情信息，包含租赁方案、分类、标签等',
  })
  @ApiParam({ name: 'id', description: '资产 ID', example: 'uuid-of-asset' })
  @SwaggerApiResponse(OutputAssetDetailDto, {
    description: '资产详情',
  })
  async getAssetDetail(
    @Param('id') id: string,
    @CurrentUser() user?: OutputUserDto,
  ): PromiseApiResponse<OutputAssetDetailDto> {
    const result = await this.assetService.getPublicDetail(id, user?.id);
    return { data: result };
  }

  // ========== 用户接口（需要登录）==========

  /**
   * 发布资产
   */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '创建资产',
    description: '创建新的资产，可选择直接发布或保存为草稿',
  })
  @SwaggerApiResponse(String)
  async createAsset(@Body() dto: CreateAssetDto, @CurrentUser() user: OutputUserDto) {
    const result = await this.assetService.create(dto, user);
    const res: {
      data: string;
      message: string;
      communityBindStatus?: 'bound' | 'failed';
      communityBindMessage?: string;
    } = {
      data: result.id,
      message: '创建成功，待管理员审核',
    };
    const withBind = result as { communityBindStatus?: 'bound' | 'failed'; communityBindMessage?: string };
    if (withBind.communityBindStatus) {
      res.communityBindStatus = withBind.communityBindStatus;
      if (withBind.communityBindMessage) res.communityBindMessage = withBind.communityBindMessage;
    }
    return res;
  }

  /**
   * 获取我的资产列表
   */
  @Get('my/list')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取我的资产列表',
    description: '获取当前用户发布的资产列表',
  })
  @SwaggerApiResponse([OutputMyAssetListItemDto], {
    description: '我的资产列表',
  })
  async getMyAssets(@Query() dto: MyAssetQueryDto, @CurrentUser() user: OutputUserDto): PromiseApiResponse {
    const result = await this.assetService.getMyAssets(user.id, dto);
    return result;
  }

  /**
   * 获取我的资产详情
   */
  @Get('my/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取我的资产详情',
    description: '获取当前用户发布的资产详情',
  })
  @ApiParam({ name: 'id', description: '资产 ID', example: 'uuid-of-asset' })
  @SwaggerApiResponse(OutputAssetDetailDto, {
    description: '资产详情',
  })
  async getMyAssetDetail(
    @Param('id') id: string,
    @CurrentUser() user: OutputUserDto,
  ): PromiseApiResponse<OutputAssetDetailDto> {
    const result = await this.assetService.getMyAssetDetail(id, user.id);
    return { data: result };
  }

  /**
   * 更新资产
   */
  @Put('my/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新资产', description: '更新资产信息' })
  @ApiParam({ name: 'id', description: '资产 ID', example: 'uuid-of-asset' })
  @SwaggerApiResponse(OutputAssetDetailDto)
  async updateAsset(@Param('id') id: string, @Body() dto: UpdateAssetDto, @CurrentUser() user: OutputUserDto) {
    const asset = await this.assetService.update(id, dto, user.id);
    return { id: asset.id, message: '资产更新成功' };
  }

  /**
   * 删除资产
   */
  @Delete('my/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '删除资产',
    description: '删除资产',
  })
  @ApiParam({
    name: 'id',
    description: '资产 ID',
    example: 'uuid-of-asset',
  })
  @SwaggerApiResponse(Boolean, { description: '删除成功' })
  async deleteAsset(@Param('id') id: string, @CurrentUser() user: OutputUserDto): PromiseApiResponse<boolean> {
    await this.assetService.delete(id, user.id);
    return { data: true, message: '资产删除成功' };
  }

  /**
   * 上架资产
   */
  @Post('my/:id/publish')
  @ApiBearerAuth()
  @ApiOperation({ summary: '上架资产', description: '将资产状态改为可租赁' })
  @ApiParam({ name: 'id', description: '资产 ID', example: 'uuid-of-asset' })
  @SwaggerApiResponse(OutputAssetListItemDto, { description: '上架成功' })
  async publishAsset(@Param('id') id: string, @CurrentUser() user: OutputUserDto) {
    const result = await this.assetService.publish(id, user.id);
    return result;
  }

  /**
   * 下架资产
   */
  @Post('my/:id/offline')
  @ApiBearerAuth()
  @ApiOperation({ summary: '下架资产', description: '将资产状态改为下架' })
  @ApiParam({ name: 'id', description: '资产 ID', example: 'uuid-of-asset' })
  @SwaggerApiResponse(OutputAssetListItemDto, { description: '下架成功' })
  async offlineAsset(@Param('id') id: string, @CurrentUser() user: OutputUserDto) {
    const asset = await this.assetService.offline(id, user.id);
    return { data: asset, message: '资产已下架' };
  }
}
