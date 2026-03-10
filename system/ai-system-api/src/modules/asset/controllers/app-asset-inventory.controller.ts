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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser } from '@/modules/base/auth/decorators/current-user.decorator';
import { AssetInventoryService } from '../services/asset-inventory.service';
import {
  CreateAssetInventoryDto,
  UpdateAssetInventoryDto,
  QueryAssetInventoryDto,
  OutputAssetInventoryDto,
  SimpleOutputAssetInventoryDto,
} from '../dto';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { OutputUserDto } from '@/modules/base/user/dto';

/**
 * App 端资产实例控制器
 *
 * 提供资产实例的创建、管理、查询等接口（出租方使用）
 */
@ApiTags('AppAssetInventory')
@Controller('app/asset-inventory')
@UseGuards(JwtAuthGuard)
export class AppAssetInventoryController {
  constructor(private readonly inventoryService: AssetInventoryService) {}

  /**
   * 承租方展示：根据资产 ID 和实例编号获取实例详情
   *
   * 承租方从订单中获取 assetId、inventoryCode 后，调用此接口展示实例的图片、名称、状态等信息。
   */
  @Get('inventory-code/:inventoryCode')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '根据资产 ID 和实例编号获取实例',
    description: '承租方展示用，根据资产 ID 和实例编号获取实例详情（图片、名称、状态等）',
  })
  @ApiParam({ name: 'inventoryCode', description: '实例编号' })
  @ApiQuery({ name: 'assetId', description: '资产 ID', required: true })
  @SwaggerApiResponse(SimpleOutputAssetInventoryDto, {
    description: '实例简要信息',
  })
  async getByInstanceCode(
    @Param('inventoryCode') inventoryCode: string,
    @Query('assetId') assetId: string,
  ): PromiseApiResponse<SimpleOutputAssetInventoryDto> {
    const inventory = await this.inventoryService.getByInventoryCode(assetId, inventoryCode);
    return { data: inventory };
  }

  //------------------------------------- 出租方接口 -------------------------------------

  /**
   * 创建资产实例
   *
   * 支持批量创建：quantity > 1 或 isBatchCreate 时，用 codePrefix+唯一序列号、namePrefix+序号（设备1、设备2）。
   * 用户累计不能超过 1000 个资产实例。
   */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '创建资产实例',
    description:
      '为指定资产创建可租赁的实例。支持批量创建（quantity 或 isBatchCreate），批量时实例编号为前缀+序列号、名称为名称前缀+序号；用户累计不能创建超过 1000 个实例',
  })
  @SwaggerApiResponse(Boolean, {
    description: '单条创建返回一条；批量创建返回数组',
    isArray: true,
  })
  async create(@Body() dto: CreateAssetInventoryDto, @CurrentUser() user: OutputUserDto): PromiseApiResponse<boolean> {
    await this.inventoryService.create(dto, user.id);
    return { data: true, message: '创建资产实例成功' };
  }

  /**
   * 获取资产实例列表
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取资产实例列表',
    description: '获取资产实例列表，支持按资产ID、状态、关键字筛选',
  })
  @SwaggerApiResponse([OutputAssetInventoryDto], {
    description: '资产实例列表',
  })
  async getList(@Query() dto: QueryAssetInventoryDto, @CurrentUser() user: OutputUserDto) {
    return this.inventoryService.getList(dto, user.id);
  }

  /**
   * 根据资产 ID 获取所有实例
   */
  @Get('asset/:assetId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '根据资产 ID 获取所有实例',
    description: '获取指定资产的所有实例列表',
  })
  @ApiParam({ name: 'assetId', description: '资产 ID', example: 'uuid-of-asset' })
  @SwaggerApiResponse([OutputAssetInventoryDto], {
    description: '资产实例列表',
  })
  async getByAssetId(
    @Param('assetId') assetId: string,
    @CurrentUser() user: OutputUserDto,
  ): PromiseApiResponse<OutputAssetInventoryDto[]> {
    const inventories = await this.inventoryService.getByAssetId(assetId, user.id);
    return { data: inventories };
  }

  /**
   * 获取资产实例详情
   */
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取资产实例详情',
    description: '获取资产实例的详细信息',
  })
  @ApiParam({ name: 'id', description: '资产实例 ID', example: 'uuid-of-inventory' })
  @SwaggerApiResponse(OutputAssetInventoryDto, {
    description: '资产实例详情',
  })
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: OutputUserDto,
  ): PromiseApiResponse<OutputAssetInventoryDto> {
    const inventory = await this.inventoryService.getById(id, user.id);
    return { data: inventory };
  }

  /**
   * 更新资产实例
   */
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '更新资产实例',
    description: '更新资产实例信息，如数量、状态、位置等',
  })
  @ApiParam({ name: 'id', description: '资产实例 ID', example: 'uuid-of-inventory' })
  @SwaggerApiResponse(OutputAssetInventoryDto, {
    description: '更新成功，返回更新后的资产实例信息',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssetInventoryDto,
    @CurrentUser() user: OutputUserDto,
  ): PromiseApiResponse<OutputAssetInventoryDto> {
    const inventory = await this.inventoryService.update(id, dto, user.id);
    return { data: this.inventoryService.transformToOutput(inventory), message: '更新实例成功' };
  }

  /**
   * 删除资产实例
   */
  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '删除资产实例',
    description: '删除资产实例（软删除），如果存在进行中的租赁则无法删除',
  })
  @ApiParam({ name: 'id', description: '资产实例 ID', example: 'uuid-of-inventory' })
  @SwaggerApiResponse(Boolean, { description: '删除成功' })
  async delete(@Param('id') id: string, @CurrentUser() user: OutputUserDto): PromiseApiResponse<boolean> {
    await this.inventoryService.delete(id, user.id);
    return { data: true, message: '删除实例成功' };
  }

  /**
   * 强制解绑
   */
  @Put(':id/force-unbind')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '强制解绑资产实例',
    description: '强制解绑资产实例，如果存在进行中的租赁则无法解绑',
  })
  @ApiParam({ name: 'id', description: '资产实例 ID', example: 'uuid-of-inventory' })
  @SwaggerApiResponse(Boolean, { description: '解绑成功' })
  async forceUnbind(@Param('id') id: string, @CurrentUser() user: OutputUserDto): PromiseApiResponse<boolean> {
    await this.inventoryService.forceUnbind(id, user.id);
    return { data: true, message: '解绑成功' };
  }
}
