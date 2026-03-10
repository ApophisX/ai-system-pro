import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AssetCategoryService } from '../services';
import { AppQueryAssetCategoryDto, AppOutputAssetCategoryDto, AppOutputAssetCategoryTreeDto } from '../dto';
import { type PromiseApiResponse, createSwaggerApiResponse } from '@/common/dtos/base-response.dto';
import { NoAuth } from '@/common/decorators/no-auth.decorator';
import { plainToInstance } from 'class-transformer';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';

/**
 * App 端资产分类控制器
 *
 * 提供用户界面展示资产分类的接口
 * 所有接口无需登录即可访问
 */
@ApiTags('AppAssetCategory')
@Controller('app/asset-categories')
@NoAuth()
export class AppAssetCategoryController {
  constructor(private readonly categoryService: AssetCategoryService) {}

  @Get()
  @ApiOperation({
    summary: '获取资产分类列表',
    description: '获取资产分类列表，支持获取根分类或指定父分类下的子分类',
  })
  @SwaggerApiResponse([AppOutputAssetCategoryDto], {
    description: '分类列表',
  })
  async getCategories(@Query() dto: AppQueryAssetCategoryDto): PromiseApiResponse<AppOutputAssetCategoryDto[]> {
    const categories = await this.categoryService.getAppCategories(dto);
    return {
      data: plainToInstance(AppOutputAssetCategoryDto, categories, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      }),
    };
  }

  @Get('tree')
  @ApiOperation({
    summary: '获取完整分类树',
    description: '获取完整的资产分类树形结构，用于分类导航展示',
  })
  @ApiResponse({
    status: 200,
    description: '分类树',
    type: createSwaggerApiResponse([AppOutputAssetCategoryTreeDto]),
  })
  async getCategoryTree(): PromiseApiResponse<AppOutputAssetCategoryTreeDto[]> {
    const trees = await this.categoryService.getAppCategoryTree();
    return {
      data: plainToInstance(AppOutputAssetCategoryTreeDto, trees),
    };
  }

  @Get('code/:code')
  @ApiOperation({
    summary: '根据分类代码获取分类',
    description: '通过分类代码获取分类详情信息',
  })
  @ApiParam({
    name: 'code',
    description: '分类代码',
    example: 'ELECTRONICS',
  })
  @ApiResponse({
    status: 200,
    description: '分类详情',
    type: createSwaggerApiResponse(AppOutputAssetCategoryDto),
  })
  async getCategoryByCode(@Param('code') code: string): PromiseApiResponse<AppOutputAssetCategoryDto> {
    const category = await this.categoryService.getAppCategoryByCode(code);
    return {
      data: plainToInstance(AppOutputAssetCategoryDto, category),
    };
  }

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
    name: 'includeChildren',
    required: false,
    description: '是否包含子分类的子分类',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: '子分类列表',
    type: createSwaggerApiResponse([AppOutputAssetCategoryDto]),
  })
  async getChildCategories(
    @Param('id') parentId: string,
    @Query('includeChildren') includeChildren?: boolean,
  ): PromiseApiResponse<AppOutputAssetCategoryDto[]> {
    const categories = await this.categoryService.getAppCategories({
      parentId,
      includeChildren: includeChildren === true,
    });
    return {
      data: plainToInstance(AppOutputAssetCategoryDto, categories),
    };
  }

  /**
   * 转换为树形输出 DTO
   */
  private transformToTreeOutput(category: any): AppOutputAssetCategoryTreeDto {
    const output = plainToInstance(AppOutputAssetCategoryTreeDto, category);
    output.children = output.children?.map((c: any) => this.transformToTreeOutput(c));
    return output;
  }
}
