import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { Roles } from '@/modules/base/acl/decorators/roles.decorator';
import { RolesGuard } from '@/modules/base/acl/guards';
import { SystemRoleCode } from '@/modules/base/acl/enums';
import { MerchantInviteStatService } from '../services';
import { OutputInviteRankItemDto } from '../dto/output-merchant-invite.dto';
import { QueryInviteRankDto } from '../dto/query-merchant-invite.dto';

/**
 * 商户邀请 - Admin 端（管理后台）
 *
 * 统计、排行榜、风控（预留）
 */
@ApiTags('AdminMerchantInvite')
@Controller('admin/merchant-invite')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SystemRoleCode.PLATFORM_ADMIN, SystemRoleCode.PLATFORM_OPERATOR, SystemRoleCode.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminMerchantInviteController {
  constructor(private readonly statService: MerchantInviteStatService) {}

  @Get('rank')
  @ApiOperation({ summary: '拓展排行榜（管理端）' })
  async getRank(@Query() dto: QueryInviteRankDto): Promise<OutputInviteRankItemDto[]> {
    return this.statService.getRankList({
      period: dto.period ?? 'monthly',
      year: dto.year,
      month: dto.month,
      limit: dto.limit,
    });
  }
}
