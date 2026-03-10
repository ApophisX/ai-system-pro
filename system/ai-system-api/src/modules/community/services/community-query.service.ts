import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CommunityRepository, CommunityMemberRepository } from '../repositories';
import { CommunityType, CommunityStatus, CommunityMemberRole } from '../enums';
import {
  QueryCommunityDto,
  QueryCommunityAdminDto,
  QueryMyJoinedCommunityDto,
  OutputCommunityDto,
  OutputCommunityListItemDto,
} from '../dto';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import { OssService } from '@/modules/base/aliyun-oss/oss.service';

/**
 * 社区查询服务
 */
@Injectable()
export class CommunityQueryService {
  constructor(
    private readonly communityRepo: CommunityRepository,
    private readonly memberRepo: CommunityMemberRepository,
    private readonly ossService: OssService,
  ) {}

  async getList(
    dto: QueryCommunityDto,
    userId: string,
  ): Promise<{ data: OutputCommunityListItemDto[]; meta: PaginationMetaDto }> {
    const page = dto.page ?? 0;
    const pageSize = dto.pageSize ?? 20;
    const skip = page * pageSize;

    const [communities, total] = await this.communityRepo.findApprovedWithPagination({
      keyword: dto.keyword,
      type: dto.type,
      joined: dto.joined,
      userId,
      sort: dto.sort ?? 'createdAt',
      order: (dto.order ?? 'desc').toUpperCase() as 'ASC' | 'DESC',
      skip,
      take: pageSize,
    });

    const roleMap = new Map<string, string>();
    for (const c of communities) {
      const role = await this.memberRepo.getMemberRole(c.id, userId);
      if (role) roleMap.set(c.id, role);
    }

    const list = plainToInstance(OutputCommunityListItemDto, communities, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });

    list.forEach(item => {
      item.joined = roleMap.has(item.id);
      item.role = roleMap.get(item.id) as OutputCommunityListItemDto['role'];
      item.coverImage = this.ossService.getSignatureUrl(item.coverImage);
      if (item.type === CommunityType.PRIVATE) {
        item.memberCount = undefined;
        item.assetCount = undefined;
      }
    });

    const meta = new PaginationMetaDto(page, pageSize);
    meta.total = total;
    return { data: list, meta };
  }

  async getDetail(id: string, userId: string): Promise<OutputCommunityDto> {
    const community = await this.communityRepo.findByIdOrNull(id);
    if (!community) {
      throw new NotFoundException('社区不存在');
    }

    const isCreator = community.creatorId === userId;
    if (!isCreator && community.status !== CommunityStatus.APPROVED) {
      throw new NotFoundException('社区不存在或未开放');
    }

    const role = await this.memberRepo.getMemberRole(id, userId);
    const effectiveRole = role ?? (isCreator ? CommunityMemberRole.CREATOR : undefined);
    const result = plainToInstance(OutputCommunityDto, community, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });

    result.joined = !!effectiveRole;
    result.role = effectiveRole;
    result.coverImage = this.ossService.getSignatureUrl(result.coverImage);

    if (
      community.type === CommunityType.PRIVATE &&
      effectiveRole !== CommunityMemberRole.CREATOR &&
      effectiveRole !== CommunityMemberRole.ADMIN
    ) {
      result.inviteCode = undefined;
      // delete (result as unknown as Record<string, unknown>).memberCount;
      // delete (result as unknown as Record<string, unknown>).assetCount;
    }

    return result;
  }

  async getMyJoined(
    dto: QueryMyJoinedCommunityDto,
    userId: string,
  ): Promise<{ data: OutputCommunityListItemDto[]; meta: PaginationMetaDto }> {
    const page = dto.page ?? 0;
    const pageSize = dto.pageSize ?? 20;
    const [communities, total] = await this.communityRepo.findJoinedByUser(userId, {
      keyword: dto.keyword,
      skip: page * pageSize,
      take: pageSize,
    });

    const list = plainToInstance(OutputCommunityListItemDto, communities, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });

    list.forEach(item => {
      item.joined = true;
      // if (item.type === CommunityType.PRIVATE) {
      //   delete (item as unknown as Record<string, unknown>).memberCount;
      //   delete (item as unknown as Record<string, unknown>).assetCount;
      // }
      item.coverImage = this.ossService.getSignatureUrl(item.coverImage);
    });

    const meta = new PaginationMetaDto(page, pageSize);
    meta.total = total;
    return { data: list, meta };
  }

  async getMyCreated(
    userId: string,
    page: number,
    pageSize: number,
    status?: CommunityStatus,
  ): Promise<{ data: OutputCommunityDto[]; meta: PaginationMetaDto }> {
    const [communities, total] = await this.communityRepo.findCreatedByUser(userId, {
      status,
      skip: page * pageSize,
      take: pageSize,
    });

    const list = plainToInstance(OutputCommunityDto, communities, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });

    list.forEach(item => {
      item.joined = true;
      item.role = CommunityMemberRole.CREATOR;
      item.coverImage = this.ossService.getSignatureUrl(item.coverImage);
    });

    const meta = new PaginationMetaDto(page, pageSize);
    meta.total = total;
    return { data: list, meta };
  }

  async getAdminList(dto: QueryCommunityAdminDto): Promise<{ data: OutputCommunityDto[]; meta: PaginationMetaDto }> {
    const page = dto.page ?? 0;
    const pageSize = dto.pageSize ?? 20;
    const skip = page * pageSize;

    const qb = this.communityRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.creator', 'creator')
      .where('c.deleted_at IS NULL');

    if (dto.status) {
      qb.andWhere('c.status = :status', { status: dto.status });
    }
    if (dto.type) {
      qb.andWhere('c.type = :type', { type: dto.type });
    }
    if (dto.keyword?.trim()) {
      qb.andWhere('(c.name LIKE :keyword OR c.description LIKE :keyword)', {
        keyword: `%${dto.keyword.trim()}%`,
      });
    }

    qb.orderBy('c.createdAt', 'DESC').skip(skip).take(pageSize);

    const [communities, total] = await qb.getManyAndCount();

    const list = plainToInstance(OutputCommunityDto, communities, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });

    list.forEach(item => {
      item.coverImage = this.ossService.getSignatureUrl(item.coverImage);
    });

    const meta = new PaginationMetaDto(page, pageSize);
    meta.total = total;
    return { data: list, meta };
  }

  async getAdminDetail(id: string): Promise<OutputCommunityDto> {
    const community = await this.communityRepo.findByIdWithAudit(id);
    return plainToInstance(OutputCommunityDto, community, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }
}
