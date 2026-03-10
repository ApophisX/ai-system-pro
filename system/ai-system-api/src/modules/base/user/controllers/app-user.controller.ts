import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserAccessTokenClaims } from '../../auth/dto/output-auth.dto';
import { UserService } from '../services/user.service';
import { OutputUserDto } from '../dto/output-user.dto';
import { UpdateUserProfileInfoDto } from '../dto/update-user.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';

/**
 * 用户控制器（App端）
 *
 * 处理用户信息查询、资料编辑等接口
 */
@ApiTags('AppUser')
@Controller('app-user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppUserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 获取当前用户信息
   */
  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  @SwaggerApiResponse(OutputUserDto, { description: '用户信息' })
  async getCurrentUser(@CurrentUser() user: UserAccessTokenClaims): PromiseApiResponse<OutputUserDto> {
    const result = await this.userService.getCurrentUser(user.id);
    return {
      data: result,
    };
  }

  /**
   * 更新用户资料
   */
  @Put('profile')
  @ApiOperation({ summary: '更新用户资料' })
  @SwaggerApiResponse(OutputUserDto, { description: '更新成功' })
  async updateProfile(
    @CurrentUser() user: UserAccessTokenClaims,
    @Body() dto: UpdateUserProfileInfoDto,
  ): PromiseApiResponse<OutputUserDto> {
    const result = await this.userService.updateProfile(user.id, dto);
    return {
      data: result,
      message: '更新成功',
    };
  }
}
