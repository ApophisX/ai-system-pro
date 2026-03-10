import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { WithdrawService } from '../services/withdraw.service';
import { ReviewWithdrawDto } from '../dto/review-withdraw.dto';
import { OutputWithdrawOrderDto } from '../dto/output-withdraw.dto';
import { SwaggerApiResponse } from '@/common/decorators';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { Roles } from '@/modules/base/acl/decorators';
import { SystemRoleCode } from '@/modules/base/acl/enums';

/**
 * 后台提现审核 Controller
 *
 * 提供审核通过/拒绝接口
 * 需 JWT 认证，生产环境建议增加管理员权限校验
 */
@ApiTags('AdminWithdraw')
@Controller('admin/withdraw')
@UseGuards(JwtAuthGuard)
@Roles(SystemRoleCode.PLATFORM_ADMIN, SystemRoleCode.PLATFORM_OPERATOR, SystemRoleCode.SUPER_ADMIN)
export class AdminWithdrawController {
  constructor(private readonly withdrawService: WithdrawService) {}

  @Post(':id/review')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '审核提现',
    description: '审核通过或拒绝，通过时扣减 available、增加 frozen，拒绝时无余额变动',
  })
  @SwaggerApiResponse(OutputWithdrawOrderDto, { description: '提现单' })
  async review(@Param('id') id: string, @Body() dto: ReviewWithdrawDto): PromiseApiResponse<OutputWithdrawOrderDto> {
    const result = await this.withdrawService.reviewWithdraw(id, dto);
    return { data: result };
  }
}
