import { Entity, Column, Index, OneToOne } from 'typeorm';
import { Expose, Exclude } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { UserType, VerificationStatus, EnterpriseVerificationStatus, RiskLevel, AccountStatus } from '../enums';
import { UserProfileEntity } from './user-profile.entity';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';

/**
 * 用户实体
 *
 * 系统中的基础行为主体，可以是个人或企业代表
 * 不区分出租方/承租方身份，同一用户可同时是出租方和承租方
 */
@Entity('user')
@Index(['email'], { unique: true, where: 'deleted_at IS NULL' })
@Index(['username'])
@Index(['wechatOpenid'])
@Index(['wechatUnionid'])
export class UserEntity extends BaseEntity {
  /**
   * 用户名
   */
  @Expose()
  @ColumnWithApi({ length: 50, nullable: true, comment: '用户名', optional: true })
  username?: string;

  /**
   * 头像
   */
  @Expose()
  @ColumnWithApi({ length: 255, nullable: true, comment: '头像', optional: true })
  avatar?: string;

  /**
   * 手机号（唯一）
   */
  @Expose()
  @ColumnWithApi({ length: 20, nullable: true, comment: '手机号', optional: true, unique: true })
  phone?: string;

  /**
   * 邮箱（唯一）
   */
  @Expose()
  @ColumnWithApi({ length: 100, nullable: true, comment: '邮箱', optional: true })
  email?: string;

  /**
   * 密码（加密存储）
   */
  @Exclude()
  @Column({ length: 255, nullable: true, comment: '密码（加密存储）' })
  password?: string;

  /**
   * 用户类型：personal（个人）/ enterprise（企业）
   */
  @Expose()
  @ColumnWithApi({
    type: 'enum',
    enum: UserType,
    default: UserType.PERSONAL,
    comment: '用户类型：personal（个人）/ enterprise（企业）',
  })
  userType: UserType;

  /**
   * 实名认证状态：unverified（未认证）/ verified（已认证）/ rejected（已拒绝）
   * 仅用于个人用户（userType=personal）
   */
  @Expose()
  @ColumnWithApi({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.UNVERIFIED,
    comment: '实名认证状态（个人）：unverified/verified/rejected',
  })
  verificationStatus: VerificationStatus;

  /**
   * 企业认证状态：pending（待审核）/ verified（已通过）/ rejected（已拒绝）
   * 仅用于企业用户（userType=enterprise），null 表示未提交
   */
  @Expose()
  @ColumnWithApi({
    type: 'enum',
    enum: EnterpriseVerificationStatus,
    nullable: true,
    comment: '企业认证状态：pending/verified/rejected，需后台审核',
    apiOptions: { enum: EnterpriseVerificationStatus },
  })
  enterpriseVerificationStatus?: EnterpriseVerificationStatus | null;

  /**
   * 企业认证通过时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '企业认证通过时间',
    optional: true,
    apiOptions: {
      type: 'string',
    },
  })
  enterpriseVerifiedAt?: Date | null;

  /**
   * 人脸识别状态：unverified（未认证）/ verified（已认证）/ rejected（已拒绝）
   */
  @Expose()
  @ColumnWithApi({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.UNVERIFIED,
    comment: '人脸识别状态：unverified（未认证）/ verified（已认证）/ rejected（已拒绝）',
  })
  faceRecognitionStatus: VerificationStatus;

  /**
   * 实名认证时间
   */
  @Expose()
  @ColumnWithApi({ type: 'timestamp', nullable: true, comment: '实名认证时间', optional: true })
  verifiedAt?: Date;

  /**
   * 信用评分（0-1000）
   */
  @Expose()
  @ColumnWithApi({
    type: 'int',
    default: 500,
    comment: '信用评分（0-1000）',
  })
  creditScore: number;

  /**
   * 风险等级：low（低）/ medium（中）/ high（高）
   */
  @Expose()
  @ColumnWithApi({
    type: 'enum',
    enum: RiskLevel,
    default: RiskLevel.MEDIUM,
    comment: '风险等级：low（低）/ medium（中）/ high（高）',
  })
  riskLevel: RiskLevel;

  /**
   * 账户状态：active（正常）/ frozen（冻结）/ banned（封禁）
   */
  @Expose()
  @ColumnWithApi({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
    comment: '账户状态：active（正常）/ frozen（冻结）/ banned（封禁）',
  })
  status: AccountStatus;

  /**
   * 可用余额（分）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '可用余额（分）',
  })
  availableBalance: number;

  /**
   * 冻结余额（分）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '冻结余额（分）',
  })
  frozenBalance: number;

  /**
   * 最后登录时间
   */
  @Expose()
  @ColumnWithApi({ type: 'timestamp', nullable: true, comment: '最后登录时间', optional: true })
  lastLoginAt?: Date;

  /**
   * 最后登录 IP
   */
  @Expose()
  @ColumnWithApi({ length: 50, nullable: true, comment: '最后登录 IP', optional: true })
  lastLoginIp?: string;

  /**
   * 每天最多可创建的资产数量
   */
  @Expose()
  @ColumnWithApi({ type: 'int', default: 10, comment: '每天最多可创建的资产数量' })
  maxDailyAssetCreationCount: number;

  /**
   * 总资产数量限制（0 表示不限制）
   */
  @Expose()
  @ColumnWithApi({
    type: 'int',
    default: 50,
    comment: '总资产数量限制（0 表示不限制）',
  })
  maxTotalAssetCount: number;

  @Expose()
  @ColumnWithApi({
    type: 'int',
    default: 200,
    comment: '最多可创建的资产实例数量',
  })
  maxTotalAssetInventoryCount: number;

  /**
   * 注册来源
   */
  @Exclude()
  @ColumnWithApi({
    length: 100,
    nullable: true,
    comment: '注册来源',
    default: 'website',
  })
  source: string = 'website';

  /** =========================================== 微信相关 =========================================== */

  /**
   * 微信 openid
   */
  @Exclude()
  @ColumnWithApi({ length: 100, nullable: true, comment: '微信 openid', optional: true })
  wechatOpenid?: string;

  /**
   * 微信 unionid
   */
  @Exclude()
  @ColumnWithApi({ length: 100, nullable: true, comment: '微信 unionid', optional: true })
  wechatUnionid?: string;

  /** =========================================== 支付宝相关 =========================================== */

  /**
   * 支付宝 open_id（用于提现打款）
   */
  @Exclude()
  @ColumnWithApi({ length: 100, nullable: true, comment: '支付宝 open_id（用于提现打款）', optional: true })
  alipayOpenid?: string;

  /**
   * 支付宝 unionid
   */
  @Exclude()
  @ColumnWithApi({ length: 100, nullable: true, comment: '支付宝 unionid', optional: true })
  alipayUnionid?: string;

  /** =========================================== RELATIONS =========================================== */
  /**
   * 用户资料（一对一关系）
   */
  @OneToOne(() => UserProfileEntity, profile => profile.user, {
    cascade: true,
    eager: false,
  })
  profile?: UserProfileEntity;

  /**
   * 是否已完成认证（个人实名 或 企业认证通过）
   */
  get isVerified(): boolean {
    return this.verificationStatus === VerificationStatus.VERIFIED;
  }

  /**
   * 是否已完成企业认证
   */
  get isEnterpriseVerified(): boolean {
    return this.enterpriseVerificationStatus === EnterpriseVerificationStatus.VERIFIED;
  }
}
