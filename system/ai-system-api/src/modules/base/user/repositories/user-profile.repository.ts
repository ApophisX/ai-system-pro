import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { Gender } from '../enums';

/**
 * 用户资料仓储
 *
 * 负责用户资料的数据访问操作
 */
@Injectable()
export class UserProfileRepository extends Repository<UserProfileEntity> {
  constructor(private dataSource: DataSource) {
    super(UserProfileEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找用户资料
   */
  async findById(id: number): Promise<UserProfileEntity | null> {
    return this.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  /**
   * 根据用户 ID 查找用户资料
   */
  async findByUserId(userId: string): Promise<UserProfileEntity | null> {
    return this.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  /**
   * 根据用户 ID 查找用户资料（不包含关联数据）
   */
  async findByUserIdSimple(userId: string): Promise<UserProfileEntity | null> {
    return this.findOne({
      where: { userId },
    });
  }

  /**
   * 根据多个用户 ID 查找用户资料
   */
  async findByUserIds(userIds: string[]): Promise<UserProfileEntity[]> {
    return this.find({
      where: userIds.map(userId => ({ userId })),
      relations: ['user'],
    });
  }

  /**
   * 根据昵称查找用户资料
   */
  async findByNickname(nickname: string): Promise<UserProfileEntity | null> {
    return this.findOne({
      where: { nickname },
      relations: ['user'],
    });
  }

  /**
   * 根据昵称模糊搜索用户资料
   */
  async searchByNickname(keyword: string, limit: number = 20): Promise<UserProfileEntity[]> {
    return this.find({
      where: {
        nickname: keyword,
      },
      take: limit,
      relations: ['user'],
    });
  }

  /**
   * 根据真实姓名查找用户资料
   */
  async findByRealName(realName: string): Promise<UserProfileEntity | null> {
    return this.findOne({
      where: { realName },
      relations: ['user'],
    });
  }

  /**
   * 根据企业名称查找用户资料
   */
  async findByCompanyName(companyName: string): Promise<UserProfileEntity | null> {
    return this.findOne({
      where: { companyName },
      relations: ['user'],
    });
  }

  /**
   * 根据企业名称模糊搜索用户资料
   */
  async searchByCompanyName(keyword: string, limit: number = 20): Promise<UserProfileEntity[]> {
    return this.find({
      where: {
        companyName: keyword,
      },
      take: limit,
      relations: ['user'],
    });
  }

  /**
   * 根据性别查找用户资料
   */
  async findByGender(gender: Gender): Promise<UserProfileEntity[]> {
    return this.find({
      where: { gender },
      relations: ['user'],
    });
  }

  /**
   * 检查用户资料是否存在
   */
  async existsByUserId(userId: string): Promise<boolean> {
    const count = await this.count({ where: { userId } });
    return count > 0;
  }

  /**
   * 检查昵称是否存在
   */
  async existsByNickname(nickname: string): Promise<boolean> {
    const count = await this.count({ where: { nickname } });
    return count > 0;
  }

  /**
   * 检查企业名称是否存在
   */
  async existsByCompanyName(companyName: string): Promise<boolean> {
    const count = await this.count({ where: { companyName } });
    return count > 0;
  }

  /**
   * 创建用户资料
   */
  async createProfile(profile: Partial<UserProfileEntity>): Promise<UserProfileEntity> {
    const newProfile = this.create(profile);
    return this.save(newProfile);
  }

  /**
   * 更新用户资料
   */
  async updateByUserId(userId: string, data: Partial<UserProfileEntity>): Promise<void> {
    const profile = await this.findByUserIdSimple(userId);
    if (!profile) {
      throw new Error('用户资料不存在');
    }
    Object.assign(profile, data);
    await this.save(profile);
  }

  /**
   * 更新用户资料（通过 ID）
   */
  async updateById(id: number, data: Partial<UserProfileEntity>): Promise<void> {
    const profile = await this.findOne({ where: { id } });
    if (!profile) {
      throw new Error('用户资料不存在');
    }
    Object.assign(profile, data);
    await this.save(profile);
  }

  /**
   * 删除用户资料（通过用户 ID）
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.delete({ userId });
  }

  /**
   * 删除用户资料（通过 ID）
   */
  async deleteById(id: number): Promise<void> {
    await this.delete(id);
  }

  /**
   * 更新昵称
   */
  async updateNickname(userId: string, nickname: string): Promise<void> {
    await this.update({ userId }, { nickname });
  }

  /**
   * 更新个人简介
   */
  async updateBio(userId: string, bio: string): Promise<void> {
    await this.update({ userId }, { bio });
  }

  /**
   * 更新真实姓名（实名认证相关）
   */
  async updateRealName(userId: string, realName: string): Promise<void> {
    await this.update({ userId }, { realName });
  }

  /**
   * 更新身份证信息（实名认证相关）
   */
  async updateIdCardInfo(userId: string, idCard: string, idCardPhotoUrls: string[]): Promise<void> {
    await this.update({ userId }, { idCard, idCardPhotoUrls });
  }

  /**
   * 更新企业信息
   */
  async updateCompanyInfo(
    userId: string,
    companyInfo: Partial<
      Pick<
        UserProfileEntity,
        'companyName' | 'businessLicense' | 'legalRepresentative' | 'companyAddress' | 'companyPhone' | 'companyEmail'
      >
    >,
  ): Promise<void> {
    await this.update({ userId }, companyInfo);
  }

  /**
   * 更新标签
   */
  async updateTags(userId: string, tags: string[]): Promise<void> {
    await this.update({ userId }, { tags });
  }

  /**
   * 更新偏好设置
   */
  async updatePreferences(userId: string, preferences: Record<string, unknown>): Promise<void> {
    const profile = await this.findByUserIdSimple(userId);
    if (profile) {
      profile.preferences = preferences;
      await this.save(profile);
    }
  }

  /**
   * 更新设置
   */
  async updateSettings(userId: string, settings: Record<string, unknown>): Promise<void> {
    const profile = await this.findByUserIdSimple(userId);
    if (profile) {
      profile.settings = settings;
      await this.save(profile);
    }
  }
}
