import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthTokenOutput, OutputAuthDto } from '../dto/output-auth.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserEntity } from '../../user/entities/user.entity';
import { CurrentUser } from '../decorators/current-user.decorator';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { Cookies } from '@/common/decorators/cookie.decorator';
import { CAPTCHA_COOKIE_NAME } from '../../captcha/captcha.constant';
import { ReqContext } from '@/common/decorators/req-context.decorator';
import { RequestContext } from '@/common/dtos/request-context.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { OutputUserDetailDto, RealNameAuthDto, EnterpriseVerificationDto, ResetPasswordDto } from '../../user/dto';
import { UserService } from '../../user/services';

/**
 * 认证控制器
 *
 * 处理登录、注册、刷新令牌等认证相关接口
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    //
  }

  /**
   * 用户注册
   */
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功', type: OutputAuthDto })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '用户已存在' })
  @SwaggerApiResponse(OutputAuthDto, { description: '注册成功' })
  async signUp(@Body() dto: RegisterDto): PromiseApiResponse<OutputAuthDto> {
    const result = await this.authService.signUp(dto);
    return {
      data: result,
    };
  }

  /**
   * 用户登录
   */
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @SwaggerApiResponse(OutputAuthDto, { description: '登录成功' })
  async signIn(
    @Body() dto: LoginDto,
    @ReqContext() reqContext: RequestContext,
    @Cookies(CAPTCHA_COOKIE_NAME) captchaId: string,
  ): PromiseApiResponse<OutputAuthDto> {
    const result = await this.authService.signIn(reqContext, dto, captchaId);
    return {
      data: result,
    };
  }

  /**
   * 刷新令牌
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新访问令牌' })
  @SwaggerApiResponse(AuthTokenOutput, { description: '刷新成功' })
  @ApiResponse({ status: 401, description: '刷新令牌无效或已过期' })
  async refresh(@Body() dto: RefreshTokenDto): PromiseApiResponse<AuthTokenOutput> {
    const result = await this.authService.refreshToken(dto.refreshToken);
    return {
      data: result,
    };
  }

  /**
   * 获取当前用户信息
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 401, description: '未授权' })
  @SwaggerApiResponse(OutputUserDetailDto)
  async getCurrentUser(@CurrentUser() user): PromiseApiResponse<OutputUserDetailDto> {
    const profile = await this.userService.getCurrentUserProfile(user.id);
    return {
      data: { ...user, profile, avatar: profile.avatar },
    };
  }

  /**
   * 用户登出
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户登出' })
  @ApiResponse({ status: 200, description: '登出成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async logout(@CurrentUser() user: UserEntity): Promise<{ message: string }> {
    await this.authService.logout(user.id);
    return { message: '登出成功' };
  }

  /**
   * 短信验证码重置密码
   */
  @Patch('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '短信验证码重置密码' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: '重置密码成功' })
  @ApiResponse({ status: 400, description: '参数错误或两次密码不一致' })
  @ApiResponse({ status: 401, description: '短信验证码错误或已过期' })
  @ApiResponse({ status: 404, description: '该手机号未注册' })
  @SwaggerApiResponse(Boolean, { description: '重置密码成功' })
  async resetPassword(@Body() dto: ResetPasswordDto): PromiseApiResponse {
    await this.authService.resetPassword(dto);
    return { message: '重置密码成功' };
  }

  /**
   * 实名认证（个人）
   */
  @Post('real-name-auth')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '实名认证' })
  @ApiBody({ type: RealNameAuthDto })
  @ApiResponse({ status: 200, description: '实名认证成功' })
  @ApiResponse({ status: 400, description: '参数错误或已认证' })
  async realNameAuth(@CurrentUser() user: UserEntity, @Body() dto: RealNameAuthDto): PromiseApiResponse {
    await this.userService.realNameAuth(user.id, dto);
    return { message: '实名认证成功' };
  }

  /**
   * 企业认证（商户入驻）
   *
   * 提交企业资料，进入待审核状态（enterpriseVerificationStatus=pending）
   * 后台管理员审核通过后，userType=enterprise、enterpriseVerificationStatus=verified
   * 若存在邀请关系，审核通过后将触发 relation 状态更新为 VERIFIED
   */
  @Post('enterprise-auth')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '企业认证（提交后待审核）' })
  @ApiBody({ type: EnterpriseVerificationDto })
  @ApiResponse({ status: 200, description: '企业认证资料已提交，等待审核' })
  @SwaggerApiResponse(Boolean, { description: '企业认证资料已提交，等待审核' })
  async enterpriseAuth(@CurrentUser() user: UserEntity, @Body() dto: EnterpriseVerificationDto): PromiseApiResponse {
    await this.userService.enterpriseVerification(user.id, dto);
    return { message: '企业认证资料已提交，请等待审核' };
  }
}
