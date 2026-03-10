/**
 * OSS 控制器
 *
 * 提供 OSS 临时凭证获取接口
 */

import { Controller, Get, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { OssService } from './oss.service';
import { OutputOssCredentialsDto } from './dto/output-oss-credentials.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { OutputUserDto } from '../user/dto';

/**
 * OSS 控制器
 */
@ApiTags('OSS')
@Controller('oss')
@UseGuards(JwtAuthGuard)
export class OssController {
  constructor(private readonly ossService: OssService) {}

  /**
   * 获取 OSS 临时上传凭证
   *
   * 前端使用返回的凭证和 ali-oss SDK 直接上传文件到 OSS
   */
  @Get('credentials')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取 OSS 临时上传凭证' })
  @ApiQuery({
    name: 'uploadPath',
    required: false,
    description: '上传路径前缀（可选），用于限制上传路径',
    example: 'user/avatar',
  })
  @SwaggerApiResponse(OutputOssCredentialsDto, {
    description: '获取成功，返回临时凭证信息',
  })
  @ApiResponse({ status: 400, description: '请求参数错误或配置不完整' })
  @ApiResponse({ status: 401, description: '未授权，需要登录' })
  async getUploadCredentials(
    @CurrentUser() user: OutputUserDto,
    @Query('uploadPath') uploadPath?: string,
  ): PromiseApiResponse<OutputOssCredentialsDto> {
    const credentials = await this.ossService.getUploadCredentials(user.id, uploadPath);

    return {
      message: '获取上传凭证成功',
      data: credentials,
    };
  }
}
