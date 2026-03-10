import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { MerchantInviteEvents } from '@/modules/merchant-invite/events/merchant-invite.events';
import { UserRepository } from '../repositories/user.repository';
import { UserProfileRepository } from '../repositories/user-profile.repository';
import { UserEntity } from '../entities/user.entity';
import { UserProfileEntity } from '../entities/user-profile.entity';
import {
  OutputUserDto,
  OutputUserProfileDto,
  OutputEnterpriseApplicationListItemDto,
  OutputAdminUserListItemDto,
  OutputUserDetailDto,
} from '../dto/output-user.dto';
import { QueryEnterpriseApplicationDto, QueryUserDto } from '../dto/query-user.dto';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import { UpdateUserProfileInfoDto, AdminUpdateUserDto } from '../dto/update-user.dto';
import { RealNameAuthDto } from '../dto/real-name-auth.dto';
import { EnterpriseVerificationDto } from '../dto/update-user.dto';
import { VerificationStatus, EnterpriseVerificationStatus } from '../enums';
import { UserType, AccountStatus } from '../enums';
import { plainToInstance } from 'class-transformer';
import { OssService } from '../../aliyun-oss/oss.service';
import dayjs from 'dayjs';
import { isURL } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { RECOGNITION_CONFIG_KEY, RecognitionConfig } from '@/config';
import axios from 'axios';

/**
 * 用户服务
 *
 * 提供用户信息查询、资料编辑等业务逻辑
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepo: UserRepository,
    private readonly profileRepo: UserProfileRepository,
    private readonly dataSource: DataSource,
    private readonly ossService: OssService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    //
  }

  /**
   * 获取当前用profile
   */
  async getCurrentUserProfile(userId: string): Promise<OutputUserProfileDto> {
    let profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      profile = await this.profileRepo.createProfile({ userId });
    }
    if (profile.avatar) {
      profile.avatar = this.ossService.getSignatureUrl(profile.avatar);
    }
    return plainToInstance(OutputUserProfileDto, profile, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }
  /**
   * 是否已实名认证
   */
  async isRealNameVerified(userId: string): Promise<boolean> {
    const user = await this.userRepo.findById(userId);
    return user.verificationStatus === VerificationStatus.VERIFIED;
  }

  /**
   * 获取当前用户信息（包含资料）
   */
  async getCurrentUser(userId: string): Promise<OutputUserDto> {
    const user = await this.userRepo.findByIdWithProfile(userId);

    // 确保用户资料存在
    let profile = user.profile;
    if (!profile) {
      // 如果用户资料不存在，创建一个空的资料
      profile = await this.profileRepo.createProfile({
        userId: user.id,
      });
    }

    if (profile.avatar) {
      profile.avatar = this.ossService.getSignatureUrl(profile.avatar);
    }

    // 合并用户和资料信息
    user.profile = profile;

    return plainToInstance(OutputUserDto, user, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 更新用户资料（头像、昵称、性别、简介）
   */
  async updateProfile(userId: string, dto: UpdateUserProfileInfoDto): Promise<OutputUserDto> {
    // 检查用户是否存在
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 在事务中更新用户和资料
    return this.dataSource.transaction(async manager => {
      // 获取或创建用户资料
      let profile = await manager.findOne(UserProfileEntity, {
        where: { userId },
      });

      if (user?.avatar && dto.avatar) {
        // 删除oss上的头像
        await this.ossService.deleteMulti([user.avatar]);
      }

      if (!profile) {
        profile = manager.create(UserProfileEntity, {
          userId: user.id,
        });
        profile = await manager.save(UserProfileEntity, profile);
      }

      manager.merge(UserProfileEntity, profile, dto);
      await manager.save(UserProfileEntity, profile);
      if (dto.avatar) {
        await manager.update(UserEntity, { id: userId }, { avatar: dto.avatar });
      }

      // 重新查询用户信息（包含更新后的资料）
      const updatedUser = await manager.findOne(UserEntity, {
        where: { id: userId },
        relations: ['profile'],
      });
      if (!updatedUser) {
        throw new NotFoundException('用户不存在');
      }

      updatedUser.username = dto.nickname;
      await manager.save(UserEntity, updatedUser);

      this.logger.log(`User profile updated: userId=${userId}`);

      return plainToInstance(OutputUserDto, updatedUser, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      });
    });
  }

  /**
   * 实名认证：将身份证等信息写入 user_profile，并更新用户认证状态
   */
  async realNameAuth(userId: string, dto: RealNameAuthDto): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (user.verificationStatus === VerificationStatus.VERIFIED) {
      throw new BadRequestException('已完成实名认证，无需重复提交');
    }

    if (!(await this.verifyRealNameByThreeElements(user, dto))) {
      throw new BadRequestException('实名认证失败，请检查手机号、姓名、身份证号是否一致');
    }

    await this.dataSource.transaction(async manager => {
      let profile = await manager.findOne(UserProfileEntity, {
        where: { userId },
      });
      if (!profile) {
        profile = manager.create(UserProfileEntity, { userId, nickname: user.username, avatar: user.avatar });
        profile = await manager.save(UserProfileEntity, profile);
      }

      const now = dayjs();
      // 判断身份中是否已过期
      if (profile.idCardEndDate && dayjs(profile.idCardEndDate).isBefore(now)) {
        throw new BadRequestException('身份证已过期');
      }

      profile.gender = dto.gender;
      profile.birthday = dto.birthday ? new Date(dto.birthday) : undefined;
      profile.idCard = dto.idCard;
      profile.idCardPhotoUrls = dto.idCardPhotoUrls?.map(url => (isURL(url) ? new URL(url).pathname : url));
      profile.idCardAddress = dto.idCardAddress;
      profile.idCardStartDate = dto.idCardStartDate ? new Date(dto.idCardStartDate) : undefined;
      profile.idCardEndDate = dto.idCardEndDate ? new Date(dto.idCardEndDate) : undefined;
      profile.idCardIssue = dto.idCardIssue;
      profile.idCardSnapshot = dto.idCardSnapshot as Record<string, any> | undefined;
      profile.realName = dto.realName;

      await manager.save(UserProfileEntity, profile);
      await manager.update(
        UserEntity,
        { id: userId },
        { verificationStatus: VerificationStatus.VERIFIED, verifiedAt: new Date() },
      );

      // 注意：USER_VERIFIED 仅由企业认证审核通过触发，商户邀请 relation 只响应企业认证
      // 个人实名认证不触发 relation 更新

      this.logger.log(
        `实名认证完成: userId=${userId}， realName=${dto.realName}, idCard=${dto.idCard.replace(/^(.{3}).*(.{4})$/, '$1******$2')}`,
      );
    });
  }

  /**
   * 企业认证：提交企业资料，等待后台审核
   *
   * 提交后 enterpriseVerificationStatus=PENDING，需管理员审核通过后触发 relation VERIFIED
   * 审核通过由 approveEnterpriseVerification 完成
   */
  async enterpriseVerification(userId: string, dto: EnterpriseVerificationDto): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (user.enterpriseVerificationStatus === EnterpriseVerificationStatus.VERIFIED) {
      throw new BadRequestException('已完成企业认证，无需重复提交');
    }
    if (user.enterpriseVerificationStatus === EnterpriseVerificationStatus.PENDING) {
      throw new BadRequestException('企业认证审核中，请耐心等待');
    }

    await this.dataSource.transaction(async manager => {
      let profile = await manager.findOne(UserProfileEntity, {
        where: { userId },
      });
      if (!profile) {
        profile = manager.create(UserProfileEntity, {
          userId,
          nickname: user.username,
          avatar: user.avatar,
        });
        profile = await manager.save(UserProfileEntity, profile);
      }

      profile.companyName = dto.companyName;
      profile.businessLicense = dto.businessLicense;
      profile.legalRepresentative = dto.legalRepresentative;
      profile.companyAddress = dto.companyAddress;
      profile.companyPhone = dto.companyPhone;
      profile.companyEmail = dto.companyEmail;
      profile.businessLicensePhotoUrls = dto.businessLicensePhotoUrls;
      profile.attachmentUrls = dto.attachmentUrls;

      await manager.save(UserProfileEntity, profile);
      await manager.update(
        UserEntity,
        { id: userId },
        {
          userType: UserType.ENTERPRISE,
          enterpriseVerificationStatus: EnterpriseVerificationStatus.PENDING,
        },
      );

      this.logger.log(`企业认证已提交（待审核）: userId=${userId}, companyName=${dto.companyName}`);
    });
  }

  /**
   * 审核通过企业认证（管理员）
   *
   * 通过后触发 USER_VERIFIED 事件，用于商户邀请 relation 状态更新
   */
  async approveEnterpriseVerification(userId: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (user.enterpriseVerificationStatus !== EnterpriseVerificationStatus.PENDING) {
      throw new BadRequestException(
        user.enterpriseVerificationStatus === EnterpriseVerificationStatus.VERIFIED
          ? '该用户企业认证已通过'
          : '该用户企业认证未处于待审核状态',
      );
    }

    await this.userRepo.update(userId, {
      enterpriseVerificationStatus: EnterpriseVerificationStatus.VERIFIED,
      enterpriseVerifiedAt: new Date(),
    });

    this.eventEmitter.emit(MerchantInviteEvents.USER_VERIFIED, { userId });
    this.logger.log(`企业认证审核通过: userId=${userId}`);
  }

  /**
   * 将已通过的企业认证恢复为待审核（管理员）
   *
   * 用于需要重新审核的场景，如发现资料有误、需补充材料等
   */
  async revertEnterpriseVerificationToPending(userId: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (user.enterpriseVerificationStatus !== EnterpriseVerificationStatus.VERIFIED) {
      throw new BadRequestException(
        user.enterpriseVerificationStatus === EnterpriseVerificationStatus.PENDING
          ? '该用户企业认证已处于待审核状态'
          : '仅可将已通过的企业认证恢复为待审核',
      );
    }

    await this.userRepo.update(userId, {
      enterpriseVerificationStatus: EnterpriseVerificationStatus.PENDING,
      enterpriseVerifiedAt: null,
    });

    this.logger.log(`企业认证已恢复为待审核: userId=${userId}`);
  }

  /**
   * 审核拒绝企业认证（管理员）
   */
  async rejectEnterpriseVerification(userId: string, reason?: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (user.enterpriseVerificationStatus !== EnterpriseVerificationStatus.PENDING) {
      throw new BadRequestException('该用户企业认证未处于待审核状态');
    }

    await this.userRepo.update(userId, {
      enterpriseVerificationStatus: EnterpriseVerificationStatus.REJECTED,
    });

    this.logger.log(`企业认证审核拒绝: userId=${userId}${reason ? `, reason=${reason}` : ''}`);
  }

  /**
   * 分页获取 C 端用户列表（管理端）
   * 支持多条件筛选：关键字、用户类型、认证状态、账户状态、风险等级、注册时间
   */
  async getAdminUserList(dto: QueryUserDto): Promise<{ data: OutputAdminUserListItemDto[]; meta: PaginationMetaDto }> {
    const meta = new PaginationMetaDto(dto.page, dto.pageSize);
    const [users, total] = await this.userRepo.findWithPagination({
      keyword: dto.keyword,
      userType: dto.userType,
      verificationStatus: dto.verificationStatus,
      enterpriseVerificationStatus: dto.enterpriseVerificationStatus,
      status: dto.status,
      riskLevel: dto.riskLevel,
      startDate: dto.startDate,
      endDate: dto.endDate,
      sortBy: dto.sortBy,
      sortOrder: dto.sortOrder,
      skip: meta.skip,
      take: meta.pageSize,
    });

    meta.total = total;

    const data = plainToInstance(OutputAdminUserListItemDto, users, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
    data.forEach(item => {
      item.avatar = this.ossService.getSignatureUrl(item.avatar);
    });
    return { data, meta };
  }

  /**
   * 获取用户详情（管理端，可查看冻结/封禁用户）
   */
  async getAdminUserDetail(userId: string): Promise<OutputUserDetailDto> {
    const user = await this.userRepo.findByIdForAdmin(userId);

    let profile = user.profile;
    if (!profile) {
      profile = await this.profileRepo.createProfile({ userId: user.id });
    }

    if (profile.avatar) {
      profile.avatar = this.ossService.getSignatureUrl(profile.avatar);
    }

    profile.idCardPhotoUrls = profile.idCardPhotoUrls?.map(url => this.ossService.getSignatureUrl(url)) || [];
    profile.businessLicensePhotoUrls =
      profile.businessLicensePhotoUrls?.map(url => this.ossService.getSignatureUrl(url)) || [];
    profile.attachmentUrls = profile.attachmentUrls?.map(url => this.ossService.getSignatureUrl(url)) || [];
    user.profile = profile;

    return plainToInstance(OutputUserDetailDto, user, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 冻结用户（active -> frozen）
   * 冻结后用户无法登录、无法下单
   */
  async freezeUser(userId: string): Promise<void> {
    const user = await this.userRepo.findByIdForAdmin(userId);
    if (user.status === AccountStatus.FROZEN) {
      throw new BadRequestException('该用户已被冻结');
    }
    if (user.status === AccountStatus.BANNED) {
      throw new BadRequestException('该用户已被封禁，无法冻结');
    }

    await this.userRepo.updateStatus(userId, AccountStatus.FROZEN);
    this.logger.log(`用户已冻结: userId=${userId}`);
  }

  /**
   * 解冻用户（frozen -> active）
   */
  async unfreezeUser(userId: string): Promise<void> {
    const user = await this.userRepo.findByIdForAdmin(userId);
    if (user.status !== AccountStatus.FROZEN) {
      throw new BadRequestException('该用户未被冻结，无需解冻');
    }

    await this.userRepo.updateStatus(userId, AccountStatus.ACTIVE);
    this.logger.log(`用户已解冻: userId=${userId}`);
  }

  /**
   * 封禁用户（active/frozen -> banned）
   * 封禁后用户无法登录、无法使用平台
   */
  async banUser(userId: string): Promise<void> {
    const user = await this.userRepo.findByIdForAdmin(userId);
    if (user.status === AccountStatus.BANNED) {
      throw new BadRequestException('该用户已被封禁');
    }

    await this.userRepo.updateStatus(userId, AccountStatus.BANNED);
    this.logger.log(`用户已封禁: userId=${userId}`);
  }

  /**
   * 解封用户（banned -> active）
   */
  async unbanUser(userId: string): Promise<void> {
    const user = await this.userRepo.findByIdForAdmin(userId);
    if (user.status !== AccountStatus.BANNED) {
      throw new BadRequestException('该用户未被封禁，无需解封');
    }

    await this.userRepo.updateStatus(userId, AccountStatus.ACTIVE);
    this.logger.log(`用户已解封: userId=${userId}`);
  }

  /**
   * 管理端更新用户信息
   * 支持更新基础信息、账户状态、风险等级、信用评分、资产数量限制等
   */
  async updateAdminUser(userId: string, dto: AdminUpdateUserDto): Promise<OutputUserDto> {
    await this.userRepo.findByIdForAdmin(userId);

    if (dto.phone !== undefined) {
      const existingByPhone = await this.userRepo.findByPhone(dto.phone);
      if (existingByPhone && existingByPhone.id !== userId) {
        throw new ConflictException('该手机号已被其他用户使用');
      }
    }
    if (dto.email !== undefined) {
      const existingByEmail = await this.userRepo.findByEmail(dto.email);
      if (existingByEmail && existingByEmail.id !== userId) {
        throw new ConflictException('该邮箱已被其他用户使用');
      }
    }
    if (dto.username !== undefined) {
      const existingByUsername = await this.userRepo.findByUsername(dto.username);
      if (existingByUsername && existingByUsername.id !== userId) {
        throw new ConflictException('该用户名已被其他用户使用');
      }
    }

    await this.dataSource.transaction(async manager => {
      const userUpdateData: Record<string, unknown> = {};
      if (dto.username !== undefined) userUpdateData.username = dto.username;
      if (dto.avatar !== undefined) userUpdateData.avatar = dto.avatar;
      if (dto.phone !== undefined) userUpdateData.phone = dto.phone;
      if (dto.email !== undefined) userUpdateData.email = dto.email;
      if (dto.userType !== undefined) userUpdateData.userType = dto.userType;
      if (dto.status !== undefined) userUpdateData.status = dto.status;
      if (dto.riskLevel !== undefined) userUpdateData.riskLevel = dto.riskLevel;
      if (dto.creditScore !== undefined) userUpdateData.creditScore = dto.creditScore;
      if (dto.maxDailyAssetCreationCount !== undefined)
        userUpdateData.maxDailyAssetCreationCount = dto.maxDailyAssetCreationCount;
      if (dto.maxTotalAssetCount !== undefined) userUpdateData.maxTotalAssetCount = dto.maxTotalAssetCount;
      if (dto.maxTotalAssetInventoryCount !== undefined)
        userUpdateData.maxTotalAssetInventoryCount = dto.maxTotalAssetInventoryCount;

      if (Object.keys(userUpdateData).length > 0) {
        await manager.update(UserEntity, { id: userId }, userUpdateData);
      }

      if (dto.nickname !== undefined) {
        let profile = await manager.findOne(UserProfileEntity, { where: { userId } });
        if (!profile) {
          profile = manager.create(UserProfileEntity, { userId });
          profile = await manager.save(UserProfileEntity, profile);
        }
        profile.nickname = dto.nickname;
        await manager.save(UserProfileEntity, profile);
      }
    });

    this.logger.log(`管理端更新用户: userId=${userId}`);
    const data = await this.getAdminUserDetail(userId);
    return plainToInstance(OutputUserDto, data, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 分页获取企业用户申请列表（管理端）
   * 固定 userType=ENTERPRISE；未传 enterpriseVerificationStatus 时默认仅查待审核（PENDING）
   */
  async getEnterpriseApplicationList(
    dto: QueryEnterpriseApplicationDto,
  ): Promise<{ data: OutputEnterpriseApplicationListItemDto[]; meta: PaginationMetaDto }> {
    const meta = new PaginationMetaDto(dto.page, dto.pageSize);
    const [users, total] = await this.userRepo.findEnterpriseApplicationsWithPagination({
      userType: UserType.ENTERPRISE,
      enterpriseVerificationStatus: dto.enterpriseVerificationStatus,
      keyword: dto.keyword,
      startDate: dto.startDate,
      endDate: dto.endDate,
      sortBy: dto.sortBy,
      sortOrder: dto.sortOrder,
      skip: meta.skip,
      take: meta.pageSize,
    });

    meta.total = total;

    const data = plainToInstance(OutputEnterpriseApplicationListItemDto, users, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
    data.forEach(item => {
      if (item.profile) {
        item.profile.businessLicensePhotoUrls =
          item.profile.businessLicensePhotoUrls?.map(url => this.ossService.getSignatureUrl(url)) || [];
        item.profile.idCardPhotoUrls =
          item.profile.idCardPhotoUrls?.map(url => this.ossService.getSignatureUrl(url)) || [];
      }
    });

    return { data, meta };
  }

  // ---------------------------------------- PRIVATE METHODS ----------------------------------------

  /**
   * 实名认证，手机、姓名、身份证号三要素
   */
  private async verifyRealNameByThreeElements(user: UserEntity, dto: RealNameAuthDto): Promise<boolean> {
    const { appCode } = this.configService.get<RecognitionConfig>(RECOGNITION_CONFIG_KEY)!;
    if (!user.phone) {
      throw new BadRequestException('用户手机号不能为空');
    }
    const formData = new FormData();
    formData.append('mobile', user.phone);
    formData.append('name', dto.realName);
    formData.append('idcard', dto.idCard);

    const verifyRealNameUrl = 'https://kzmobilev2.market.alicloudapi.com/api/mobile_three/check';
    const result = await axios.post<{ data?: { result?: string } }>(verifyRealNameUrl, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Authorization: `APPCODE ${appCode}`,
      },
    });
    return result.data?.data?.result?.toString() === '0';
  }
}
