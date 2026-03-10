import { Entity, OneToOne, JoinColumn, Index } from 'typeorm';
import { Expose, Exclude } from 'class-transformer';
import { BaseAreaNumericIdEntity } from '@/infrastructure/database/entities/base.entity';
import { UserEntity } from './user.entity';
import { Gender } from '../enums';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { IsEnum, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

/**
 * 紧急联系人单条结构（JSON 项）
 */
export interface EmergencyContactItem {
  /** 姓名 */
  name: string;
  /** 手机号 */
  phone: string;
  /** 关系类型，如：父母、配偶、子女、朋友等 */
  relationshipType: string;
}

/**
 * 用户资料实体
 *
 * 存储用户的展示信息和扩展资料
 * 与 UserEntity 一对一关系，支持个人和企业用户的差异化字段
 */
@Entity('user_profile')
@Index(['userId'], { unique: true })
export class UserProfileEntity extends BaseAreaNumericIdEntity {
  /**
   * 用户 ID（外键）
   */
  @ColumnWithApi({ type: 'uuid', name: 'user_id', comment: '用户 ID' })
  userId: string;

  /**
   * 头像 URL
   */
  @Expose()
  @ColumnWithApi({ length: 500, nullable: true, comment: '头像 URL', optional: true })
  avatar?: string;

  /**
   * 昵称
   */
  @Expose()
  @ColumnWithApi({ length: 50, nullable: true, comment: '昵称', optional: true })
  nickname?: string;

  /**
   * 个人简介
   */
  @Expose()
  @ColumnWithApi({ type: 'text', nullable: true, comment: '个人简介', optional: true })
  bio?: string;

  // ========== 个人用户字段 ==========

  /**
   * 真实姓名（实名认证后）
   */
  @Expose()
  @ColumnWithApi({ length: 50, nullable: true, comment: '真实姓名（实名认证后）', optional: true })
  @IsNotEmpty()
  @MaxLength(50)
  realName?: string;

  /**
   * 性别
   */
  @Expose()
  @ColumnWithApi({
    type: 'enum',
    enum: Gender,
    nullable: true,
    comment: '性别：unknown/male/female',
    default: Gender.UNKNOWN,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;

  /**
   * 生日
   */
  @Expose()
  @ColumnWithApi({ type: 'date', nullable: true, comment: '生日', optional: true })
  birthday?: Date;

  /**
   * 身份证号（加密存储，实名认证后）
   */
  @Expose()
  @ColumnWithApi({ length: 256, nullable: true, comment: '身份证号（加密存储）', optional: true })
  @IsNotEmpty()
  @MaxLength(256)
  idCard?: string;

  /**
   * 身份证照片地址
   */
  @Expose()
  @ColumnWithApi({ type: 'simple-array', nullable: true, comment: '身份证照片地址', optional: true })
  idCardPhotoUrls?: string[];

  /**
   * 身份证地址
   */
  @Expose()
  @ColumnWithApi({ type: 'varchar', length: 255, nullable: true, comment: '身份证地址', optional: true })
  @IsOptional()
  @MaxLength(255)
  idCardAddress?: string;

  /**
   * 身份证有效期开始日期
   */
  @Expose()
  @ColumnWithApi({ type: 'date', nullable: true, comment: '身份证有效期开始日期', optional: true })
  idCardStartDate?: Date;

  /**
   * 身份证有效期结束日期
   */
  @Expose()
  @ColumnWithApi({ type: 'date', nullable: true, comment: '身份证有效期结束日期', optional: true })
  idCardEndDate?: Date;

  /**
   * 身份证签发机关
   */
  @Expose()
  @ColumnWithApi({ length: 255, nullable: true, comment: '身份证签发机关', optional: true })
  @IsOptional()
  @MaxLength(255)
  idCardIssue?: string;

  /**
   * 身份证详细信息快照
   */
  @Exclude()
  @ColumnWithApi({ type: 'json', nullable: true, comment: '身份证详细信息快照', optional: true })
  @IsOptional()
  idCardSnapshot?: Record<string, any>;

  /**
   * 个人地址
   */
  @Expose()
  @ColumnWithApi({ length: 500, nullable: true, comment: '个人地址', optional: true })
  address?: string;

  // =========================================== 企业用户字段 ===========================================

  /**
   * 企业名称
   */
  @Expose()
  @ColumnWithApi({ length: 200, nullable: true, comment: '企业名称', optional: true })
  companyName?: string;

  /**
   * 统一社会信用代码
   */
  @Expose()
  @ColumnWithApi({ length: 50, nullable: true, comment: '统一社会信用代码', optional: true })
  businessLicense?: string;

  /**
   * 法人代表
   */
  @Expose()
  @ColumnWithApi({ length: 50, nullable: true, comment: '法人代表', optional: true })
  legalRepresentative?: string;

  /**
   * 企业地址
   */
  @Expose()
  @ColumnWithApi({ length: 500, nullable: true, comment: '企业地址', optional: true })
  companyAddress?: string;

  /**
   * 企业联系电话
   */
  @Expose()
  @ColumnWithApi({ length: 20, nullable: true, comment: '企业联系电话', optional: true })
  companyPhone?: string;

  /**
   * 企业邮箱
   */
  @Expose()
  @ColumnWithApi({ length: 100, nullable: true, comment: '企业邮箱', optional: true })
  companyEmail?: string;

  /**
   * 营业执照照片地址（企业认证必填）
   */
  @Expose()
  @ColumnWithApi({ type: 'simple-array', nullable: true, comment: '营业执照照片地址', optional: true })
  businessLicensePhotoUrls?: string[];

  /**
   * 附件材料地址（企业认证可选，如补充证明材料等）
   */
  @Expose()
  @ColumnWithApi({ type: 'simple-array', nullable: true, comment: '附件材料地址', optional: true })
  attachmentUrls?: string[];

  // =========================================== 扩展字段 ===========================================

  /**
   * 紧急联系人 1～3（JSON 数组，每项：姓名 name、手机号 phone、关系类型 relationshipType）
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '紧急联系人（JSON 数组，最多3个，每项含姓名、手机号、关系类型）',
    optional: true,
    apiOptions: {
      example: [
        { name: '张三', phone: '13800138000', relationshipType: '父母' },
        { name: '李四', phone: '13900139000', relationshipType: '配偶' },
        { name: '王五', phone: '13700137000', relationshipType: '朋友' },
      ],
    },
  })
  emergencyContacts?: EmergencyContactItem[];

  /**
   * 标签（JSON 数组，如：["优质出租方", "认证企业"]）
   */
  @Expose()
  @ColumnWithApi({
    type: 'simple-array',
    nullable: true,
    comment: '标签（JSON 数组）',
    optional: true,
    apiOptions: {
      example: ['优质出租方', '认证企业'],
    },
  })
  tags?: string[];

  /**
   * 个人偏好设置（JSON 对象）
   */
  @Exclude()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '个人偏好设置（JSON 对象）',
    optional: true,
    apiOptions: {
      example: { theme: 'dark', notifications: true },
    },
  })
  preferences?: Record<string, unknown>;

  /**
   * 其他设置（JSON 对象）
   */
  @Exclude()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '其他设置（JSON 对象）',
    optional: true,
    apiOptions: {
      example: { theme: 'dark', notifications: true },
    },
  })
  settings?: Record<string, unknown>;

  /** =========================================== RELATIONS =========================================== */
  /**
   * 用户关系（一对一）
   */
  @OneToOne(() => UserEntity, user => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
