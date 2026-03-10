import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser } from '@/modules/base/auth/decorators/current-user.decorator';
import { FavoriteService } from '../services';
import { CreateFavoriteDto, QueryFavoriteDto, OutputFavoriteDto } from '../dto';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { OutputUserDto } from '@/modules/base/user/dto';

/**
 * App 端收藏控制器
 *
 * 提供收藏相关接口
 */
@ApiTags('AppFavorite')
@UseGuards(JwtAuthGuard)
@Controller('app/favorite')
export class AppFavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  /**
   * 创建收藏
   */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '创建收藏',
    description: '收藏指定的资产',
  })
  @SwaggerApiResponse(OutputFavoriteDto, { description: '收藏成功' })
  async create(
    @Body() dto: CreateFavoriteDto,
    @CurrentUser() user: OutputUserDto,
  ): PromiseApiResponse<OutputFavoriteDto> {
    const favorite = await this.favoriteService.create(user.id, dto);
    return { data: favorite, message: '收藏成功' };
  }

  /**
   * 获取收藏列表
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取收藏列表',
    description: '获取当前用户的收藏列表，支持分页、搜索',
  })
  @SwaggerApiResponse([OutputFavoriteDto], {
    description: '收藏列表',
  })
  async getList(@Query() dto: QueryFavoriteDto, @CurrentUser() user: OutputUserDto) {
    return this.favoriteService.getList(user.id, dto);
  }

  /**
   * 取消收藏
   */
  @Delete(':assetId')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '取消收藏',
    description: '取消收藏指定的资产',
  })
  @ApiParam({
    name: 'assetId',
    description: '资产 ID',
    example: 'uuid-of-asset',
  })
  @SwaggerApiResponse(Boolean, { description: '取消收藏成功' })
  async remove(@Param('assetId') assetId: string, @CurrentUser() user: OutputUserDto): PromiseApiResponse<boolean> {
    await this.favoriteService.remove(user.id, assetId);
    return { data: true, message: '已取消收藏' };
  }

  /**
   * 检查是否已收藏
   */
  @Get('check/:assetId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '检查是否已收藏',
    description: '检查当前用户是否已收藏指定资产',
  })
  @ApiParam({
    name: 'assetId',
    description: '资产 ID',
    example: 'uuid-of-asset',
  })
  @SwaggerApiResponse(Boolean, { description: '是否已收藏' })
  async checkFavorite(
    @Param('assetId') assetId: string,
    @CurrentUser() user: OutputUserDto,
  ): PromiseApiResponse<boolean> {
    const isFavorite = await this.favoriteService.isFavorite(user.id, assetId);
    return { data: isFavorite };
  }

  /**
   * 获取收藏数量
   */
  @Get('count')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取收藏数量',
    description: '获取当前用户的收藏总数',
  })
  @SwaggerApiResponse(Number, { description: '收藏数量' })
  async getCount(@CurrentUser() user: OutputUserDto): PromiseApiResponse<number> {
    const count = await this.favoriteService.getCount(user.id);
    return { data: count };
  }
}
