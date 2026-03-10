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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { RolesGuard } from '@/modules/base/acl/guards';
import { Roles } from '@/modules/base/acl/decorators';
import { SystemRoleCode } from '@/modules/base/acl/enums';
import { AssetCategoryService } from '../services';
import {
  CreateAssetCategoryDto,
  UpdateAssetCategoryDto,
  QueryAssetCategoryDto,
  OutputAssetCategoryDto,
  OutputAssetCategoryDetailDto,
  OutputAssetCategoryTreeDto,
} from '../dto';
import { createSwaggerApiResponse } from '@/common/dtos/base-response.dto';

/**
 * Admin 端资产分类控制器
 *
 * 提供后台管理资产分类的 CRUD 接口
 * 需要管理员权限
 */
@ApiTags('AdminAssetCategory')
@ApiBearerAuth()
@Controller('admin/asset-category')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SystemRoleCode.SUPER_ADMIN, SystemRoleCode.PLATFORM_ADMIN)
export class AdminAssetCategoryController {
  constructor(private readonly categoryService: AssetCategoryService) {}

  /**
   * 创建资产分类
   */
  @Post()
  @ApiOperation({
    summary: '创建资产分类',
    description: '创建新的资产分类，支持设置父分类形成树形结构',
  })
  @ApiResponse({
    status: 201,
    description: '创建成功',
    type: createSwaggerApiResponse(OutputAssetCategoryDetailDto),
  })
  async create(@Body() dto: CreateAssetCategoryDto): Promise<OutputAssetCategoryDto> {
    const category = await this.categoryService.create(dto);
    return this.transformToOutput(category);
  }

  /**
   * 分页查询资产分类列表
   */
  @Get()
  @ApiOperation({
    summary: '分页查询资产分类',
    description: '分页获取资产分类列表，支持关键字搜索和状态过滤',
  })
  @ApiResponse({
    status: 200,
    description: '分类列表',
    type: createSwaggerApiResponse([OutputAssetCategoryDto]),
  })
  async getList(@Query() dto: QueryAssetCategoryDto) {
    const result = await this.categoryService.getList(dto);
    return {
      data: result.data.map(c => this.transformToOutput(c)),
      meta: result.meta,
    };
  }

  /**
   * 获取完整分类树
   */
  @Get('tree')
  @ApiOperation({
    summary: '获取完整分类树',
    description: '获取完整的资产分类树形结构',
  })
  @ApiQuery({
    name: 'isActiveOnly',
    required: false,
    description: '是否只获取有效的分类',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: '分类树',
    type: createSwaggerApiResponse([OutputAssetCategoryTreeDto]),
  })
  async getTree(@Query('isActiveOnly') isActiveOnly?: boolean): Promise<OutputAssetCategoryTreeDto[]> {
    const trees = await this.categoryService.getTree(isActiveOnly === true);
    return trees.map(t => this.transformToTreeOutput(t));
  }

  /**
   * 获取根分类列表
   */
  @Get('roots')
  @ApiOperation({
    summary: '获取根分类列表',
    description: '获取所有根级别的资产分类',
  })
  @ApiQuery({
    name: 'isActiveOnly',
    required: false,
    description: '是否只获取有效的分类',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: '根分类列表',
    type: createSwaggerApiResponse([OutputAssetCategoryDto]),
  })
  async getRoots(@Query('isActiveOnly') isActiveOnly?: boolean): Promise<OutputAssetCategoryDto[]> {
    const roots = await this.categoryService.getRoots(isActiveOnly === true);
    return roots.map(c => this.transformToOutput(c));
  }

  /**
   * 获取分类详情
   */
  @Get(':id')
  @ApiOperation({
    summary: '获取分类详情',
    description: '根据 ID 获取分类详情，包含父分类和子分类信息',
  })
  @ApiParam({ name: 'id', description: '分类 ID', example: 'uuid-of-category' })
  @ApiResponse({
    status: 200,
    description: '分类详情',
    type: createSwaggerApiResponse(OutputAssetCategoryDetailDto),
  })
  async getById(@Param('id') id: string): Promise<OutputAssetCategoryDetailDto> {
    const category = await this.categoryService.getById(id);
    return this.transformToDetailOutput(category);
  }

  /**
   * 获取子分类列表
   */
  @Get(':id/children')
  @ApiOperation({
    summary: '获取子分类列表',
    description: '获取指定分类下的直接子分类',
  })
  @ApiParam({
    name: 'id',
    description: '父分类 ID',
    example: 'uuid-of-parent-category',
  })
  @ApiQuery({
    name: 'isActiveOnly',
    required: false,
    description: '是否只获取有效的分类',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: '子分类列表',
    type: createSwaggerApiResponse([OutputAssetCategoryDto]),
  })
  async getChildren(
    @Param('id') parentId: string,
    @Query('isActiveOnly') isActiveOnly?: boolean,
  ): Promise<OutputAssetCategoryDto[]> {
    const children = await this.categoryService.getChildren(parentId, isActiveOnly === true);
    return children.map(c => this.transformToOutput(c));
  }

  /**
   * 更新资产分类
   */
  @Put(':id')
  @ApiOperation({
    summary: '更新资产分类',
    description: '更新资产分类信息，支持修改父分类',
  })
  @ApiParam({
    name: 'id',
    description: '分类 ID',
    example: 'uuid-of-category',
  })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: createSwaggerApiResponse(OutputAssetCategoryDetailDto),
  })
  async update(@Param('id') id: string, @Body() dto: UpdateAssetCategoryDto): Promise<OutputAssetCategoryDto> {
    const category = await this.categoryService.update(id, dto);
    return this.transformToOutput(category);
  }

  /**
   * 删除资产分类
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '删除资产分类',
    description: '软删除资产分类，有子分类或关联资产时无法删除',
  })
  @ApiParam({
    name: 'id',
    description: '分类 ID',
    example: 'uuid-of-category',
  })
  @ApiResponse({ status: 204, description: '删除成功' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.categoryService.delete(id);
  }

  /**
   * 批量更新排序
   */
  @Put('batch/sort-order')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '批量更新排序',
    description: '批量更新分类的排序权重',
  })
  @ApiResponse({ status: 204, description: '更新成功' })
  async updateSortOrder(@Body() items: Array<{ id: string; sortOrder: number }>): Promise<void> {
    await this.categoryService.updateSortOrder(items);
  }

  // ========== 转换方法 ==========

  /**
   * 转换为输出 DTO
   */
  private transformToOutput(category: any): OutputAssetCategoryDto {
    return {
      id: category.id,
      code: category.code,
      name: category.name,
      description: category.description,
      icon: category.icon,
      sortOrder: category.sortOrder,
      attributes: category.attributes,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * 转换为详情输出 DTO
   */
  private transformToDetailOutput(category: any): OutputAssetCategoryDetailDto {
    return {
      id: category.id,
      code: category.code,
      name: category.name,
      description: category.description,
      icon: category.icon,
      sortOrder: category.sortOrder,
      attributes: category.attributes,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      createdBy: category.createdBy,
      updatedBy: category.updatedBy,
      remark: category.remark,
      parent: category.parent ? this.transformToOutput(category.parent) : undefined,
      children: category.children?.map((c: any) => this.transformToOutput(c)),
    };
  }

  /**
   * 转换为树形输出 DTO
   */
  private transformToTreeOutput(category: any): OutputAssetCategoryTreeDto {
    return {
      id: category.id,
      code: category.code,
      name: category.name,
      description: category.description,
      icon: category.icon,
      sortOrder: category.sortOrder,
      attributes: category.attributes,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      children: category.children?.map((c: any) => this.transformToTreeOutput(c)),
    };
  }
}
