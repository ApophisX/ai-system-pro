import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommunityRepository } from '../repositories';

/**
 * 社区删除服务
 *
 * 仅创建者可删除自己创建的社区，采用软删除
 */
@Injectable()
export class CommunityDeleteService {
  private readonly logger = new Logger(CommunityDeleteService.name);

  constructor(private readonly communityRepo: CommunityRepository) {}

  /**
   * 删除社区（软删除）
   *
   * 权限：仅创建者可删除
   * 效果：设置 deletedAt，社区不再展示
   */
  async delete(communityId: string, userId: string): Promise<void> {
    const community = await this.communityRepo.findByIdOrNull(communityId);
    if (!community) {
      throw new NotFoundException({ message: '社区不存在', bizCode: 'COMMUNITY_NOT_FOUND' });
    }

    if (community.creatorId !== userId) {
      throw new ForbiddenException({ message: '仅创建者可删除社区', bizCode: 'COMMUNITY_DELETE_FORBIDDEN' });
    }

    await this.communityRepo.softDelete(communityId);

    this.logger.log(`Community deleted: communityId=${communityId}, userId=${userId}`);
  }
}
