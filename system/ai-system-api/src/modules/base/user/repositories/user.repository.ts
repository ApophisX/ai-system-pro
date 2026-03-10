import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository, SelectQueryBuilder, In, DataSource } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserType, VerificationStatus, EnterpriseVerificationStatus, AccountStatus, RiskLevel } from '../enums';
import { SearchUserDto } from '../dto/query-user.dto';

/**
 * 用户查询参数接口
 */
export interface UserQueryOptions {
  keyword?: string;
  userType?: UserType;
  verificationStatus?: VerificationStatus;
  enterpriseVerificationStatus?: EnterpriseVerificationStatus;
  status?: AccountStatus;
  riskLevel?: RiskLevel;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'creditScore';
  sortOrder?: 'ASC' | 'DESC';
  skip: number;
  take: number;
}

/**
 * 用户仓储
 *
 * 负责用户的数据访问操作
 */
@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(private dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找用户
   */
  async findById(id: string) {
    const user = await this.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (user.status === AccountStatus.FROZEN || user.status === AccountStatus.BANNED) {
      throw new ForbiddenException('用户已被冻结或封禁');
    }
    return user;
  }

  /**
   * 根据 ID 查找用户（包含关联数据）
   */
  async findByIdWithProfile(id: string): Promise<UserEntity> {
    const user = await this.findOne({
      where: { id },
      relations: ['profile'],
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  /**
   * 根据 ID 查找用户（管理端，不校验账户状态，可查看冻结/封禁用户）
   */
  async findByIdForAdmin(id: string): Promise<UserEntity> {
    const user = await this.findOne({
      where: { id },
      relations: ['profile'],
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  /**
   * 根据多个 ID 查找用户
   */
  async findByIds(ids: string[]): Promise<UserEntity[]> {
    return this.find({
      where: { id: In(ids) },
    });
  }

  /**
   * 根据手机号查找用户
   */
  async findByPhone(phone: string): Promise<UserEntity | null> {
    return this.findOne({
      where: { phone },
    });
  }

  /**
   * 根据手机号查找用户（包含关联数据）
   */
  async findByPhoneWithProfile(phone: string): Promise<UserEntity | null> {
    return this.findOne({
      where: { phone },
      relations: ['profile'],
    });
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne({
      where: { email },
    });
  }

  /**
   * 根据邮箱查找用户（包含关联数据）
   */
  async findByEmailWithProfile(email: string): Promise<UserEntity | null> {
    return this.findOne({
      where: { email },
      relations: ['profile'],
    });
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.findOne({
      where: { username },
    });
  }

  /**
   * 检查手机号是否存在
   */
  async existsByPhone(phone: string): Promise<boolean> {
    const count = await this.count({ where: { phone } });
    return count > 0;
  }

  /**
   * 检查邮箱是否存在
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.count({ where: { email } });
    return count > 0;
  }

  /**
   * 检查用户名是否存在
   */
  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.count({ where: { username } });
    return count > 0;
  }

  /**
   * 根据用户类型查找用户
   */
  async findByUserType(userType: UserType): Promise<UserEntity[]> {
    return this.find({
      where: { userType },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据认证状态查找用户
   */
  async findByVerificationStatus(verificationStatus: VerificationStatus): Promise<UserEntity[]> {
    return this.find({
      where: { verificationStatus },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据账户状态查找用户
   */
  async findByStatus(status: AccountStatus): Promise<UserEntity[]> {
    return this.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据风险等级查找用户
   */
  async findByRiskLevel(riskLevel: RiskLevel): Promise<UserEntity[]> {
    return this.find({
      where: { riskLevel },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 分页查询用户列表（管理端）
   * 左连接 profile 以支持昵称搜索及返回资料信息
   */
  async findWithPagination(options: UserQueryOptions): Promise<[UserEntity[], number]> {
    const queryBuilder = this.createQueryBuilder('user').leftJoinAndSelect('user.profile', 'profile');

    this.applyFilters(queryBuilder, options);
    this.applySorting(queryBuilder, options);

    queryBuilder.skip(options.skip);
    queryBuilder.take(options.take);

    return queryBuilder.getManyAndCount();
  }

  /**
   * 分页查询企业用户申请列表（管理端）
   * 固定 userType=ENTERPRISE，支持按企业认证状态筛选，关键字搜索用户与企业信息，带 profile 关联
   */
  async findEnterpriseApplicationsWithPagination(options: UserQueryOptions): Promise<[UserEntity[], number]> {
    const queryBuilder = this.createQueryBuilder('user').leftJoinAndSelect('user.profile', 'profile');

    queryBuilder.andWhere('user.userType = :userType', {
      userType: UserType.ENTERPRISE,
    });

    if (options.enterpriseVerificationStatus != null) {
      queryBuilder.andWhere('user.enterpriseVerificationStatus = :enterpriseVerificationStatus', {
        enterpriseVerificationStatus: options.enterpriseVerificationStatus,
      });
    }

    if (options.keyword) {
      queryBuilder.andWhere(
        '(user.username LIKE :keyword OR user.phone LIKE :keyword OR user.email LIKE :keyword OR profile.companyName LIKE :keyword OR profile.legalRepresentative LIKE :keyword)',
        { keyword: `%${options.keyword}%` },
      );
    }

    if (options.startDate) {
      queryBuilder.andWhere('user.createdAt >= :startDate', {
        startDate: options.startDate,
      });
    }
    if (options.endDate) {
      queryBuilder.andWhere('user.createdAt <= :endDate', {
        endDate: options.endDate,
      });
    }

    this.applySorting(queryBuilder, options);
    queryBuilder.skip(options.skip);
    queryBuilder.take(options.take);

    return queryBuilder.getManyAndCount();
  }

  /**
   * 搜索用户（App 端，公开搜索）
   */
  async searchUsers(dto: SearchUserDto): Promise<[UserEntity[], number]> {
    const queryBuilder = this.createQueryBuilder('user');

    // 只查询正常状态的用户
    queryBuilder.andWhere('user.status = :status', {
      status: AccountStatus.ACTIVE,
    });

    // 关键字搜索（昵称、用户名）
    if (dto.keyword) {
      queryBuilder.andWhere('(user.nickname LIKE :keyword OR user.username LIKE :keyword)', {
        keyword: `%${dto.keyword}%`,
      });
    }

    // 用户类型过滤
    if (dto.userType) {
      queryBuilder.andWhere('user.userType = :userType', {
        userType: dto.userType,
      });
    }

    // 只显示已认证用户
    if (dto.verifiedOnly) {
      queryBuilder.andWhere('user.verificationStatus = :verificationStatus', {
        verificationStatus: VerificationStatus.VERIFIED,
      });
    }

    // 排序
    const sortOrder = dto.sortOrder || 'DESC';
    if (dto.sortBy === 'creditScore') {
      queryBuilder.orderBy('user.creditScore', sortOrder);
    } else {
      queryBuilder.orderBy('user.createdAt', sortOrder);
    }

    queryBuilder.skip(dto.skip);
    queryBuilder.take(dto.pageSize);

    return queryBuilder.getManyAndCount();
  }

  /*
  /**
   * 更新用户登录信息
   */
  async updateLoginInfo(id: string, loginIp: string): Promise<void> {
    await this.update(id, {
      lastLoginAt: new Date(),
      lastLoginIp: loginIp,
    });
  }

  /**
   * 更新用户余额（可用余额）
   */
  async updateAvailableBalance(id: string, amount: number): Promise<void> {
    await this.increment({ id }, 'availableBalance', amount);
  }

  /**
   * 更新用户冻结余额
   */
  async updateFrozenBalance(id: string, amount: number): Promise<void> {
    await this.increment({ id }, 'frozenBalance', amount);
  }

  /**
   * 更新用户信用评分
   */
  async updateCreditScore(id: string, score: number): Promise<void> {
    await this.update(id, { creditScore: score });
  }

  /**
   * 更新用户认证状态
   */
  async updateVerificationStatus(id: string, status: VerificationStatus, verifiedAt?: Date): Promise<void> {
    const updateData: Partial<UserEntity> = {
      verificationStatus: status,
    };
    if (verifiedAt) {
      updateData.verifiedAt = verifiedAt;
    }
    await this.update(id, {
      verificationStatus: status,
      verifiedAt: verifiedAt,
    });
  }

  /**
   * 更新用户账户状态
   */
  async updateStatus(id: string, status: AccountStatus): Promise<void> {
    await this.update(id, { status });
  }

  /**
   * 更新用户风险等级
   */
  async updateRiskLevel(id: string, riskLevel: RiskLevel): Promise<void> {
    await this.update(id, { riskLevel });
  }

  /**
   * 统计已认证用户数量
   */
  async countVerified(): Promise<number> {
    return this.count({
      where: { verificationStatus: VerificationStatus.VERIFIED },
    });
  }

  // ========== UserProfile 相关操作 ==========

  // ========== 私有方法 ==========

  /**
   * 应用过滤条件
   */
  private applyFilters(queryBuilder: SelectQueryBuilder<UserEntity>, options: UserQueryOptions): void {
    // 关键字搜索（用户名、昵称 profile.nickname、手机号、邮箱）
    if (options.keyword) {
      queryBuilder.andWhere(
        '(user.username LIKE :keyword OR profile.nickname LIKE :keyword OR user.phone LIKE :keyword OR user.email LIKE :keyword)',
        { keyword: `%${options.keyword}%` },
      );
    }

    // 用户类型过滤
    if (options.userType) {
      queryBuilder.andWhere('user.userType = :userType', {
        userType: options.userType,
      });
    }

    // 认证状态过滤
    if (options.verificationStatus) {
      queryBuilder.andWhere('user.verificationStatus = :verificationStatus', {
        verificationStatus: options.verificationStatus,
      });
    }

    // 企业认证状态过滤
    if (options.enterpriseVerificationStatus) {
      queryBuilder.andWhere('user.enterpriseVerificationStatus = :enterpriseVerificationStatus', {
        enterpriseVerificationStatus: options.enterpriseVerificationStatus,
      });
    }

    // 账户状态过滤
    if (options.status) {
      queryBuilder.andWhere('user.status = :status', {
        status: options.status,
      });
    }

    // 风险等级过滤
    if (options.riskLevel) {
      queryBuilder.andWhere('user.riskLevel = :riskLevel', {
        riskLevel: options.riskLevel,
      });
    }

    // 注册时间范围过滤
    if (options.startDate) {
      queryBuilder.andWhere('user.createdAt >= :startDate', {
        startDate: options.startDate,
      });
    }
    if (options.endDate) {
      queryBuilder.andWhere('user.createdAt <= :endDate', {
        endDate: options.endDate,
      });
    }
  }

  /**
   * 应用排序
   */
  private applySorting(queryBuilder: SelectQueryBuilder<UserEntity>, options: UserQueryOptions): void {
    const sortOrder = options.sortOrder || 'DESC';

    switch (options.sortBy) {
      case 'lastLoginAt':
        queryBuilder.orderBy('user.lastLoginAt', sortOrder);
        break;
      case 'creditScore':
        queryBuilder.orderBy('user.creditScore', sortOrder);
        break;
      case 'createdAt':
      default:
        queryBuilder.orderBy('user.createdAt', sortOrder);
        break;
    }
  }
}
