import { Controller, Get, Put, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser } from '@/modules/base/auth/decorators/current-user.decorator';
import { Roles } from '@/modules/base/acl/decorators';
import { RolesGuard } from '@/modules/base/acl/guards';
import { SystemRoleCode } from '@/modules/base/acl/enums';
import { RentalOrderDeductDepositService } from '../services/rental-order-deduct-deposit.service';
import { QueryDepositDeductionAdminDto, ReviewDepositDeductionDto, OutputDepositDeductionDto } from '../dto';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { OutputUserDto } from '@/modules/base/user/dto';
import { plainToInstance } from 'class-transformer';

/**
 * 后台 - 争议押金扣除审核
 *
 * 管理员查询待审核扣款列表、查看详情、审核通过/拒绝（通过时支持认定金额）
 */
@ApiTags('AdminDepositDeduction')
@Controller('admin/deposit-deductions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SystemRoleCode.PLATFORM_ADMIN, SystemRoleCode.PLATFORM_OPERATOR, SystemRoleCode.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminDepositDeductionController {
  constructor(private readonly deductDepositService: RentalOrderDeductDepositService) {}

  /**
   * 分页查询押金扣款列表（支持按状态、订单、单号筛选）
   */
  @Get()
  @ApiOperation({
    summary: '分页查询押金扣款列表',
    description: '后台分页查询押金扣款记录，可按状态（如待审核）、订单ID、扣款单号、押金单号筛选',
  })
  @SwaggerApiResponse([OutputDepositDeductionDto], {
    description: '扣款列表，data 为列表项，meta 为分页信息',
  })
  async getList(@Query() dto: QueryDepositDeductionAdminDto): PromiseApiResponse<OutputDepositDeductionDto[]> {
    const { data, meta } = await this.deductDepositService.getAdminDeductionList(dto);
    const list = plainToInstance(OutputDepositDeductionDto, data, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
    return { data: list, meta };
  }

  /**
   * 根据 ID 获取扣款详情（含押金信息）
   */
  @Get(':id')
  @ApiOperation({
    summary: '获取扣款详情',
    description: '根据扣款记录 ID 获取详情，含关联押金',
  })
  @ApiParam({ name: 'id', description: '扣款记录 ID' })
  @SwaggerApiResponse(OutputDepositDeductionDto, { description: '扣款详情' })
  async getById(@Param('id') id: string): PromiseApiResponse<OutputDepositDeductionDto> {
    const deduction = await this.deductDepositService.getAdminDeductionById(id);
    const dto = plainToInstance(OutputDepositDeductionDto, deduction, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
    return { data: dto };
  }

  /**
   * 审核争议押金扣除（通过则执行扣款并更新押金/订单/财务，拒绝则仅更新状态）
   */
  @Put(':id/review')
  @ApiOperation({
    summary: '审核争议押金扣除',
    description:
      '对状态为【待审核】的扣款进行审核。通过时可指定认定金额（不传则用原申请金额），认定金额不得超过原申请金额与押金可用余额的较小值；通过后扣款立即执行并更新押金与财务。拒绝则仅更新状态与审核说明。',
  })
  @ApiParam({ name: 'id', description: '扣款记录 ID' })
  @SwaggerApiResponse(OutputDepositDeductionDto, { description: '审核后的扣款记录' })
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewDepositDeductionDto,
    @CurrentUser() user: OutputUserDto,
  ): PromiseApiResponse<OutputDepositDeductionDto> {
    const auditorName =
      (user as OutputUserDto & { profile?: { realName?: string } })?.profile?.realName || user.username || user.id;
    const result = await this.deductDepositService.reviewDepositDeductionByAdmin(id, dto, user.id, auditorName);
    const output = plainToInstance(OutputDepositDeductionDto, result, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
    return { data: output, message: '审核成功' };
  }
}
