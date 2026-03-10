import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CommunityRepository } from '../repositories';
import { CommunityType } from '../enums';
import { generateInviteCode } from '../utils/invite-code.util';

/**
 * 社区更新服务
 *
 * 创建者更新社区信息、重置邀请码等
 */
@Injectable()
export class CommunityUpdateService {
  private readonly logger = new Logger(CommunityUpdateService.name);

  constructor(private readonly communityRepo: CommunityRepository) {}

  /**
   * 重置邀请码
   *
   * 权限：仅创建者可重置
   * 约束：仅私密社区有邀请码可重置
   * 效果：生成新唯一邀请码，旧码立即失效
   */
  async resetInviteCode(communityId: string, userId: string): Promise<void> {
    const community = await this.communityRepo.findByIdOrNull(communityId);
    if (!community) {
      throw new NotFoundException({ message: '社区不存在', bizCode: 'COMMUNITY_NOT_FOUND' });
    }

    if (community.creatorId !== userId) {
      throw new ForbiddenException({ message: '仅创建者可重置邀请码', bizCode: 'COMMUNITY_INVITE_RESET_FORBIDDEN' });
    }

    if (community.type !== CommunityType.PRIVATE) {
      throw new BadRequestException({ message: '仅私密社区可重置邀请码', bizCode: 'COMMUNITY_NOT_PRIVATE' });
    }

    const newCode = await this.generateUniqueInviteCode(communityId);
    await this.communityRepo.update(communityId, { inviteCode: newCode });

    this.logger.log(`Invite code reset: communityId=${communityId}, userId=${userId}`);
  }

  private async generateUniqueInviteCode(excludeCommunityId: string): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = generateInviteCode(6);
      const exists = await this.communityRepo.existsByInviteCode(code, excludeCommunityId);
      if (!exists) return code;
    }
    return generateInviteCode(8);
  }
}
