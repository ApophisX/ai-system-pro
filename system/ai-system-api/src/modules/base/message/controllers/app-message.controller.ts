import { Controller, Get, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser } from '@/modules/base/auth/decorators/current-user.decorator';
import { MessageService } from '../services';
import {
  QueryMessageDto,
  OutputMessageDto,
  UpdateMessageDto,
  BatchUpdateMessageDto,
  BatchDeleteMessageDto,
  OutputUnreadCountByTypeDto,
} from '../dto';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { OutputUserDto } from '@/modules/base/user/dto';
import { MessageType } from '../enums/message-type.enum';

/**
 * App 端消息控制器
 *
 * 提供消息相关接口
 */
@ApiTags('AppMessage')
@UseGuards(JwtAuthGuard)
@Controller('app/message')
export class AppMessageController {
  constructor(private readonly messageService: MessageService) {}

  /**
   * 获取消息列表
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取消息列表',
    description: '获取当前用户的消息列表，支持分页、筛选、搜索',
  })
  @SwaggerApiResponse([OutputMessageDto], {
    description: '消息列表',
  })
  async getList(@Query() dto: QueryMessageDto, @CurrentUser() user: OutputUserDto) {
    return this.messageService.getList(user.id, dto);
  }

  /**
   * 获取消息详情
   */
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取消息详情',
    description: '获取指定消息的详细信息，查看时自动标记为已读',
  })
  @ApiParam({
    name: 'id',
    description: '消息 ID',
    example: 'uuid-of-message',
  })
  @SwaggerApiResponse(OutputMessageDto, { description: '消息详情' })
  async getById(@Param('id') id: string, @CurrentUser() user: OutputUserDto): PromiseApiResponse<OutputMessageDto> {
    const message = await this.messageService.getById(user.id, id);
    return { data: message };
  }

  /**
   * 更新消息（标记已读/未读等）
   */
  @Put(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '更新消息',
    description: '更新消息状态，如标记为已读',
  })
  @ApiParam({
    name: 'id',
    description: '消息 ID',
    example: 'uuid-of-message',
  })
  @SwaggerApiResponse(OutputMessageDto, { description: '更新成功' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMessageDto,
    @CurrentUser() user: OutputUserDto,
  ): PromiseApiResponse<OutputMessageDto> {
    const message = await this.messageService.update(user.id, id, dto);
    return { data: message, message: '更新成功' };
  }

  /**
   * 批量更新消息
   */
  @Put('batch')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '批量更新消息',
    description: '批量更新消息状态，如批量标记为已读',
  })
  @SwaggerApiResponse(Boolean, { description: '批量更新成功' })
  async batchUpdate(
    @Body() dto: BatchUpdateMessageDto,
    @CurrentUser() user: OutputUserDto,
  ): PromiseApiResponse<boolean> {
    await this.messageService.batchUpdate(user.id, dto);
    return { data: true, message: '批量更新成功' };
  }

  /**
   * 标记所有消息为已读
   */
  @Put('read-all')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '标记所有消息为已读',
    description: '将当前用户的所有未读消息标记为已读，可指定消息类型',
  })
  @SwaggerApiResponse(Boolean, { description: '标记成功' })
  async markAllAsRead(
    @CurrentUser() user: OutputUserDto,
    @Query('type') type?: MessageType,
  ): PromiseApiResponse<boolean> {
    await this.messageService.markAllAsRead(user.id, type);
    return { data: true, message: '已标记所有消息为已读' };
  }

  /**
   * 删除消息
   */
  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '删除消息',
    description: '删除指定的消息（软删除）',
  })
  @ApiParam({
    name: 'id',
    description: '消息 ID',
    example: 'uuid-of-message',
  })
  @SwaggerApiResponse(Boolean, { description: '删除成功' })
  async delete(@Param('id') id: string, @CurrentUser() user: OutputUserDto): PromiseApiResponse<boolean> {
    await this.messageService.delete(user.id, id);
    return { data: true, message: '删除成功' };
  }

  /**
   * 批量删除消息
   */
  @Delete('batch')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '批量删除消息',
    description: '批量删除指定的消息（软删除）',
  })
  @SwaggerApiResponse(Boolean, { description: '批量删除成功' })
  async batchDelete(
    @Body() dto: BatchDeleteMessageDto,
    @CurrentUser() user: OutputUserDto,
  ): PromiseApiResponse<boolean> {
    await this.messageService.batchDelete(user.id, dto.messageIds);
    return { data: true, message: '批量删除成功' };
  }

  /**
   * 获取未读消息数量
   */
  @Get('unread/count')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取未读消息数量',
    description: '获取当前用户的未读消息数量，可指定消息类型',
  })
  @SwaggerApiResponse(Number, { description: '未读消息数量' })
  async getUnreadCount(
    @CurrentUser() user: OutputUserDto,
    @Query('type') type?: MessageType,
  ): PromiseApiResponse<number> {
    const count = await this.messageService.getUnreadCount(user.id, type);
    return { data: count };
  }

  /**
   * 获取各类型未读消息数量统计
   */
  @Get('unread/count-by-type')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取各类型未读消息数量统计',
    description: '获取当前用户各类型消息的未读数量统计',
  })
  @SwaggerApiResponse(OutputUnreadCountByTypeDto, {
    description: '各类型未读消息数量',
  })
  async getUnreadCountByType(@CurrentUser() user: OutputUserDto): PromiseApiResponse<OutputUnreadCountByTypeDto> {
    const counts = await this.messageService.getUnreadCountByType(user.id);
    return { data: counts };
  }
}
