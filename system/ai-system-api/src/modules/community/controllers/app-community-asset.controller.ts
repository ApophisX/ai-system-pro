import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser } from '@/modules/base/auth/decorators';
import { UserAccessTokenClaims } from '@/modules/base/auth/dto/output-auth.dto';
import { CommunityAssetService } from '../services';
import { BindAssetDto, QueryCommunityAssetDto } from '../dto';
import { OutputAssetListItemDto } from '@/modules/asset/dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';

/**
 * App 端社区资产控制器
 */
@ApiTags('AppCommunityAsset')
@Controller('app/communities')
@UseGuards(JwtAuthGuard)
export class AppCommunityAssetController {
  constructor(private readonly assetService: CommunityAssetService) {}

  @Get(':id/assets')
  @ApiBearerAuth()
  @ApiOperation({ summary: '社区内资产列表（需已加入）' })
  @ApiParam({ name: 'id', description: '社区 ID' })
  @SwaggerApiResponse([OutputAssetListItemDto])
  async getCommunityAssets(
    @Param('id') id: string,
    @Query() dto: QueryCommunityAssetDto,
    @CurrentUser() user: UserAccessTokenClaims,
  ) {
    return this.assetService.getCommunityAssets(id, user.id, dto);
  }

  @Post(':id/assets')
  @ApiBearerAuth()
  @ApiOperation({ summary: '绑定资产到社区' })
  @ApiParam({ name: 'id', description: '社区 ID' })
  async bindAsset(@Param('id') id: string, @Body() dto: BindAssetDto, @CurrentUser() user: UserAccessTokenClaims) {
    await this.assetService.bindAsset(id, user.id, dto);
    return { message: '绑定成功' };
  }

  @Delete(':id/assets/:assetId')
  @ApiBearerAuth()
  @ApiOperation({ summary: '解绑资产' })
  @ApiParam({ name: 'id', description: '社区 ID' })
  @ApiParam({ name: 'assetId', description: '资产 ID' })
  async unbindAsset(
    @Param('id') id: string,
    @Param('assetId') assetId: string,
    @CurrentUser() user: UserAccessTokenClaims,
  ) {
    await this.assetService.unbindAsset(id, assetId, user.id);
    return { message: '解绑成功' };
  }
}
