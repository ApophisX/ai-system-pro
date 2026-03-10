import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CommunityRepository } from '../repositories';
import { CommunityEntity, CommunityMemberEntity } from '../entities';
import { CommunityType, CommunityStatus, CommunityMemberRole } from '../enums';
import { CreateCommunityDto } from '../dto';
import { generateInviteCode } from '../utils/invite-code.util';

/**
 * 社区创建服务
 */
@Injectable()
export class CommunityCreateService {
  private readonly logger = new Logger(CommunityCreateService.name);

  constructor(
    private readonly communityRepo: CommunityRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 创建社区
   *
   * 事务：community + community_member(creator) + memberCount=1
   */
  async create(dto: CreateCommunityDto, userId: string): Promise<CommunityEntity> {
    let inviteCode: string | undefined;
    if (dto.type === CommunityType.PRIVATE) {
      inviteCode = await this.generateUniqueInviteCode();
    }

    return this.dataSource.transaction(async manager => {
      const community = manager.getRepository(CommunityEntity).create({
        name: dto.name,
        description: dto.description,
        coverImage: dto.coverImage,
        type: dto.type,
        status: CommunityStatus.PENDING,
        inviteCode,
        creatorId: userId,
        memberCount: 1,
        assetCount: 0,
        sortOrder: 0,
      });

      const savedCommunity = await manager.save(CommunityEntity, community);

      const member = manager.getRepository(CommunityMemberEntity).create({
        communityId: savedCommunity.id,
        userId,
        role: CommunityMemberRole.CREATOR,
        joinedAt: new Date(),
      });

      await manager.save(CommunityMemberEntity, member);

      this.logger.log(`社区创建成功: communityId=${savedCommunity.id}, creatorId=${userId}, type=${dto.type}`);

      return savedCommunity;
    });
  }

  private async generateUniqueInviteCode(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = generateInviteCode(6);
      const exists = await this.communityRepo.existsByInviteCode(code);
      if (!exists) return code;
    }
    return generateInviteCode(8);
  }
}
