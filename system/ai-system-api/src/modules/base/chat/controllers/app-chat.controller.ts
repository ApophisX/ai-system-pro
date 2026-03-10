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
import { ChatService } from '../services/chat.service';
import {
  CreateChatMessageDto,
  QueryChatConversationDto,
  QueryChatMessageDto,
  OutputChatConversationDto,
  OutputChatMessageDto,
  UpdateChatConversationDto,
} from '../dto';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { OutputUserDto } from '@/modules/base/user/dto';

/**
 * App 端聊天控制器
 *
 * 提供聊天相关接口
 */
@ApiTags('AppChat')
@UseGuards(JwtAuthGuard)
@Controller('app/chat')
export class AppChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * 发送消息
   */
  @Post('messages')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '发送消息',
    description: '发送一条聊天消息，支持文本、图片、视频、语音、文件等类型',
  })
  @SwaggerApiResponse(OutputChatMessageDto, { description: '消息已发送' })
  async sendMessage(
    @CurrentUser() user: OutputUserDto,
    @Body() dto: CreateChatMessageDto,
  ): PromiseApiResponse<OutputChatMessageDto> {
    const message = await this.chatService.createMessage(user.id, dto);
    return { data: message, message: '消息已发送' };
  }

  /**
   * 获取会话列表
   */
  @Get('conversations')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取会话列表',
    description: '获取当前用户的聊天会话列表，支持分页和搜索',
  })
  @SwaggerApiResponse([OutputChatConversationDto], {
    description: '会话列表',
  })
  async getConversations(@CurrentUser() user: OutputUserDto, @Query() dto: QueryChatConversationDto) {
    return this.chatService.getConversations(user.id, dto);
  }

  /**
   * 获取会话详情
   */
  @Get('conversations/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取会话详情',
    description: '获取指定会话的详细信息',
  })
  @ApiParam({
    name: 'id',
    description: '会话 ID',
    example: 'uuid-of-conversation',
  })
  @SwaggerApiResponse(OutputChatConversationDto, { description: '会话详情' })
  async getConversationById(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
  ): PromiseApiResponse<OutputChatConversationDto> {
    const conversation = await this.chatService.getConversationById(user.id, id);
    return { data: conversation };
  }

  /**
   * 获取消息列表
   */
  @Get('messages')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取消息列表',
    description: '获取指定会话的消息列表，支持分页、筛选、搜索',
  })
  @SwaggerApiResponse([OutputChatMessageDto], { description: '消息列表' })
  async getMessages(@CurrentUser() user: OutputUserDto, @Query() dto: QueryChatMessageDto) {
    return this.chatService.getMessages(user.id, dto);
  }

  /**
   * 标记会话为已读
   */
  @Put('conversations/:id/read')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '标记会话为已读',
    description: '将指定会话的所有未读消息标记为已读',
  })
  @ApiParam({
    name: 'id',
    description: '会话 ID',
    example: 'uuid-of-conversation',
  })
  @SwaggerApiResponse(Boolean, { description: '标记成功' })
  async markConversationAsRead(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
  ): PromiseApiResponse<boolean> {
    await this.chatService.markConversationAsRead(user.id, id);
    return { data: true, message: '已标记为已读' };
  }

  /**
   * 更新会话（屏蔽/取消屏蔽）
   */
  @Put('conversations/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '更新会话',
    description: '更新会话设置，如屏蔽/取消屏蔽会话',
  })
  @ApiParam({
    name: 'id',
    description: '会话 ID',
    example: 'uuid-of-conversation',
  })
  @SwaggerApiResponse(OutputChatConversationDto, { description: '更新成功' })
  async updateConversation(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
    @Body() dto: UpdateChatConversationDto,
  ): PromiseApiResponse<OutputChatConversationDto> {
    const conversation = await this.chatService.updateConversation(user.id, id, dto);
    return { data: conversation, message: '更新成功' };
  }

  /**
   * 撤回消息
   */
  @Put('messages/:id/recall')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '撤回消息',
    description: '撤回自己发送的消息（只能撤回2分钟内的消息）',
  })
  @ApiParam({
    name: 'id',
    description: '消息 ID',
    example: 'uuid-of-message',
  })
  @SwaggerApiResponse(OutputChatMessageDto, { description: '撤回成功' })
  async recallMessage(
    @CurrentUser() user: OutputUserDto,
    @Param('id') id: string,
  ): PromiseApiResponse<OutputChatMessageDto> {
    const message = await this.chatService.recallMessage(user.id, id);
    return { data: message, message: '消息已撤回' };
  }

  /**
   * 获取未读消息总数
   */
  @Get('unread/count')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取未读消息总数',
    description: '获取当前用户在所有会话中的未读消息总数',
  })
  @SwaggerApiResponse(Number, { description: '未读消息总数' })
  async getUnreadCount(@CurrentUser() user: OutputUserDto): PromiseApiResponse<number> {
    const count = await this.chatService.getTotalUnreadCount(user.id);
    return { data: count };
  }
}
