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
import { CurrentUser } from '@/modules/base/auth/decorators/current-user.decorator';
import { NoAuth } from '@/common/decorators/no-auth.decorator';
import { AssetCommentService } from '../services/asset-comment.service';
import { CreateAssetCommentDto, QueryAssetCommentDto, OutputAssetCommentDto, UpdateAssetCommentDto } from '../dto';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { OutputUserDto } from '@/modules/base/user/dto';
import { JwtAuthGuardForPublic } from '@/modules/base/auth/guards/jwt-auth.guard';

/**
 * App 端资产留言控制器
 *
 * 提供资产留言相关接口
 */
@ApiTags('AppAssetComment')
@Controller('app/asset-comment')
export class AppAssetCommentController {
  constructor(private readonly commentService: AssetCommentService) {}

  /**
   * 创建留言
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '创建留言',
    description: '对资产进行留言，支持回复其他用户的留言',
  })
  @SwaggerApiResponse(OutputAssetCommentDto, { description: '留言创建成功' })
  async create(
    @Body() dto: CreateAssetCommentDto,
    @CurrentUser() user: OutputUserDto,
  ): PromiseApiResponse<OutputAssetCommentDto> {
    const comment = await this.commentService.create(user.id, dto);
    return { data: comment, message: '留言创建成功' };
  }

  /**
   * 获取留言列表（公开接口）
   */
  @Get()
  @NoAuth()
  @UseGuards(JwtAuthGuardForPublic)
  @ApiOperation({
    summary: '获取留言列表',
    description: '获取资产留言列表，支持分页、筛选。可查询顶级留言或指定留言的回复',
  })
  @SwaggerApiResponse([OutputAssetCommentDto], { description: '留言列表' })
  async getList(@Query() dto: QueryAssetCommentDto, @CurrentUser() user?: OutputUserDto) {
    return this.commentService.getList(dto);
  }

  /**
   * 获取留言详情（公开接口）
   */
  @Get(':id')
  @UseGuards(JwtAuthGuardForPublic)
  @ApiOperation({
    summary: '获取留言详情',
    description: '获取指定留言的详细信息',
  })
  @ApiParam({
    name: 'id',
    description: '留言 ID',
    example: 'uuid-of-comment',
  })
  @SwaggerApiResponse(OutputAssetCommentDto, { description: '留言详情' })
  async getById(@Param('id') id: string): PromiseApiResponse<OutputAssetCommentDto> {
    const comment = await this.commentService.getById(id);
    return { data: comment };
  }

  /**
   * 更新留言
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '更新留言',
    description: '更新自己的留言内容',
  })
  @ApiParam({
    name: 'id',
    description: '留言 ID',
    example: 'uuid-of-comment',
  })
  @SwaggerApiResponse(OutputAssetCommentDto, { description: '更新成功' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssetCommentDto,
    @CurrentUser() user: OutputUserDto,
  ): PromiseApiResponse<OutputAssetCommentDto> {
    const comment = await this.commentService.update(user.id, id, dto);
    return { data: comment, message: '更新成功' };
  }

  /**
   * 删除留言
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '删除留言',
    description: '删除留言（软删除）。用户只能删除自己的留言，资产所有者可以删除自己资产下的所有留言',
  })
  @ApiParam({
    name: 'id',
    description: '留言 ID',
    example: 'uuid-of-comment',
  })
  @SwaggerApiResponse(Boolean, { description: '删除成功' })
  async delete(@Param('id') id: string, @CurrentUser() user: OutputUserDto): PromiseApiResponse<boolean> {
    await this.commentService.delete(user.id, id);
    return { data: true, message: '删除成功' };
  }

  /**
   * 获取资产的留言数量（公开接口）
   */
  @Get('asset/:assetId/count')
  @NoAuth()
  @ApiOperation({
    summary: '获取资产的留言数量',
    description: '获取指定资产的留言总数',
  })
  @ApiParam({
    name: 'assetId',
    description: '资产 ID',
    example: 'uuid-of-asset',
  })
  @SwaggerApiResponse(Number, { description: '留言数量' })
  async getCommentCountByAssetId(@Param('assetId') assetId: string): PromiseApiResponse<number> {
    const count = await this.commentService.getCommentCountByAssetId(assetId);
    return { data: count };
  }
}
