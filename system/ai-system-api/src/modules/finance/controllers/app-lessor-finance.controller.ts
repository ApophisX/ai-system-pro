import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser } from '@/modules/base/auth/decorators';
import { OutputUserDto } from '@/modules/base/user/dto';
import { FinanceService } from '../services/finance.service';
import { OutputFinanceDto, QueryFinanceDto } from '../dto/index';
import { SwaggerApiResponse } from '@/common/decorators';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';

@ApiTags('AppLessorFinance')
@UseGuards(JwtAuthGuard)
@Controller('app/finance/lessor')
export class AppLessorFinanceController {
  constructor(private readonly financeService: FinanceService) {}

  /**
   * 出租方收支明细（分页）
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '查询出租方收支明细',
    description:
      '查询出租方收支明细，支持分页与按方向/状态/业务类型/时间范围筛选。时间筛选按业务发生时间（businessOccurredAt）过滤。',
  })
  @SwaggerApiResponse([OutputFinanceDto], { description: '出租方收支明细' })
  findPageList(
    @Query() dto: QueryFinanceDto,
    @CurrentUser() user: OutputUserDto,
  ): PromiseApiResponse<OutputFinanceDto[]> {
    return this.financeService.findPageList(user.id, dto);
  }
}
