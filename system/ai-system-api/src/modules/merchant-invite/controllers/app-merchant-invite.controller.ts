import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser } from '@/modules/base/auth/decorators/current-user.decorator';
import { Roles } from '@/modules/base/acl/decorators/roles.decorator';
import { RolesGuard } from '@/modules/base/acl/guards';
import { MerchantInviteRegisterService, MerchantInviteStatService } from '../services';
import {
  OutputMyInviteCodeDto,
  OutputMerchantInviteRelationDto,
  OutputMerchantInviteRewardDto,
  OutputInviteRankItemDto,
} from '../dto/output-merchant-invite.dto';
import { QueryMerchantInviteRewardDto, QueryInviteRankDto } from '../dto/query-merchant-invite.dto';
import { SystemRoleCode } from '@/modules/base/acl/enums';
import { PaginationQueryDto } from '@/common/dtos/base-query.dto';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { SwaggerApiResponse } from '@/common/decorators';

const MERCHANT_INVITER_ROLES = [
  SystemRoleCode.MERCHANT_INVITER,
  SystemRoleCode.BD,
  SystemRoleCode.PLATFORM_ADMIN,
  SystemRoleCode.SUPER_ADMIN,
];

/**
 * 商户邀请 - App 端（员工）
 *
 * 需具备 merchant_inviter 或 bd 角色
 */
@ApiTags('AppMerchantInvite')
@Controller('app/merchant-invite')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...MERCHANT_INVITER_ROLES)
@ApiBearerAuth()
export class AppMerchantInviteController {
  constructor(
    private readonly registerService: MerchantInviteRegisterService,
    private readonly statService: MerchantInviteStatService,
  ) {}

  @Get('my/code')
  @ApiOperation({ summary: '获取我的邀请码与统计' })
  @SwaggerApiResponse(OutputMyInviteCodeDto, { description: '我的邀请码与统计' })
  async getMyInviteCode(@CurrentUser('id') userId: string): PromiseApiResponse<OutputMyInviteCodeDto> {
    const result = await this.statService.getMyInviteCode(userId);
    return { data: result };
  }

  @Get('my/invitations')
  @ApiOperation({ summary: '我的邀请列表' })
  @SwaggerApiResponse([OutputMerchantInviteRelationDto], { description: '我的邀请列表' })
  async getMyInvitations(
    @CurrentUser('id') userId: string,
    @Query() dto: PaginationQueryDto,
  ): PromiseApiResponse<OutputMerchantInviteRelationDto[]> {
    const result = await this.statService.getMyInvitations(userId, dto);
    return result;
  }

  @Get('my/rewards')
  @ApiOperation({ summary: '我的奖励列表' })
  @SwaggerApiResponse([OutputMerchantInviteRewardDto], { description: '我的奖励列表' })
  async getMyRewards(
    @CurrentUser('id') userId: string,
    @Query() dto: QueryMerchantInviteRewardDto,
  ): PromiseApiResponse<OutputMerchantInviteRewardDto[]> {
    const result = await this.statService.getMyRewards(userId, dto);
    return result;
  }

  @Get('rank')
  @ApiOperation({ summary: '拓展排行榜' })
  @SwaggerApiResponse([OutputInviteRankItemDto], { description: '拓展排行榜' })
  async getRank(@Query() dto: QueryInviteRankDto): PromiseApiResponse<OutputInviteRankItemDto[]> {
    const result = await this.statService.getRankList({
      period: dto.period ?? 'monthly',
      year: dto.year,
      month: dto.month,
      limit: dto.limit,
    });
    return { data: result };
  }
}
