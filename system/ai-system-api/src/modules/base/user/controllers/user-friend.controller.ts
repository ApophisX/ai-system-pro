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
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser } from '@/modules/base/auth/decorators/current-user.decorator';
import { UserAccessTokenClaims } from '@/modules/base/auth/dto/output-auth.dto';
import { UserFriendService } from '../services/user-friend.service';
import { CreateUserFriendDto, UpdateUserFriendDto, QueryUserFriendDto, OutputUserFriendDto } from '../dto';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';

/**
 * 用户好友控制器
 *
 * 提供好友关系的创建、管理、查询等接口
 */
@ApiTags('UserFriend')
@Controller('app/user/friends')
@UseGuards(JwtAuthGuard)
export class UserFriendController {
  constructor(private readonly service: UserFriendService) {}

  /**
   * 发送好友请求
   */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '发送好友请求',
    description: '向指定用户发送好友请求',
  })
  @SwaggerApiResponse(String, { description: '创建成功，返回关系ID' })
  async sendFriendRequest(
    @Body() dto: CreateUserFriendDto,
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<string> {
    const relation = await this.service.sendFriendRequest(dto, user.id);
    return { data: relation.id };
  }

  /**
   * 获取好友列表
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取好友列表',
    description: '获取当前用户的好友列表，支持分页和筛选',
  })
  @SwaggerApiResponse([OutputUserFriendDto], { description: '好友列表' })
  async getFriendList(
    @Query() dto: QueryUserFriendDto,
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<OutputUserFriendDto[]> {
    return this.service.getFriendList(user.id, dto);
  }

  /**
   * 获取待处理的好友请求列表
   */
  @Get('requests/pending')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取待处理的好友请求列表',
    description: '获取发送给当前用户的待处理好友请求',
  })
  @SwaggerApiResponse([OutputUserFriendDto], {
    description: '待处理的好友请求列表',
  })
  async getPendingRequests(
    @Query() dto: QueryUserFriendDto,
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<OutputUserFriendDto[]> {
    return this.service.getPendingRequests(user.id, dto);
  }

  /**
   * 获取好友关系详情
   */
  @Get(':friendId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取好友关系详情',
    description: '获取与指定用户的好友关系详情',
  })
  @ApiParam({
    name: 'friendId',
    description: '好友用户 ID',
    example: 'uuid-of-friend',
  })
  @SwaggerApiResponse(OutputUserFriendDto, { description: '好友关系详情' })
  async getFriendRelation(
    @Param('friendId') friendId: string,
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<OutputUserFriendDto | null> {
    const relation = await this.service.getFriendRelation(friendId, user.id);
    return { data: relation };
  }

  /**
   * 接受好友请求
   */
  @Post(':friendId/accept')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '接受好友请求',
    description: '接受指定用户发送的好友请求',
  })
  @ApiParam({
    name: 'friendId',
    description: '好友用户 ID',
    example: 'uuid-of-friend',
  })
  @SwaggerApiResponse(Boolean, { description: '接受成功' })
  async acceptFriendRequest(
    @Param('friendId') friendId: string,
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<boolean> {
    await this.service.acceptFriendRequest(friendId, user.id);
    return { data: true };
  }

  /**
   * 拒绝好友请求
   */
  @Post(':friendId/reject')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '拒绝好友请求',
    description: '拒绝指定用户发送的好友请求',
  })
  @ApiParam({
    name: 'friendId',
    description: '好友用户 ID',
    example: 'uuid-of-friend',
  })
  @SwaggerApiResponse(Boolean, { description: '拒绝成功' })
  async rejectFriendRequest(
    @Param('friendId') friendId: string,
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<boolean> {
    await this.service.rejectFriendRequest(friendId, user.id);
    return { data: true };
  }

  /**
   * 屏蔽用户
   */
  @Post(':friendId/block')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '屏蔽用户',
    description: '屏蔽指定用户，屏蔽后将无法接收该用户的好友请求',
  })
  @ApiParam({
    name: 'friendId',
    description: '要屏蔽的用户 ID',
    example: 'uuid-of-user',
  })
  @SwaggerApiResponse(Boolean, { description: '屏蔽成功' })
  async blockUser(
    @Param('friendId') friendId: string,
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<boolean> {
    await this.service.blockUser(friendId, user.id);
    return { data: true };
  }

  /**
   * 取消屏蔽
   */
  @Post(':friendId/unblock')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '取消屏蔽',
    description: '取消对指定用户的屏蔽',
  })
  @ApiParam({
    name: 'friendId',
    description: '要取消屏蔽的用户 ID',
    example: 'uuid-of-user',
  })
  @SwaggerApiResponse(Boolean, { description: '取消屏蔽成功' })
  async unblockUser(
    @Param('friendId') friendId: string,
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<boolean> {
    await this.service.unblockUser(friendId, user.id);
    return { data: true };
  }

  /**
   * 删除好友
   */
  @Delete(':friendId')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '删除好友',
    description: '删除与指定用户的好友关系',
  })
  @ApiParam({
    name: 'friendId',
    description: '好友用户 ID',
    example: 'uuid-of-friend',
  })
  @SwaggerApiResponse(Boolean, { description: '删除成功' })
  async deleteFriend(
    @Param('friendId') friendId: string,
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<boolean> {
    await this.service.deleteFriend(friendId, user.id);
    return { data: true };
  }

  /**
   * 更新好友备注
   */
  @Patch(':friendId/remark')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '更新好友备注',
    description: '更新对指定好友的备注名称',
  })
  @ApiParam({
    name: 'friendId',
    description: '好友用户 ID',
    example: 'uuid-of-friend',
  })
  @SwaggerApiResponse(Boolean, { description: '更新成功' })
  async updateRemark(
    @Param('friendId') friendId: string,
    @Body() dto: { remark: string },
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<boolean> {
    await this.service.updateRemark(friendId, dto.remark, user.id);
    return { data: true };
  }
}
