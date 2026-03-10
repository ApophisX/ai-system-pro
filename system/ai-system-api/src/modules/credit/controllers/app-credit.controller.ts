import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser } from '@/modules/base/auth/decorators';
import { SwaggerApiResponse } from '@/common/decorators';
import { OutputUserDto } from '@/modules/base/user/dto';
import { CreditQueryService } from '../services/credit-query.service';
import { OutputCreditAccountDto } from '../dto/output-credit.dto';
import { OutputCreditRecordDto } from '../dto/output-credit-record.dto';
import { QueryCreditRecordDto } from '../dto/query-credit-record.dto';
import { CreditActorRole } from '../enums';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';

/**
 * 信用模块 App 端控制器
 *
 * 查询信用账户、信用记录
 */
@ApiTags('AppCredit')
@Controller('app/credit')
@UseGuards(JwtAuthGuard)
export class AppCreditController {
  constructor(private readonly creditQueryService: CreditQueryService) {}

  /**
   * 获取我的信用账户
   */
  @Get('account')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取信用账户', description: '获取当前用户的信用分、等级、免押/分期权益' })
  @ApiQuery({
    name: 'actorRole',
    required: false,
    enum: CreditActorRole,
    description: '角色：lessee 承租方 / lessor 出租方',
  })
  @SwaggerApiResponse(OutputCreditAccountDto, { description: '信用账户' })
  async getAccount(
    @CurrentUser() user: OutputUserDto,
    @Query('actorRole') actorRole?: CreditActorRole,
  ): PromiseApiResponse<OutputCreditAccountDto> {
    const account = await this.creditQueryService.getAccount(user.id, actorRole ?? CreditActorRole.LESSEE);
    return { data: account };
  }

  /**
   * 获取我的信用记录（事件流水）
   */
  @Get('records')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取信用记录', description: '分页查询当前用户的信用事件流水' })
  @SwaggerApiResponse([OutputCreditRecordDto], { description: '信用记录列表' })
  async getRecords(
    @CurrentUser() user: OutputUserDto,
    @Query() dto: QueryCreditRecordDto,
  ): PromiseApiResponse<OutputCreditRecordDto[]> {
    const result = await this.creditQueryService.getRecords(user.id, dto);
    return result;
  }
}
