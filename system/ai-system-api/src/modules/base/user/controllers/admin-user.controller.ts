import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { Roles } from '@/modules/base/acl/decorators/roles.decorator';
import { RolesGuard } from '@/modules/base/acl/guards';
import { SystemRoleCode } from '@/modules/base/acl/enums';
import { UserService } from '../services/user.service';
import { RejectEnterpriseVerificationDto, AdminUpdateUserDto } from '../dto/update-user.dto';
import { QueryEnterpriseApplicationDto, QueryUserDto } from '../dto/query-user.dto';
import {
  OutputEnterpriseApplicationListItemDto,
  OutputAdminUserListItemDto,
  OutputUserDto,
  OutputUserDetailDto,
} from '../dto/output-user.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import type { PromiseApiResponse } from '@/common/dtos/base-response.dto';

/**
 * 用户管理 - Admin 端
 *
 * C 端用户管理：列表、详情、冻结/解冻/封禁、更新
 * 企业认证审核等管理功能
 */
@ApiTags('AdminUser')
@Controller('admin/user')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SystemRoleCode.PLATFORM_ADMIN, SystemRoleCode.PLATFORM_OPERATOR, SystemRoleCode.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  // ==================== C 端用户管理 ====================

  /**
   * 分页获取 C 端用户列表
   * 支持关键字、用户类型、认证状态、账户状态、风险等级、注册时间筛选
   */
  @Get()
  @ApiOperation({ summary: '分页获取 C 端用户列表' })
  @SwaggerApiResponse([OutputAdminUserListItemDto], {
    description: '用户列表，data 为列表项，meta 为分页信息',
  })
  async getAdminUserList(@Query() dto: QueryUserDto): PromiseApiResponse<OutputAdminUserListItemDto[]> {
    return this.userService.getAdminUserList(dto);
  }

  // ==================== 企业认证审核（需在 :userId 之前定义，避免路由冲突） ====================

  /**
   * 分页获取企业用户申请列表（待审核/已通过/已拒绝）
   * 不传 enterpriseVerificationStatus 时默认仅返回待审核（PENDING）申请
   */
  @Get('enterprise-applications')
  @ApiOperation({ summary: '分页获取企业用户申请列表' })
  @SwaggerApiResponse([OutputEnterpriseApplicationListItemDto], {
    description: '企业申请列表，data 为列表项，meta 为分页信息',
  })
  async getEnterpriseApplicationList(
    @Query() dto: QueryEnterpriseApplicationDto,
  ): PromiseApiResponse<OutputEnterpriseApplicationListItemDto[]> {
    const result = await this.userService.getEnterpriseApplicationList(dto);
    return result;
  }

  /**
   * 审核通过企业认证
   */
  @Post(':userId/enterprise-verification/approve')
  @ApiOperation({ summary: '审核通过企业认证' })
  async approveEnterpriseVerification(@Param('userId') userId: string): Promise<{ message: string }> {
    await this.userService.approveEnterpriseVerification(userId);
    return { message: '企业认证已通过' };
  }

  /**
   * 将已通过的企业认证恢复为待审核
   */
  @Post(':userId/enterprise-verification/revert-to-pending')
  @ApiOperation({ summary: '将已通过的企业认证恢复为待审核' })
  async revertEnterpriseVerificationToPending(@Param('userId') userId: string): Promise<{ message: string }> {
    await this.userService.revertEnterpriseVerificationToPending(userId);
    return { message: '企业认证已恢复为待审核' };
  }

  /**
   * 审核拒绝企业认证
   */
  @Post(':userId/enterprise-verification/reject')
  @ApiOperation({ summary: '审核拒绝企业认证' })
  async rejectEnterpriseVerification(
    @Param('userId') userId: string,
    @Body() dto: RejectEnterpriseVerificationDto,
  ): Promise<{ message: string }> {
    await this.userService.rejectEnterpriseVerification(userId, dto.reason);
    return { message: '企业认证已拒绝' };
  }

  // ==================== 用户详情与更新 ====================

  /**
   * 获取用户详情（含完整资料，可查看冻结/封禁用户）
   */
  @Get(':userId')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiParam({ name: 'userId', description: '用户 ID', example: 'uuid' })
  @SwaggerApiResponse(OutputUserDetailDto, { description: '用户详情' })
  async getAdminUserDetail(@Param('userId') userId: string): PromiseApiResponse<OutputUserDetailDto> {
    const data = await this.userService.getAdminUserDetail(userId);
    return { data };
  }

  /**
   * 管理端更新用户信息
   */
  @Put(':userId')
  @ApiOperation({ summary: '管理端更新用户信息' })
  @ApiParam({ name: 'userId', description: '用户 ID', example: 'uuid' })
  @SwaggerApiResponse(OutputUserDto, { description: '更新后的用户信息' })
  async updateAdminUser(
    @Param('userId') userId: string,
    @Body() dto: AdminUpdateUserDto,
  ): PromiseApiResponse<OutputUserDto> {
    const data = await this.userService.updateAdminUser(userId, dto);
    return { data };
  }

  /**
   * 冻结用户
   */
  @Post(':userId/freeze')
  @ApiOperation({ summary: '冻结用户' })
  @ApiParam({ name: 'userId', description: '用户 ID', example: 'uuid' })
  async freezeUser(@Param('userId') userId: string): Promise<{ message: string }> {
    await this.userService.freezeUser(userId);
    return { message: '用户已冻结' };
  }

  /**
   * 解冻用户
   */
  @Post(':userId/unfreeze')
  @ApiOperation({ summary: '解冻用户' })
  @ApiParam({ name: 'userId', description: '用户 ID', example: 'uuid' })
  async unfreezeUser(@Param('userId') userId: string): Promise<{ message: string }> {
    await this.userService.unfreezeUser(userId);
    return { message: '用户已解冻' };
  }

  /**
   * 封禁用户
   */
  @Post(':userId/ban')
  @ApiOperation({ summary: '封禁用户' })
  @ApiParam({ name: 'userId', description: '用户 ID', example: 'uuid' })
  async banUser(@Param('userId') userId: string): Promise<{ message: string }> {
    await this.userService.banUser(userId);
    return { message: '用户已封禁' };
  }

  /**
   * 解封用户
   */
  @Post(':userId/unban')
  @ApiOperation({ summary: '解封用户' })
  @ApiParam({ name: 'userId', description: '用户 ID', example: 'uuid' })
  async unbanUser(@Param('userId') userId: string): Promise<{ message: string }> {
    await this.userService.unbanUser(userId);
    return { message: '用户已解封' };
  }
}
