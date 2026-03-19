import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { CurrentUser } from '@/modules/base/auth/decorators/current-user.decorator';
import { UserAccessTokenClaims } from '@/modules/base/auth/dto/output-auth.dto';
import { ContactService } from '../services';
import { CreateContactDto, UpdateContactDto, QueryContactDto, OutputContactDto } from '../dto';
import { type PromiseApiResponse } from '@/common/dtos/base-response.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';

/**
 * App 端地址控制器
 *
 * 提供地址的创建、管理、查询等接口
 */
@ApiTags('AppContact')
@Controller('app/contact')
@UseGuards(JwtAuthGuard)
export class AppContactController {
  constructor(private readonly service: ContactService) {}

  /**
   * 创建地址
   */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '创建地址',
    description: '创建新的联系地址',
  })
  @SwaggerApiResponse(String, { description: '创建成功' })
  async createContact(
    @Body() dto: CreateContactDto,
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<string> {
    const contact = await this.service.create(dto, user.id);
    return { data: contact.id };
  }

  /**
   * 获取我的地址列表
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取我的地址列表',
    description: '获取当前用户的所有地址列表，支持分页和筛选',
  })
  @SwaggerApiResponse([OutputContactDto], { description: '地址列表' })
  async getMyContacts(
    @Query() dto: QueryContactDto,
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<OutputContactDto[]> {
    return this.service.getMyContacts(user.id, dto);
  }

  /**
   * 获取默认地址
   */
  @Get('default/current')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取默认地址',
    description: '获取当前用户的默认地址',
  })
  @SwaggerApiResponse(OutputContactDto, { description: '默认地址' })
  async getDefaultContact(@CurrentUser() user: UserAccessTokenClaims): PromiseApiResponse<OutputContactDto | null> {
    const contact = await this.service.getDefault(user.id);
    return {
      data: contact,
    };
  }

  /**
   * 获取地址详情
   */
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取地址详情',
    description: '获取指定地址的详细信息',
  })
  @ApiParam({
    name: 'id',
    description: '地址 ID',
    example: 'uuid-of-contact',
  })
  @SwaggerApiResponse(OutputContactDto, { description: '地址详情' })
  async getContactDetail(
    @Param('id') id: string,
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<OutputContactDto> {
    const contact = await this.service.getById(id, user.id);
    return {
      data: contact,
    };
  }

  /**
   * 更新地址
   */
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '更新地址',
    description: '更新地址信息',
  })
  @ApiParam({
    name: 'id',
    description: '地址 ID',
    example: 'uuid-of-contact',
  })
  @SwaggerApiResponse(Boolean, { description: '更新成功' })
  async updateContact(
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
    @CurrentUser() user: UserAccessTokenClaims,
  ) {
    await this.service.update(id, dto, user.id);
    return { data: true };
  }

  /**
   * 删除地址
   */
  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '删除地址',
    description: '删除地址（软删除）',
  })
  @ApiParam({
    name: 'id',
    description: '地址 ID',
    example: 'uuid-of-contact',
  })
  @SwaggerApiResponse(Boolean, { description: '删除成功' })
  async deleteContact(
    @Param('id') id: string,
    @CurrentUser() user: UserAccessTokenClaims,
  ): PromiseApiResponse<boolean> {
    await this.service.delete(id, user.id);
    return {
      data: true,
    };
  }

  /**
   * 设置默认地址
   */
  @Patch(':id/set-default')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '设置默认地址',
    description: '将指定地址设为默认地址',
  })
  @ApiParam({
    name: 'id',
    description: '地址 ID',
    example: 'uuid-of-contact',
  })
  @SwaggerApiResponse(Boolean, { description: '设置成功' })
  async setDefaultContact(@Param('id') id: string, @CurrentUser() user: UserAccessTokenClaims) {
    const contact = await this.service.setDefault(id, user.id);
    return {
      data: { id: contact.id, isDefault: contact.isDefault },
    };
  }
}
